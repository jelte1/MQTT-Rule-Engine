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
    
    public async Task<IEnumerable<Topic>> GetAllWithDeviceAsync()
    {
        var topics = await _context.Topics.Include(t => t.Device).ToListAsync();
        return topics;
    }
    
    public async Task<IEnumerable<Topic>> GetIncomingByConnectionId(int connectionId)
    {
        var topics = await _context.Topics.Include(t => t.Device)
            .Where(t => t.Device.MqttConnectionId == connectionId 
                && 
                (t.Direction == TopicDirection.Incoming || t.Direction == TopicDirection.Both))
            .ToListAsync();
        return topics;
    }
    
    public async Task<Topic?> GetByPathAndMqttConnectionAsync(string path, int mqttConnectionId)
    {
        var topic = await _context.Topics
            .Include(t => t.Device)
            .FirstOrDefaultAsync(t => t.TopicPath == path 
                                      && 
                                      t.Device.MqttConnectionId == mqttConnectionId
                                      &&
                                      (t.Direction == TopicDirection.Incoming || t.Direction == TopicDirection.Both));
        return topic;
    }
    
}
