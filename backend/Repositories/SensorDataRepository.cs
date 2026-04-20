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
    
    private IQueryable<SensorData> UserQuery(string userId)
    {
        return _context.SensorData
            .Include(s => s.Topic)
            .ThenInclude(t => t.Device)
            .ThenInclude(d => d.MqttConnection)
            .Where(t => t.Topic.Device.MqttConnection.UserId == userId);
    }
    
    public async Task<IEnumerable<SensorData>> GetLatest(int count, string userId)
    {
        var sensorData = await UserQuery(userId)
            .OrderByDescending(sd => sd.ReceivedAt)
            .Take(count)
            .Include(sd => sd.Topic)
            .ToListAsync();
        return sensorData;
    }
}
