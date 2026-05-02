using backend.Database;
using backend.Entities;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class SentDataRepository : Repository<SentData>, ISentDataRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public SentDataRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }
    
    private IQueryable<SentData> UserQuery(string userId)
    {
        return _context.SentData
            .Include(s => s.SentTopic)
            .ThenInclude(t => t.Device)
            .ThenInclude(d => d.MqttConnection)
            .Where(t => t.SentTopic.Device.MqttConnection.UserId == userId);
    }
    
    public async Task<SentData?> GetByIdAndUserIdAsync(int id, string userId)
    {
        return await UserQuery(userId)
            .Include(r => r.Rule)
            .FirstOrDefaultAsync(t => t.Id == id);
    }
    
    public async Task<IEnumerable<SentData>> GetBySensorDataIdAsync(int sensorDataId, string userId)
    {
        return await UserQuery(userId)
            .Include(s => s.TriggerSensorData)
            .Include(r => r.Rule)
            .Where(sd => sd.TriggerSensorDataId == sensorDataId)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<SentData>> GetLatest(int count, string userId)
    {
        var sensorData = await UserQuery(userId)
            .OrderByDescending(sd => sd.SentAt)
            .Take(count)
            .ToListAsync();
        return sensorData;
    }
    
    public async Task<IEnumerable<SentData>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId)
    {
        var validSortOrder = sortingOrder?.ToLower() == "asc" ? "ASC" : "DESC";
        var validSortField = GetValidSortField(sortingField);
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(sd => sd.SentTopic.Name.Contains(filterQuery) || 
                                      sd.SentTopic.TopicPath.Contains(filterQuery) || 
                                      sd.Payload.Contains(filterQuery));
        }
        
        var sentData = await query
            .Include(s => s.TriggerSensorData)
            .ApplySort(validSortField, validSortOrder)
            .Skip(offset)
            .Take(size)
            .ToListAsync();
        return sentData;
    }

    private static string GetValidSortField(string? sortField)
    {
        return sortField?.ToLower() switch
        {
            "topicname" => "Topic.Name",
            "topicpath" => "Topic.TopicPath",
            "payload" => "Payload",
            "sentat" => "SentAt",
            _ => "sentAt"
        };
    }

    public async Task<int> GetTotalCount(string userId, string filterQuery)
    {
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(sd => sd.SentTopic.Name.Contains(filterQuery) || 
                                      sd.SentTopic.TopicPath.Contains(filterQuery) || 
                                      sd.Payload.Contains(filterQuery));
        }
        
        return await query.CountAsync();
    }
}