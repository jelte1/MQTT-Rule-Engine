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
    
    private IQueryable<MqttConnection> UserQuery(string userId)
    {
        return _context.MqttConnections
            .Where(c => c.UserId == userId);
    }
    
    public async Task<MqttConnection?> GetByIdAndUserIdAsync(int id, string userId)
    {
        return await UserQuery(userId)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<MqttConnection>> GetActiveAsync()
    {
        var connections = await _context.MqttConnections.Where(c => c.IsActive).ToListAsync();
        return connections;
    }

    public async Task<IEnumerable<MqttConnection>> GetAllByUserId(string userId)
    {
        var connections = await UserQuery(userId).ToListAsync();
        return connections;
    }
}