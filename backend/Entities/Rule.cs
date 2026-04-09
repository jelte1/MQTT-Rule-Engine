using System.ComponentModel.DataAnnotations;

namespace backend.Entities;

public enum ConditionOperator
{
    GreaterThan,
    LessThan,
    GreaterThanOrEqual,
    LessThanOrEqual,
    Equal,
    NotEqual,
    Contains
}

public class Rule
{
    public int Id { get; set; }
    [MaxLength(20)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(100)]
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Condition
    public string? ConditionField { get; set; }
    public ConditionOperator Operator { get; set; }
    public string ConditionValue { get; set; } = string.Empty;
    public int ConditionTopicId { get; set; }
    public Topic ConditionTopic { get; set; } = null!;

    // Action
    public string? ActionField { get; set; }
    public string ActionValue { get; set; } = string.Empty;
    public int ActionTopicId { get; set; }
    public Topic ActionTopic { get; set; } = null!;
}
