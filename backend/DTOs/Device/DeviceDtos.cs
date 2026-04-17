using backend.DTOs.MqttConnection;
using backend.DTOs.Topic;

namespace backend.DTOs.Device;

public class DeviceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int MqttConnectionId { get; set; }
    public string ConnectionName { get; set; } = string.Empty;
}

public class CreateDeviceDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MqttConnectionId { get; set; }
}