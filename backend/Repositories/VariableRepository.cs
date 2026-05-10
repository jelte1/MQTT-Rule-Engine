using backend.Database;
using backend.Entities;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class VariableRepository : Repository<Variable>, IVariableRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public VariableRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }
    
    private IQueryable<Variable> UserQuery(string userId)
    {
        return _context.Variables
            .Include(v => v.Topic)
            .ThenInclude(t => t.Device)
            .ThenInclude(d => d.MqttConnection)
            .Where(v => v.Topic.Device.MqttConnection.UserId == userId);
    }
    
    public async Task<Variable?> GetByIdAndUserIdAsync(int id, string userId)
    {
        return await UserQuery(userId)
            .FirstOrDefaultAsync(d =>
                d.Id == id
            );
    }
    
    public async Task<IEnumerable<Variable>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId)
    {
        var validSortOrder = sortingOrder?.ToLower() == "asc" ? "ASC" : "DESC";
        var validSortField = GetValidSortField(sortingField);
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(v => v.Name.Contains(filterQuery) || 
                                             v.Description.Contains(filterQuery) ||
                                             v.Value.Contains(filterQuery)
            );
        }
        
        var variables = await query
            .ApplySort(validSortField, validSortOrder)
            .Skip(offset)
            .Take(size)
            .ToListAsync();
        return variables;
    }

    private static string GetValidSortField(string? sortField)
    {
        return sortField?.ToLower() switch
        {
            "name" => "Name",
            "description" => "Description",
            "createdat" => "CreatedAt",
            "updatedat" => "UpdatedAt",
            "value" => "Value",
            _ => "CreatedAt"
        };
    }

    public async Task<int> GetTotalCount(string userId, string filterQuery)
    {
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(v => v.Name.Contains(filterQuery) ||
                                             v.Description.Contains(filterQuery) ||
                                             v.Value.Contains(filterQuery)
            );
        }
        
        return await query.CountAsync();
    }
}