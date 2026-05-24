using backend.Database;
using backend.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace backend.Tests.Integration;

/// <summary>
/// Custom factory that replaces MySQL with an in-memory DB and disables the MQTT hosted service.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    // Unique DB name per factory instance ensures test isolation
    private readonly string _dbName = $"TestDb_{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove the MySQL DbContext registration
            services.RemoveAll<DbContextOptions<MqttRuleEngineDbContext>>();
            services.RemoveAll<MqttRuleEngineDbContext>();

            // Remove the MySQL provider's IDbContextOptionsConfiguration if present
            var mysqlConfig = services
                .Where(d => d.ServiceType.FullName?.Contains("IDbContextOptionsConfiguration") == true)
                .ToList();
            foreach (var d in mysqlConfig)
                services.Remove(d);

            // Register InMemory database instead
            services.AddDbContext<MqttRuleEngineDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));

            // Disable MQTT hosted service to avoid broker connections during tests
            var hostedServices = services
                .Where(d => d.ServiceType == typeof(IHostedService))
                .ToList();
            foreach (var d in hostedServices)
                services.Remove(d);

            // Replace the real MQTT client manager with a no-op
            services.RemoveAll<IMqttClientManager>();
            services.AddSingleton<IMqttClientManager, NoOpMqttClientManager>();
        });
    }
}
