using backend.DTOs.Topic;

namespace backend.DTOs.SensorData;

public class SensorDataDto
{
    public int Id { get; set; }
    public string RawPayload { get; set; } = string.Empty;
    public DateTime ReceivedAt { get; set; } = DateTime.Now;
    public int TopicId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public string TopicPath { get; set; } = string.Empty;
}

public class CreateSensorDataDto
{
    public string RawPayload { get; set; } = string.Empty;
    public int TopicId { get; set; }
}