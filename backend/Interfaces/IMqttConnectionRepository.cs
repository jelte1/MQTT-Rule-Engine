using backend.Entities;

namespace backend.Interfaces;

public interface IMqttConnectionRepository : IRepository<MqttConnection>
{
    Task<MqttConnection?> GetByIdAndUserIdAsync(int id, string userId);
    Task<IEnumerable<MqttConnection>> GetActiveAsync();
    Task<IEnumerable<MqttConnection>> GetAllByUserId(string userId);
}