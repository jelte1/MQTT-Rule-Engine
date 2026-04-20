using backend.Entities;

namespace backend.Interfaces;

public interface IMqttConnectionRepository : IRepository<MqttConnection>
{
    Task<IEnumerable<MqttConnection>> GetActiveAsync();
    Task<IEnumerable<MqttConnection>> GetAllByUserId(string userId);
}