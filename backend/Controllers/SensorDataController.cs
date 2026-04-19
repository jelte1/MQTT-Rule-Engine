using AutoMapper;
using backend.DTOs.SensorData;
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
        var sensorData = await _sensorDataRepository.GetLatest(count);
        return Ok(_mapper.Map<IEnumerable<SensorDataDto>>(sensorData));
    }
}