using backend.Entities;
using backend.Interfaces;

namespace backend.Tests.Integration;

/// <summary>
/// A no-op (no operations) MQTT client used in integration tests to avoid real broker connections.
/// </summary>
public class NoOpMqttClientManager : IMqttClientManager
{
    public Task Connect(MqttConnection mqttConnection) => Task.CompletedTask;
    public Task Disconnect(int mqttConnectionId) => Task.CompletedTask;
    public Task Publish(Topic topic, string payload) => Task.CompletedTask;
    public bool IsConnected(int mqttConnectionId) => false;
}
