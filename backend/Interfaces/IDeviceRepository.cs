using backend.Entities;

namespace backend.Interfaces;

public interface IDeviceRepository : IRepository<Device>
{
    Task<IEnumerable<Device>> GetAllWithConnectionAsync();
}
