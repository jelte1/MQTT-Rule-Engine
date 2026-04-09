using backend.Database;
using Microsoft.EntityFrameworkCore;
using backend.Entities;
using backend.Interfaces;

namespace backend.Repositories;

public class MqttMqttConnectionRepository : Repository<MqttConnection>, IMqttConnectionRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public MqttMqttConnectionRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MqttConnection>> GetActiveAsync()
    {
        var connections = await _context.Set<MqttConnection>().Where(c => c.IsActive).ToListAsync();
        return connections;
    }
}
