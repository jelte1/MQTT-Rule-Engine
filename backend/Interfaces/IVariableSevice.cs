using backend.DTOs.Variable;
using backend.Entities;

namespace backend.Interfaces;

public interface IVariableSevice
{
    Task<Variable> CreateAsync(CreateVariableDto dto, string userId);
    Task<Variable?> UpdateAsync(int id, CreateVariableDto dto, string userId);
    Task PublishVariable(Variable variable);
}