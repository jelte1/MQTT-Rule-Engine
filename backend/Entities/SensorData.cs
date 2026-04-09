namespace backend.Entities;

public class SensorData
{
    public int Id { get; set; }
    public string RawPayload { get; set; } = string.Empty;
    public DateTime ReceivedAt { get; set; } = DateTime.Now;
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
}
