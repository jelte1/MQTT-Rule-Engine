using backend.Database;
using Microsoft.EntityFrameworkCore;
using backend.Entities;
using backend.Extensions;
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
    
    public async Task<IEnumerable<MqttConnection>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId)
    {
        var validSortOrder = sortingOrder?.ToLower() == "asc" ? "ASC" : "DESC";
        var validSortField = GetValidSortField(sortingField);
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(r => r.Name.Contains(filterQuery) || 
                                                r.Host.Contains(filterQuery)
            );
        }
        
        var rules = await query
            .ApplySort(validSortField, validSortOrder)
            .Skip(offset)
            .Take(size)
            .ToListAsync();
        return rules;
    }

    private static string GetValidSortField(string? sortField)
    {
        return sortField?.ToLower() switch
        {
            "name" => "Name",
            "description" => "Description",
            "host" => "Host",
            "isactive" => "IsActive",
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
                                     r.Host.Contains(filterQuery)
            );
        }
        
        return await query.CountAsync();
    }
}