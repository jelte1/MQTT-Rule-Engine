namespace backend.Controllers.DTOs.MqttConnection;

public class CreateUpdateMqttConnectionDto
{
    public string Name { get; set; } = string.Empty;
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? ClientId { get; set; }
    public bool UseTls { get; set; } = false;
    public bool IsActive { get; set; } = true;
}