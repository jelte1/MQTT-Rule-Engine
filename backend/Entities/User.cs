using Microsoft.AspNetCore.Identity;

namespace backend.Entities;

public class User : IdentityUser
{
    public ICollection<MqttConnection> MqttConnections { get; set; } = new List<MqttConnection>();
}