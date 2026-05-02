using backend.Entities;

namespace backend.Interfaces;

public interface ISentDataRepository : IRepository<SentData>
{
    Task<SentData?> GetByIdAndUserIdAsync(int id, string userId);
    Task<IEnumerable<SentData>> GetBySensorDataIdAsync(int sensorDataId, string userId);
    Task<IEnumerable<SentData>> GetLatest(int count, string userId);
    Task<IEnumerable<SentData>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId);
    Task<int> GetTotalCount(string userId, string filterQuery);
}