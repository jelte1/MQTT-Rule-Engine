using AutoMapper;
using backend.DTOs.Device;
using backend.DTOs.Page;
using backend.DTOs.Variable;
using backend.Entities;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VariablesController  : ControllerBase
{
    private readonly IVariableRepository _variableRepository;
    private readonly ITopicRepository _topicRepository;
    private readonly IVariableSevice _variableService;
    private readonly IMapper _mapper;
    
    public VariablesController(IVariableRepository variableRepository, ITopicRepository topicRepository, IVariableSevice variableSevice, IMapper mapper)
    {
        _variableRepository = variableRepository;
        _topicRepository = topicRepository;
        _variableService = variableSevice;
        _mapper = mapper;
    }
    
    // GET: /api/variables
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VariableDto>>> GetAll()
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var variables = await _variableRepository.GetAllAsync();
        
        return Ok(_mapper.Map<IEnumerable<VariableDto>>(variables));
    }
    
    // GET: /api/variables/1
    [HttpGet("{id}")]
    public async Task<ActionResult<VariableDto>> GetById(int id)
    {
        var userId = User.GetLoggedInUserId();

        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var variable = await _variableRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (variable == null)
        {
            return NotFound();
        }
        
        return Ok(_mapper.Map<VariableDto>(variable));
    }
    
    // POST: /api/variables
    [HttpPost]
    public async Task<ActionResult<VariableDto>> CreateVariable(CreateVariableDto dto)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var topic = await _topicRepository.GetByIdAndUserIdAsync(dto.TopicId, userId);

        if (topic == null)
        {
            return BadRequest("Invalid Topic");
        }
        
        var variable = await _variableService.CreateAsync(dto, userId);
        
        return CreatedAtAction("CreateVariable", new { id = variable.Id }, _mapper.Map<VariableDto>(variable));
    }
    
    // PUT: /api/variables/1
    [HttpPut("{id}")]
    public async Task<ActionResult<VariableDto>> UpdateVariable(int id, CreateVariableDto dto)
    {
        var userId = User.GetLoggedInUserId();

        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var variable = await _variableRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (variable == null)
        {
            return NotFound();
        }
        
        variable = await _variableService.UpdateAsync(id, dto, userId);
        
        return Ok(_mapper.Map<VariableDto>(variable));
    }
    
    // DELETE: /api/variables/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVariable(int id)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var variable = await _variableRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (variable == null)
        {
            return NotFound();
        }
        
        _variableRepository.Delete(variable);
        await _variableRepository.SaveChangesAsync();
        
        return NoContent();
    }
    
    // POST: /api/variables/1/resend
    [HttpPost("{id}/resend")]
    public async Task<ActionResult<VariableDto>> ResendVariable(int id)
    {
        var userId = User.GetLoggedInUserId();

        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var variable = await _variableRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (variable == null)
        {
            return NotFound();
        }
        
        await _variableService.PublishVariable(variable);
        
        return Ok(_mapper.Map<VariableDto>(variable));
    }
    
    // GET: /api/variables/page?pageSize=10&pageNumber=1&sortingField=receivedAt&sortingOrder=asc&filterQuery=test
    [HttpGet("page")]
    public async Task<ActionResult<VariableDto>> GetRulePage(
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
        
        var total = await _variableRepository.GetTotalCount(userId, filterQuery);
        var devices = await _variableRepository.GetPaginated(pageSize, (pageNumber * pageSize), sortingField, sortingOrder, filterQuery, userId);

        var dto = new PageDto<VariableDto>()
        {
            Total = total,
            Data = _mapper.Map<IEnumerable<VariableDto>>(devices)
        };
        
        return Ok(dto);
    }
}