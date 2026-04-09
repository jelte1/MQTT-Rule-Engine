using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Database.Configs;

public class SensorDataConfiguration : IEntityTypeConfiguration<SensorData>
{
    public void Configure(EntityTypeBuilder<SensorData> builder)
    {
        builder.HasKey(s => s.Id);

        builder.HasOne(s => s.Topic)
            .WithMany(t => t.SensorData)
            .HasForeignKey(s => s.TopicId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
