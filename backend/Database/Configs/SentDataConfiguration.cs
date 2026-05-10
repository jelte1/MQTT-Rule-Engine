using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Database.Configs;

public class SentDataConfiguration : IEntityTypeConfiguration<SentData>
{
        public void Configure(EntityTypeBuilder<SentData> builder)
        {
            builder.HasKey(s => s.Id);
            builder.Property(s => s.SentAt).IsRequired();
            
            builder.HasOne(s => s.SentTopic)
                .WithMany(t => t.SentData)
                .HasForeignKey(s => s.SentTopicId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Rule)
                .WithMany()
                .HasForeignKey(s => s.RuleId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(s => s.TriggerSensorData)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(s => s.Variable)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);
        }
}
