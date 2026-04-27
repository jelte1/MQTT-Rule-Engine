using backend.Entities;

namespace backend.Interfaces;

public interface IDeviceRepository : IRepository<Device>
{
    Task<IEnumerable<Device>> GetAllWithConnectionAsync(string userId);
    Task<Device?> GetByIdAndUserIdAsync(int id, string userId);
    Task<IEnumerable<Device>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId);
    Task<int> GetTotalCount(string userId, string filterQuery);
}
