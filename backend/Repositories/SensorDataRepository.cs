using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.DTOs.SensorData;
using backend.Interfaces;
using backend.Entities;

namespace backend.Repositories;

public class SensorDataRepository : Repository<SensorData>, ISensorDataRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public SensorDataRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<SensorData>> GetLatest(int count)
    {
        var sensorData = await _context.SensorData
            .OrderByDescending(sd => sd.ReceivedAt)
            .Take(count)
            .Include(sd => sd.Topic)
            .ToListAsync();
        return sensorData;
    }
}
