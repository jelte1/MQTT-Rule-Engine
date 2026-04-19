using backend.DTOs.SensorData;
using backend.Entities;

namespace backend.Interfaces;

public interface ISensorDataRepository : IRepository<SensorData>
{
    Task<IEnumerable<SensorData>> GetLatest(int count);
}
