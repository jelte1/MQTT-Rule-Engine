using AutoMapper;
using backend.DTOs.SensorData;
using backend.Entities;
using backend.Hubs;
using backend.Interfaces;
using Microsoft.AspNetCore.SignalR;
using MQTTnet;
using MQTTnet.Client;

namespace backend.Services;

public class MqttClientManager : IMqttClientManager, IHostedService
{
    private readonly Dictionary<int, IMqttClient> _clients = new();
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);
    private readonly IHubContext<SensorDataHub> _sensorDataHubContext;
    private readonly IMapper _mapper;

    public MqttClientManager(IServiceScopeFactory scopeFactory, IHubContext<SensorDataHub> sensorDataHubContext, IMapper mapper)
    {
        _scopeFactory = scopeFactory;
        _sensorDataHubContext = sensorDataHubContext;
        _mapper = mapper;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        // scope since IMqttConnectionRepository is scoped and this is singleton service
        using var scope = _scopeFactory.CreateScope();
        var mqttConnectionRepository = scope.ServiceProvider.GetRequiredService<IMqttConnectionRepository>();
        var mqttConnections = await mqttConnectionRepository.GetActiveAsync();

        foreach (var conn in mqttConnections)
        {
            try
            {
                await Connect(conn);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            foreach (var (id, client) in _clients)
            {
                if (client.IsConnected)
                {
                    await client.DisconnectAsync(cancellationToken: cancellationToken);
                }

                client.Dispose();
            }

            _clients.Clear();
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task Connect(MqttConnection connection)
    {
        await _lock.WaitAsync();
        try
        {
            if (_clients.TryGetValue(connection.Id, out var existing))
            {
                if (existing.IsConnected)
                {
                    await existing.DisconnectAsync();
                }

                existing.Dispose();
                _clients.Remove(connection.Id);
            }

            var factory = new MqttFactory();
            var client = factory.CreateMqttClient();

            // receiving messages from mqtt
            client.ApplicationMessageReceivedAsync += async e =>
            {
                var topicPath = e.ApplicationMessage.Topic;
                var payload = e.ApplicationMessage.ConvertPayloadToString() ?? string.Empty;

                using var scope = _scopeFactory.CreateScope();
                var sensorDataRepository = scope.ServiceProvider.GetRequiredService<ISensorDataRepository>();
                var topicRepository = scope.ServiceProvider.GetRequiredService<ITopicRepository>();
                var ruleEngineService = scope.ServiceProvider.GetRequiredService<IRuleEngineService>();

                var topic = await topicRepository.GetByPathAndMqttConnectionAsync(topicPath, connection.Id);

                if (topic == null)
                {
                    return;
                }

                var sensorData = await sensorDataRepository.AddAsync(
                    new SensorData
                    {
                        RawPayload = payload,
                        ReceivedAt = DateTime.Now,
                        TopicId = topic.Id
                    }
                );
                await sensorDataRepository.SaveChangesAsync();

                var sensorDataDto = _mapper.Map<SensorDataDto>(sensorData);

                var userId = topic.Device.MqttConnection.UserId;

                if (!string.IsNullOrEmpty(userId))
                {
                    await _sensorDataHubContext
                        .Clients
                        .Group(userId)
                        .SendAsync("SensorDataUpdate", sensorDataDto);
                }

                await ruleEngineService.ProcessMessage(topic.Device.MqttConnection, topic, payload);
            };

            var optionsBuilder = new MqttClientOptionsBuilder()
                .WithTcpServer(connection.Host, connection.Port)
                .WithCleanSession()
                .WithKeepAlivePeriod(TimeSpan.FromSeconds(30));

            if (!string.IsNullOrEmpty(connection.ClientId))
            {
                optionsBuilder.WithClientId(connection.ClientId);
            }
            else
            {
                optionsBuilder.WithClientId("MqttRuleEngine-" + connection.Id + "-" + Guid.NewGuid());
            }

            if (!string.IsNullOrEmpty(connection.Username))
            {
                optionsBuilder.WithCredentials(connection.Username, connection.Password ?? string.Empty);
            }

            if (connection.UseTls)
            {
                optionsBuilder.WithTlsOptions(o => o.UseTls());
            }

            var options = optionsBuilder.Build();
            await client.ConnectAsync(options);
            _clients[connection.Id] = client;

            client.DisconnectedAsync += async e =>
            {
                if (!e.ClientWasConnected) return;

                Console.WriteLine($"Client {connection.Id} disconnected: {e.Reason}. Reconnecting in 5s...");
                await Task.Delay(TimeSpan.FromSeconds(5));

                try
                {
                    await client.ConnectAsync(options);
                    await SubscribeTopics(client, connection.Id);
                    Console.WriteLine($"Reconnected to {connection.Host}:{connection.Port}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Reconnect failed for connection {connection.Id}: {ex.Message}");
                }
            };

            await SubscribeTopics(client, connection.Id);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task Disconnect(int mqttConnectionId)
    {
        await _lock.WaitAsync();
        try
        {
            if (_clients.TryGetValue(mqttConnectionId, out var existing))
            {
                if (existing.IsConnected)
                {
                    await existing.DisconnectAsync();
                }

                existing.Dispose();
                _clients.Remove(mqttConnectionId);
            }
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task SubscribeTopics(IMqttClient client, int connectionId)
    {
        // scoped again since ITopicRepository is scoped and this is singleton service
        using var scope = _scopeFactory.CreateScope();
        var topicRepository = scope.ServiceProvider.GetRequiredService<ITopicRepository>();
        var topics = (await topicRepository.GetIncomingByConnectionId(connectionId)).ToList();

        if (topics.Count == 0)
        {
            return;
        }

        foreach (var topic in topics)
        {
            await client.SubscribeAsync(new MqttTopicFilterBuilder()
                .WithTopic(topic.TopicPath)
                .Build());
            Console.WriteLine($"Subscribed to topic {topic.TopicPath}");
        }
    }

    public async Task Publish(Topic topic, string payload)
    {
        await _lock.WaitAsync();
        try
        {
            if (_clients.TryGetValue(topic.Device.MqttConnectionId, out var client) && client.IsConnected)
            {
                var message = new MqttApplicationMessageBuilder()
                    .WithTopic(topic.TopicPath)
                    .WithPayload(payload)
                    .Build();

                await client.PublishAsync(message);
                Console.WriteLine($"Published message to topic {topic.TopicPath}: {payload}");
            }
            else
            {
                Console.WriteLine($"Cannot publish to topic {topic.TopicPath} because MQTT client is not connected.");
            }
        }
        finally
        {
            _lock.Release();
        }
    }

    public bool IsConnected(int mqttConnectionId)
    {        
        return _clients.TryGetValue(mqttConnectionId, out var client) && client.IsConnected;
    }
}