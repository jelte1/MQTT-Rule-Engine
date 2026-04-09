using Microsoft.EntityFrameworkCore;
using backend.Database;
using backend.Interfaces;

namespace backend.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    private readonly MqttRuleEngineDbContext _context;

    public Repository(MqttRuleEngineDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<T>> GetAllAsync()
    {
        return await _context.Set<T>().ToListAsync();
    }
    
    public async Task<T?> GetByIdAsync(int id)
    {
        return await _context.Set<T>().FindAsync(id);
    }
    
    public async Task<T> AddAsync(T entity)
    {
        await _context.AddAsync(entity);
        return entity;
    }
    
    public void Update(T entity)
    {
        _context.Update(entity);
    }
    
    public void Delete(T entity)
    {
        _context.Set<T>().Remove(entity);
    }
    
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}