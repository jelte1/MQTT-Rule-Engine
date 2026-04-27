using backend.Entities;

namespace backend.Interfaces;

public interface IRuleRepository : IRepository<Rule>
{
    Task<Rule?> GetByIdAndUserIdAsync(int id, string userId);
    Task<IEnumerable<Rule>> GetAllByUserIdAsync(string userId);
    Task<IEnumerable<Rule>> GetActiveRulesByConditionTopic(int topicId);
    Task<IEnumerable<Rule>> GetPaginated(int size, int offset, string sortingField, string sortingOrder, string filterQuery, string userId);
    Task<int> GetTotalCount(string userId, string filterQuery);
}