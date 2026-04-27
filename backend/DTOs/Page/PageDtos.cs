namespace backend.DTOs.Page;

public class PageDto<T>
{
    public int Total { get; set; }
    public IEnumerable<T> Data { get; set; } = new List<T>();
}