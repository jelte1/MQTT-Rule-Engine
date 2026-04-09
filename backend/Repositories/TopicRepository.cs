using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.Interfaces;
using backend.Entities;

namespace backend.Repositories;

public class TopicRepository : Repository<Topic>, ITopicRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public TopicRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }
    
}
