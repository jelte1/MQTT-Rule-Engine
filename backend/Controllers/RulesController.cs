using AutoMapper;
using backend.DTOs.Page;
using backend.DTOs.Rule;
using backend.Entities;
using backend.Extensions;
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
    private readonly ITopicRepository _topicRepository;
    private readonly IMapper _mapper;
    
    public RulesController(IRuleRepository ruleRepository, ITopicRepository topicRepository, IMapper mapper)
    {
        _ruleRepository = ruleRepository;
        _topicRepository = topicRepository;
        _mapper = mapper;
    }
    
    // GET: /api/rules
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RuleDto>>> GetAll()
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var rules = await _ruleRepository.GetAllByUserIdAsync(userId);
        return Ok(_mapper.Map<IEnumerable<RuleDto>>(rules));
    }
    
    // GET: /api/rules/1
    [HttpGet("{id}")]
    public async Task<ActionResult<RuleDto>> GetById(int id)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var rule = await _ruleRepository.GetByIdAndUserIdAsync(id, userId);
        
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
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }

        var conditionTopic = await _topicRepository.GetByIdAndUserIdAsync(dto.ConditionTopicId, userId);
        var actionTopic = await _topicRepository.GetByIdAndUserIdAsync(dto.ActionTopicId, userId);

        if (conditionTopic == null || actionTopic == null)
        {
            return BadRequest("Invalid condition or action topic");
        }
        
        var rule = _mapper.Map<Rule>(dto);
        await _ruleRepository.AddAsync(rule);
        await _ruleRepository.SaveChangesAsync();
        
        return CreatedAtAction("CreateRule", new { id = rule.Id }, _mapper.Map<RuleDto>(rule));
    }
    
    // PUT: /api/rules/1
    [HttpPut("{id}")]
    public async Task<ActionResult<RuleDto>> UpdateRule(int id, CreateRuleDto rule)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var existingRule = await _ruleRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (existingRule == null)
        {
            return NotFound();
        }
        
        var conditionTopic = await _topicRepository.GetByIdAndUserIdAsync(rule.ConditionTopicId, userId);
        var actionTopic = await _topicRepository.GetByIdAndUserIdAsync(rule.ActionTopicId, userId);

        if (conditionTopic == null || actionTopic == null)
        {
            return BadRequest("Invalid condition or action topic");
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
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var rule = await _ruleRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (rule == null)
        {
            return NotFound();
        }
        
        _ruleRepository.Delete(rule);
        await _ruleRepository.SaveChangesAsync();
        
        return NoContent();
    }
    
    // GET: /api/rules/page?pageSize=10&pageNumber=1&sortingField=receivedAt&sortingOrder=asc&filterQuery=test
    [HttpGet("page")]
    public async Task<ActionResult<RuleDto>> GetRulePage(
        [FromQuery] int pageSize = 10,
        [FromQuery] int pageNumber = 0,
        [FromQuery] string sortingField = "id",
        [FromQuery] string sortingOrder = "asc",
        [FromQuery] string filterQuery = ""
    )
    {
        var userId = User.GetLoggedInUserId();
        // max 100
        pageSize = Math.Clamp(pageSize, 1, 100);
        // minimal 0
        pageNumber = Math.Max(0, pageNumber);

        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var total = await _ruleRepository.GetTotalCount(userId, filterQuery);
        var rules = await _ruleRepository.GetPaginated(pageSize, (pageNumber * pageSize), sortingField, sortingOrder, filterQuery, userId);

        var dto = new PageDto<RuleDto>()
        {
            Total = total,
            Data = _mapper.Map<IEnumerable<RuleDto>>(rules)
        };
        
        return Ok(dto);
    }
}