using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Database.Configs;

public class DeviceConfiguration : IEntityTypeConfiguration<Device>
{
    public void Configure(EntityTypeBuilder<Device> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Name).IsRequired();

        builder.HasOne(d => d.MqttConnection)
            .WithMany(c => c.Devices)
            .HasForeignKey(d => d.MqttConnectionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
