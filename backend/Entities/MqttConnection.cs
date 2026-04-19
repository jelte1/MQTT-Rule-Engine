using System.ComponentModel.DataAnnotations;

namespace backend.Entities;

public class MqttConnection
{
    public int Id { get; set; }
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(50)]
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 1883;
    [MaxLength(50)]
    public string? Username { get; set; }
    [MaxLength(100)]
    public string? Password { get; set; }
    public string? ClientId { get; set; }
    public bool UseTls { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public ICollection<Device> Devices { get; set; } = new List<Device>();
}
