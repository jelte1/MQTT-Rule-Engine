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
    
    public async Task<IEnumerable<Device>> GetAllWithConnectionAsync()
    {
        var devices = await _context.Set<Device>().Include(d => d.MqttConnection).ToListAsync();
        return devices;
    }
}
