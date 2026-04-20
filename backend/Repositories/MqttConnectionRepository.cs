using backend.Database;
using Microsoft.EntityFrameworkCore;
using backend.Entities;
using backend.Interfaces;

namespace backend.Repositories;

public class MqttConnectionRepository : Repository<MqttConnection>, IMqttConnectionRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public MqttConnectionRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MqttConnection>> GetActiveAsync()
    {
        var connections = await _context.MqttConnections.Where(c => c.IsActive).ToListAsync();
        return connections;
    }

    public async Task<IEnumerable<MqttConnection>> GetAllByUserId(string userId)
    {
        var connections = await _context.MqttConnections.Where(c => c.UserId == userId).ToListAsync();
        return connections;
    }
}