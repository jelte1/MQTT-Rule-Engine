using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Database.Configs;

public class MqttConnectionConfiguration : IEntityTypeConfiguration<MqttConnection>
{
    public void Configure(EntityTypeBuilder<MqttConnection> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired();
        builder.Property(c => c.Host).IsRequired();
    }
}
