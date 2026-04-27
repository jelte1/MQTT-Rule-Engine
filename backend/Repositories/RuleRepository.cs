using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.Interfaces;
using backend.Entities;
using backend.Extensions;

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

    public async Task<IEnumerable<Rule>> GetActiveRulesByConditionTopic(int topicId)
    {
        return await _context.Rules
            .Include(r => r.ConditionTopic)
            .Include(r => r.ActionTopic)
            .ThenInclude(t => t.Device)
            .Where(r => r.ConditionTopicId == topicId && r.IsActive)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Rule>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId)
    {
        var validSortOrder = sortingOrder?.ToLower() == "asc" ? "ASC" : "DESC";
        var validSortField = GetValidSortField(sortingField);
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(r => r.Name.Contains(filterQuery) || 
                                          r.Description.Contains(filterQuery)
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
            "isActive" => "IsActive",
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
                                     r.Description.Contains(filterQuery)
            );
        }
        
        return await query.CountAsync();
    }
}