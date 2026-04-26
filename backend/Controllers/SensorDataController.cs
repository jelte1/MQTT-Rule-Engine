using AutoMapper;
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
    
    // GET: /api/sensordata?size=10&page=1
    [HttpGet]
    public async Task<ActionResult<SensorDataPageDto>> GetSensorDataPage(
        [FromQuery] int pageSize = 10,
        [FromQuery] int pageNumber = 0,
        [FromQuery] string sortingField = "receivedAt",
        [FromQuery] string sortingOrder = "asc",
        [FromQuery] string filterQuery = ""
        )
    {
        var userId = User.GetLoggedInUserId();

        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var total = await _sensorDataRepository.GetTotalCount(userId, filterQuery);
        var sensorData = await _sensorDataRepository.GetPaginated(pageSize, (pageNumber * pageSize), sortingField, sortingOrder, filterQuery, userId);

        var dto = new SensorDataPageDto()
        {
            Total = total,
            SensorData = _mapper.Map<IEnumerable<SensorDataDto>>(sensorData)
        };
        
        return Ok(dto);
    }
}