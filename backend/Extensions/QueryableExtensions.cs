using System.Linq.Dynamic.Core;

namespace backend.Extensions;

public static class QueryableExtensions
{
    private static readonly HashSet<string> ValidOrders = ["ASC", "DESC"];
    private static readonly string DefaultField = "Id";

    public static IQueryable<T> ApplySort<T>(this IQueryable<T> query, 
        string? sortField, string? sortOrder)
    {
        if (string.IsNullOrEmpty(sortField))
        {
            sortField = DefaultField;
        }

        if (string.IsNullOrEmpty(sortOrder) || !ValidOrders.Contains(sortOrder.ToUpper()))
        {
            sortOrder = "DESC";
        }
        
        return query.OrderBy($"{sortField} {sortOrder.ToUpper()}");
    }
}