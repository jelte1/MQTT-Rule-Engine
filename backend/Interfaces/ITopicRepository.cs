using backend.Entities;

namespace backend.Interfaces;

public interface ITopicRepository : IRepository<Topic>
{
    Task<IEnumerable<Topic>> GetAllWithDeviceAsync();
    Task<Topic?> GetByIdAndUserIdAsync(int id, string userId);
    Task<IEnumerable<Topic>> GetAllByUserIdAsync(string userId);
    Task<IEnumerable<Topic>> GetIncomingByConnectionId(int connectionId);
    Task<Topic?> GetByPathAndMqttConnectionAsync(string path, int mqttConnectionId);
    Task<IEnumerable<Topic>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId);
    Task<int> GetTotalCount(string userId, string filterQuery);
}
