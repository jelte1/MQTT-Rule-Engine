using backend.Entities;

namespace backend.DTOs.SentData;

public class SentDataDto
{
    public int Id { get; set; }
    public DateTime SentAt { get; set; } = DateTime.Now;
    public string Payload { get; set; } = string.Empty;
    
    public SentDataType Type { get; set; }
    
    public SentDataStatus Status { get; set; } = SentDataStatus.Sent;
    public string? ErrorMessage { get; set; } 
    
    public int SentTopicId { get; set; }
    public string SentTopicName { get; set; }  = string.Empty;
    public string SentTopicPath { get; set; }  = string.Empty;
    
    public int RuleId { get; set; }
    public string RuleName { get; set; } = string.Empty;

    public int TriggerSensorDataId { get; set; }
    public string TriggerSensorDataPayload { get; set; }  = string.Empty;
}