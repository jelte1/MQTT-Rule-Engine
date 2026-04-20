using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.Interfaces;
using backend.Entities;

namespace backend.Repositories;

public class RuleRepository : Repository<Rule>, IRuleRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public RuleRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }
    
    private IQueryable<Rule> UserQuery(string userId)
    {
        return _context.Rules
            .Include(r => r.ConditionTopic)
            .ThenInclude(t => t.Device)
            .ThenInclude(d => d.MqttConnection)
            .Include(r => r.ActionTopic)
            .ThenInclude(t => t.Device)
            .ThenInclude(d => d.MqttConnection)
            .Where(r =>
                r.ConditionTopic.Device.MqttConnection.UserId == userId &&
                r.ActionTopic.Device.MqttConnection.UserId == userId
            );
    }
    
    public async Task<IEnumerable<Rule>> GetAllByUserIdAsync(string userId)
    {
        return await UserQuery(userId).ToListAsync();
    }
    
    public async Task<Rule?> GetByIdAndUserIdAsync(int id, string userId)
    {
        return await UserQuery(userId)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

}
