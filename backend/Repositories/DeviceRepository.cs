using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.Interfaces;
using backend.Entities;
using backend.Extensions;

namespace backend.Repositories;

public class DeviceRepository : Repository<Device>, IDeviceRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public DeviceRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }
    
    private IQueryable<Device> UserQuery(string userId)
    {
        return _context.Devices
            .Include(d => d.MqttConnection)
            .Where(d => d.MqttConnection.UserId == userId);
    }
    
    
    public async Task<IEnumerable<Device>> GetAllWithConnectionAsync(string userId)
    {
        var devices = await UserQuery(userId)
            .ToListAsync();
        return devices;
    }
    
    public async Task<Device?> GetByIdAndUserIdAsync(int id, string userId)
    {
        return await UserQuery(userId)
            .FirstOrDefaultAsync(d =>
                d.Id == id
            );
    }
    
    public async Task<IEnumerable<Device>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId)
    {
        var validSortOrder = sortingOrder?.ToLower() == "asc" ? "ASC" : "DESC";
        var validSortField = GetValidSortField(sortingField);
        var query = UserQuery(userId);
        
        if (!string.IsNullOrEmpty(filterQuery))
        {
            query = query.Where(r => r.Name.Contains(filterQuery) || 
                                     r.Description.Contains(filterQuery) ||
                                     r.MqttConnection.Name.Contains(filterQuery)
            );
        }
        
        var devices = await query
            .ApplySort(validSortField, validSortOrder)
            .Skip(offset)
            .Take(size)
            .ToListAsync();
        return devices;
    }

    private static string GetValidSortField(string? sortField)
    {
        return sortField?.ToLower() switch
        {
            "name" => "Name",
            "description" => "Description",
            "connectionname" => "MqttConnection.Name",
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
