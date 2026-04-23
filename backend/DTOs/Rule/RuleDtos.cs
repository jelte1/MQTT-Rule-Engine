using backend.DTOs.Topic;
using backend.Entities;

namespace backend.DTOs.Rule;

public class RuleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Condition
    public string? ConditionField { get; set; }
    public ConditionOperator Operator { get; set; }
    public string ConditionValue { get; set; } = string.Empty;
    public int ConditionTopicId { get; set; }
    public string ConditionTopicName { get; set; }  = string.Empty;
    public string ConditionTopicPath { get; set; }  = string.Empty;

    // Action
    public string? ActionField { get; set; }
    public string ActionValue { get; set; } = string.Empty;
    public int ActionTopicId { get; set; }
    public string ActionTopicName { get; set; } = string.Empty;
    public string ActionTopicPath { get; set; } = string.Empty;
    
    // Else
    public string? ElseActionField { get; set; }
    public string? ElseActionValue { get; set; } = string.Empty;
    public int? ElseActionTopicId { get; set; }
}

public class CreateRuleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Condition
    public string? ConditionField { get; set; }
    public ConditionOperator Operator { get; set; }
    public string ConditionValue { get; set; } = string.Empty;
    public int ConditionTopicId { get; set; }
    
    // Action
    public string? ActionField { get; set; }
    public string ActionValue { get; set; } = string.Empty;
    public int ActionTopicId { get; set; }
    // Else
    public string? ElseActionField { get; set; }
    public string? ElseActionValue { get; set; } = string.Empty;
    public int? ElseActionTopicId { get; set; }
}