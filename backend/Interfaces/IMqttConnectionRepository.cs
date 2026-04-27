using backend.Entities;

namespace backend.Interfaces;

public interface IMqttConnectionRepository : IRepository<MqttConnection>
{
    Task<MqttConnection?> GetByIdAndUserIdAsync(int id, string userId);
    Task<IEnumerable<MqttConnection>> GetActiveAsync();
    Task<IEnumerable<MqttConnection>> GetAllByUserId(string userId);
    Task<IEnumerable<MqttConnection>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId);
    Task<int> GetTotalCount(string userId, string filterQuery);
}