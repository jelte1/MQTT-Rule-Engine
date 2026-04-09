using backend.Entities;

namespace backend.Interfaces;

public interface IMqttConnectionRepository : IRepository<MqttConnection>
{
    Task<IEnumerable<MqttConnection>> GetActiveAsync();
}
