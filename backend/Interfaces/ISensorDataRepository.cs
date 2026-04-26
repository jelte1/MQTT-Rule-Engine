using backend.DTOs.SensorData;
using backend.Entities;

namespace backend.Interfaces;

public interface ISensorDataRepository : IRepository<SensorData>
{
    Task<IEnumerable<SensorData>> GetLatest(int count, string userId);
    Task<IEnumerable<SensorData>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId);
    Task<int> GetTotalCount(string userId, string filterQuery);
}
