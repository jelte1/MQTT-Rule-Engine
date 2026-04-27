using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.Interfaces;
using backend.Entities;
using backend.Extensions;

namespace backend.Repositories;

public class TopicRepository : Repository<Topic>, ITopicRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public TopicRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }

    private IQueryable<Topic> UserQuery(string userId)
    {
        return _context.Topics
            .Include(t => t.Device)
            .ThenInclude(d => d.MqttConnection)
            .Where(t => t.Device.MqttConnection.UserId == userId);
    }


    public async Task<IEnumerable<Topic>> GetAllByUserIdAsync(string userId)
    {
        return await UserQuery(userId).ToListAsync();
    }

    public async Task<Topic?> GetByIdAndUserIdAsync(int id, string userId)
    {
        return await UserQuery(userId)
            .FirstOrDefaultAsync(t => t.Id == id);
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
            .ThenInclude(d => d.MqttConnection)
            .FirstOrDefaultAsync(t => t.TopicPath == path
                                      &&
                                      t.Device.MqttConnectionId == mqttConnectionId
                                      &&
                                      (t.Direction == TopicDirection.Incoming || t.Direction == TopicDirection.Both));
        return topic;
    }
    
    public async Task<IEnumerable<Topic>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId)
    {
        var validSortOrder = sortingOrder?.ToLower() == "asc" ? "ASC" : "DESC";
        var validSortField = GetValidSortField(sortingField);
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(r => r.Name.Contains(filterQuery) || 
                                           r.Description.Contains(filterQuery) ||
                                           r.TopicPath.Contains(filterQuery) ||
                                           r.Device.Name.Contains(filterQuery)
            );
        }
        
        var topics = await query
            .ApplySort(validSortField, validSortOrder)
            .Skip(offset)
            .Take(size)
            .ToListAsync();
        return topics;
    }

    private static string GetValidSortField(string? sortField)
    {
        return sortField?.ToLower() switch
        {
            "name" => "Name",
            "description" => "Description",
            "topicpath" => "TopicPath",
            "devicename" => "Device.Name",
            "createdat" => "CreatedAt",
            _ => "CreatedAt"
        };
    }

    public async Task<int> GetTotalCount(string userId, string filterQuery)
    {
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(r => r.Name.Contains(filterQuery) || 
                                     r.Description.Contains(filterQuery) ||
                                     r.TopicPath.Contains(filterQuery) ||
                                     r.Device.Name.Contains(filterQuery)
            );
        }
        
        return await query.CountAsync();
    }
}