using backend.Entities;

namespace backend.Interfaces;

public interface IVariableRepository : IRepository<Variable>
{
    Task<Variable?> GetByIdAndUserIdAsync(int id, string userId);
    Task<IEnumerable<Variable>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId);
    Task<int> GetTotalCount(string userId, string filterQuery);
}