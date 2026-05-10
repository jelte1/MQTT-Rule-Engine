using System.Reflection;
using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace backend.Database;

public class MqttRuleEngineDbContext : IdentityDbContext<User>
{
    public MqttRuleEngineDbContext(DbContextOptions<MqttRuleEngineDbContext> options) : base(options) { }

    public DbSet<MqttConnection> MqttConnections { get; set; }
    public DbSet<Device> Devices { get; set; }
    public DbSet<Topic> Topics { get; set; }
    public DbSet<Rule> Rules { get; set; }
    public DbSet<Variable> Variables { get; set; }
    public DbSet<SensorData> SensorData { get; set; }
    public DbSet<SentData> SentData { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
