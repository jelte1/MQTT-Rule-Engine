using backend.Entities;

namespace backend.Interfaces;

public interface IRuleRepository : IRepository<Rule>
{
    Task<Rule?> GetByIdAndUserIdAsync(int id, string userId);
    Task<IEnumerable<Rule>> GetAllByUserIdAsync(string userId);
}
