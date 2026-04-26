using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.DTOs.SensorData;
using backend.Interfaces;
using backend.Entities;
using System.Linq.Dynamic.Core;
using backend.Extensions;

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
            .ToListAsync();
        return sensorData;
    }
    
    public async Task<IEnumerable<SensorData>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId)
    {
        var validSortOrder = sortingOrder?.ToLower() == "asc" ? "ASC" : "DESC";
        var validSortField = GetValidSortField(sortingField);
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(sd => sd.Topic.Name.Contains(filterQuery) || 
                                      sd.Topic.TopicPath.Contains(filterQuery) || 
                                      sd.RawPayload.Contains(filterQuery));
        }
        
        var sensorData = await query
            .ApplySort(validSortField, validSortOrder)
            .Skip(offset)
            .Take(size)
            .ToListAsync();
        return sensorData;
    }

    private static string GetValidSortField(string? sortField)
    {
        return sortField?.ToLower() switch
        {
            "topicname" => "Topic.Name",
            "topicpath" => "Topic.TopicPath",
            "rawpayload" => "RawPayload",
            "receivedat" => "ReceivedAt",
            _ => "ReceivedAt"
        };
    }

    public async Task<int> GetTotalCount(string userId, string filterQuery)
    {
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(sd => sd.Topic.Name.Contains(filterQuery) || 
                                      sd.Topic.TopicPath.Contains(filterQuery) || 
                                      sd.RawPayload.Contains(filterQuery));
        }
        
        return await query.CountAsync();
    }
}
