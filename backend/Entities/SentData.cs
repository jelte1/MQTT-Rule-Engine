namespace backend.Entities;

public enum SentDataStatus
{
    Sent = 0,
    Failed = 1,
}

public enum SentDataType
{
    Action = 0,
    ElseAction = 1
}

public class SentData
{
    public int Id { get; set; }
    public DateTime SentAt { get; set; } = DateTime.Now;
    public string Payload { get; set; } = string.Empty;
    
    public SentDataType Type { get; set; }
    
    public SentDataStatus Status { get; set; } = SentDataStatus.Sent;
    public string? ErrorMessage { get; set; } 
    
    public int SentTopicId { get; set; }
    public Topic SentTopic { get; set; } = null!;
    
    public int RuleId { get; set; }
    public Rule Rule { get; set; } = null!;
    
    public int TriggerSensorDataId { get; set; }
    public SensorData TriggerSensorData { get; set; } = null!;
}