using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.Interfaces;
using backend.Entities;

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
}
