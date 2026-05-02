using backend.Entities;

namespace backend.Interfaces;

public interface IRuleEngineService
{
    Task ProcessMessage(MqttConnection mqttConnection, Topic topic, SensorData sensorData, string payload);
}