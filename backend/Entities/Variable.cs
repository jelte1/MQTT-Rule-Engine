using System.ComponentModel.DataAnnotations;

namespace backend.Entities;

public class Variable
{
    public int Id { get; set; }
    [MaxLength(20)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(100)]
    public string? Description { get; set; }
    // dates
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
    
    // var topic
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    
    // var payload
    [MaxLength(50)]
    public string? Field { get; set; }
    public string Value { get; set; } = string.Empty;
    
    // var sent payloads
    public ICollection<SentData> SentData { get; set; } = new List<SentData>();
}