using backend.DTOs.Device;
using backend.DTOs.Rule;
using backend.Entities;

namespace backend.DTOs.Topic;

public class TopicDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TopicPath { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TopicDirection Direction { get; set; } = TopicDirection.Incoming;
    public DataFormat DataFormat { get; set; } = DataFormat.Json;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } =  string.Empty;
}

public class CreateTopicDto
{
    public string Name { get; set; } = string.Empty;
    public string TopicPath { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TopicDirection Direction { get; set; } = TopicDirection.Incoming;
    public DataFormat DataFormat { get; set; } = DataFormat.Json;
    public int DeviceId { get; set; }
}