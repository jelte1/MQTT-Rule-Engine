using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.Interfaces;
using backend.Entities;

namespace backend.Repositories;

public class SensorDataRepository : Repository<SensorData>, ISensorDataRepository
{
    private readonly MqttRuleEngineDbContext _context;

    public SensorDataRepository(MqttRuleEngineDbContext context) : base(context)
    {
        _context = context;
    }
}
