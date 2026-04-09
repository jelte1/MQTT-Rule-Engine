namespace backend.Entities;

public class Device
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int MqttConnectionId { get; set; }
    public MqttConnection MqttConnection { get; set; } = null!;
    public ICollection<Topic> Topics { get; set; } = new List<Topic>();
}
