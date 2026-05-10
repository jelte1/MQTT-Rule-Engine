using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Database.Configs;

public class VariableConfiguration : IEntityTypeConfiguration<Variable>
{
    public void Configure(EntityTypeBuilder<Variable> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Name).IsRequired();
        builder.Property(v => v.Value).IsRequired();
        
        builder.HasOne(v => v.Topic)
            .WithMany(t => t.Variables)
            .HasForeignKey(v => v.TopicId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasMany(v => v.SentData)
            .WithOne(s => s.Variable)
            .HasForeignKey(s => s.VariableId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}