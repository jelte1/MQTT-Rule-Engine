using System.ComponentModel.DataAnnotations;

namespace backend.Entities;

public enum TopicDirection
{
    Incoming,
    Outgoing,
    Both
}

public enum DataFormat
{
    Json,
    PlainText,
    Numeric
}

public class Topic
{
    public int Id { get; set; }
    [MaxLength(20)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(200)]
    public string TopicPath { get; set; } = string.Empty;
    [MaxLength(100)]
    public string? Description { get; set; }
    public TopicDirection Direction { get; set; } = TopicDirection.Incoming;
    public DataFormat DataFormat { get; set; } = DataFormat.Json;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    public ICollection<Rule> ConditionRules { get; set; } = new List<Rule>();
    public ICollection<Rule> ActionRules { get; set; } = new List<Rule>();
    public ICollection<SensorData> SensorData { get; set; } = new List<SensorData>();
}
