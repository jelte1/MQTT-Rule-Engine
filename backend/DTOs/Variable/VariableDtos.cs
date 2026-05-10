namespace backend.DTOs.Variable;

public class CreateVariableDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int TopicId { get; set; }
    public string? Field { get; set; }
    public string Value { get; set; } = string.Empty;
}

public class VariableDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
    public int TopicId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public string TopicPath { get; set; } = string.Empty;
    public string? Field { get; set; }
    public string Value { get; set; } = string.Empty;
}