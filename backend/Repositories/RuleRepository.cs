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
}
