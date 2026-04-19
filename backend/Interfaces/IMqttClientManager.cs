using backend.Entities;

namespace backend.Interfaces;

public interface IMqttClientManager
{
    Task Connect(MqttConnection mqttConnection);
    Task Disconnect(int mqttConnectionId);
}