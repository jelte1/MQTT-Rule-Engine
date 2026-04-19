using AutoMapper;
using backend.DTOs.Rule;
using backend.Entities;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class RulesController : ControllerBase
{
    private readonly IRuleRepository _ruleRepository;
    private readonly IMapper _mapper;
    
    public RulesController(IRuleRepository ruleRepository, IMapper mapper)
    {
        _ruleRepository = ruleRepository;
        _mapper = mapper;
    }
    
    // GET: /api/rules
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RuleDto>>> GetAll()
    {
        var rules = await _ruleRepository.GetAllAsync();
        return Ok(_mapper.Map<IEnumerable<RuleDto>>(rules));
    }
    
    // GET: /api/rules/1
    [HttpGet("{id}")]
    public async Task<ActionResult<RuleDto>> GetById(int id)
    {
        var rule = await _ruleRepository.GetByIdAsync(id);
        
        if (rule == null)
        {
            return NotFound();
        }
        
        return Ok(_mapper.Map<RuleDto>(rule));
    }
    
    // POST: /api/rules
    [HttpPost]
    public async Task<ActionResult<RuleDto>> CreateRule(CreateRuleDto dto)
    {
        var rule = _mapper.Map<Rule>(dto);
        await _ruleRepository.AddAsync(rule);
        await _ruleRepository.SaveChangesAsync();
        
        return CreatedAtAction("CreateRule", new { id = rule.Id }, _mapper.Map<RuleDto>(rule));
    }
    
    // PUT: /api/rules/1
    [HttpPut("{id}")]
    public async Task<ActionResult<RuleDto>> UpdateRule(int id, CreateRuleDto rule)
    {
        var existingRule = await _ruleRepository.GetByIdAsync(id);
        
        if (existingRule == null)
        {
            return NotFound();
        }
        
        _mapper.Map(rule, existingRule);
        _ruleRepository.Update(existingRule);
        await _ruleRepository.SaveChangesAsync();
        
        return Ok(_mapper.Map<RuleDto>(existingRule));
    }
    
    // DELETE: /api/rules/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRule(int id)
    {
        var rule = await _ruleRepository.GetByIdAsync(id);
        
        if (rule == null)
        {
            return NotFound();
        }
        
        _ruleRepository.Delete(rule);
        await _ruleRepository.SaveChangesAsync();
        
        return NoContent();
    }
}