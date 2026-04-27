using AutoMapper;
using backend.DTOs.Page;
using backend.DTOs.SensorData;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SensorDataController : ControllerBase
{
    private readonly ISensorDataRepository _sensorDataRepository;
    private readonly IMapper _mapper;
    
    public SensorDataController(ISensorDataRepository sensorDataRepository, IMapper mapper)
    {
        _sensorDataRepository = sensorDataRepository;
        _mapper = mapper;
    }
    
    // GET: /api/sensordata/latest/10
    [HttpGet("latest/{count}")]
    public async Task<ActionResult<IEnumerable<SensorDataDto>>> GetLatestSensorData(int count)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var sensorData = await _sensorDataRepository.GetLatest(count, userId);
        
        return Ok(_mapper.Map<IEnumerable<SensorDataDto>>(sensorData));
    }
    
    // GET: /api/sensordata/page?pageSize=10&pageNumber=1&sortingField=receivedAt&sortingOrder=asc&filterQuery=test
    [HttpGet("page")]
    public async Task<ActionResult<SensorDataDto>> GetSensorDataPage(
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
        
        var total = await _sensorDataRepository.GetTotalCount(userId, filterQuery);
        var sensorData = await _sensorDataRepository.GetPaginated(pageSize, (pageNumber * pageSize), sortingField, sortingOrder, filterQuery, userId);

        var dto = new PageDto<SensorDataDto>()
        {
            Total = total,
            Data = _mapper.Map<IEnumerable<SensorDataDto>>(sensorData)
        };
        
        return Ok(dto);
    }
}