using backend.Entities;

namespace backend.Interfaces;

public interface ITopicRepository : IRepository<Topic>
{
    Task<IEnumerable<Topic>> GetAllWithDeviceAsync();
    Task<IEnumerable<Topic>> GetIncomingByConnectionId(int connectionId);
    Task<Topic?> GetByPathAndMqttConnectionAsync(string path, int mqttConnectionId);
}
