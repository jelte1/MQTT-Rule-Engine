using backend.Entities;

namespace backend.Interfaces;

public interface ITopicRepository : IRepository<Topic>
{
    Task<IEnumerable<Topic>> GetAllWithDeviceAsync();
}
