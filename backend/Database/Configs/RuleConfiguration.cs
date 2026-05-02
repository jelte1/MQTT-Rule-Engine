using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Database.Configs;

public class RuleConfiguration : IEntityTypeConfiguration<Rule>
{
    public void Configure(EntityTypeBuilder<Rule> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Name).IsRequired();

        builder.HasOne(r => r.ConditionTopic)
            .WithMany(t => t.ConditionRules)
            .HasForeignKey(r => r.ConditionTopicId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.ActionTopic)
            .WithMany(t => t.ActionRules)
            .HasForeignKey(r => r.ActionTopicId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(r => r.ElseActionTopic)
            .WithMany(t => t.ElseActionRules)
            .HasForeignKey(r => r.ElseActionTopicId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
