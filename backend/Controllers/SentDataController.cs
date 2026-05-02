using AutoMapper;
using backend.DTOs.Page;
using backend.DTOs.SensorData;
using backend.DTOs.SentData;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SentDataController : ControllerBase
{
    private readonly ISentDataRepository _sentDataRepository;
    private readonly IMapper _mapper;
    
    public SentDataController(ISentDataRepository sentDataRepository, IMapper mapper)
    {
        _sentDataRepository = sentDataRepository;
        _mapper = mapper;
    }
    
    // GET: /api/sentdata/1
    [HttpGet("{id}")]
    public async Task<ActionResult<SentDataDto>> GetById(int id)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var sentData = await _sentDataRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (sentData == null)
        {
            return NotFound();
        }
        
        return Ok(_mapper.Map<SentDataDto>(sentData));
    }
    
    // GET: /api/SentData/sensordata/id
    [HttpGet("sensordata/{sensorDataId}")]
    public async Task<ActionResult<IEnumerable<SentDataDto>>> GetSentDataBySensorId(int sensorDataId)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var sentData = await _sentDataRepository.GetBySensorDataIdAsync(sensorDataId, userId);
        
        var dto = _mapper.Map<IEnumerable<SentDataDto>>(sentData);
        
        return Ok(dto);
    }
    
    // GET: /api/SentData/latest/10
    [HttpGet("latest/{count}")]
    public async Task<ActionResult<IEnumerable<SentDataDto>>> GetLatestSensorData(int count)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var sensorData = await _sentDataRepository.GetLatest(count, userId);
        
        return Ok(_mapper.Map<IEnumerable<SentDataDto>>(sensorData));
    }
    
    // GET: /api/sensordata/page?pageSize=10&pageNumber=1&sortingField=receivedAt&sortingOrder=asc&filterQuery=test
    [HttpGet("page")]
    public async Task<ActionResult<SentDataDto>> GetSensorDataPage(
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
        
        var total = await _sentDataRepository.GetTotalCount(userId, filterQuery);
        var sensorData = await _sentDataRepository.GetPaginated(pageSize, (pageNumber * pageSize), sortingField, sortingOrder, filterQuery, userId);

        var dto = new PageDto<SentDataDto>()
        {
            Total = total,
            Data = _mapper.Map<IEnumerable<SentDataDto>>(sensorData)
        };
        
        return Ok(dto);
    }
}