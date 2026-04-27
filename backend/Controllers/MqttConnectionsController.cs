using System.Security.Claims;
using AutoMapper;
using backend.DTOs.MqttConnection;
using backend.DTOs.Page;
using backend.Entities;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MqttConnectionsController : ControllerBase
{
    private readonly IMqttConnectionRepository _mqttConnectionRepository;
    private readonly IMapper _mapper;
    private readonly IMqttClientManager _mqttClientManager;

    public MqttConnectionsController(IMqttConnectionRepository mqttConnectionRepository, IMapper mapper, IMqttClientManager mqttClientManager)
    {
        _mqttConnectionRepository = mqttConnectionRepository;
        _mapper = mapper;
        _mqttClientManager = mqttClientManager;
    }

    // GET: api/mqttconnections
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MqttConnectionDto>>> GetAll()
    {
        var userId = User.GetLoggedInUserId();

        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }

        var connections = await _mqttConnectionRepository.GetAllByUserId(userId);
        var dtos = _mapper.Map<IEnumerable<MqttConnectionDto>>(connections);

        foreach (var dto in dtos)
        {
            dto.IsConnected = _mqttClientManager.IsConnected(dto.Id);
        }
        
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MqttConnectionDto>> GetById(int id)
    {
        var connection = await _mqttConnectionRepository.GetByIdAsync(id);

        var userId = User.GetLoggedInUserId();

        if (connection == null)
        {
            return NotFound();
        }

        if (connection.UserId != userId)
        {
            return NotFound();
        }
        
        var dto = _mapper.Map<MqttConnectionDto>(connection);
        dto.IsConnected = _mqttClientManager.IsConnected(dto.Id);

        return Ok(dto);
    }

    // POST: api/mqttconnections
    [HttpPost]
    public async Task<ActionResult<MqttConnectionDto>> CreateMqttConnection(CreateUpdateMqttConnectionDto dto)
    {
        var mqttConnection = _mapper.Map<MqttConnection>(dto);

        var userId = User.GetLoggedInUserId();

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        mqttConnection.UserId = userId;

        var addMqttConnection = await _mqttConnectionRepository.AddAsync(mqttConnection);
        await _mqttConnectionRepository.SaveChangesAsync();

        var getMqttConnectionDto = _mapper.Map<MqttConnectionDto>(addMqttConnection);

        return CreatedAtAction("CreateMqttConnection", new { id = getMqttConnectionDto.Id }, getMqttConnectionDto);
    }

    // PUT: api/mqttconnections/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<MqttConnectionDto>> UpdateMqttConnection(int id, CreateUpdateMqttConnectionDto dto)
    {
        var mqttConnection = await _mqttConnectionRepository.GetByIdAsync(id);

        var userId = User.GetLoggedInUserId();

        if (mqttConnection == null || string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }

        if (mqttConnection.UserId != userId)
        {
            return NotFound();
        }

        _mapper.Map(dto, mqttConnection);
        await _mqttConnectionRepository.SaveChangesAsync();

        await _mqttClientManager.Disconnect(id);

        if (mqttConnection.IsActive)
        {
            try
            {
                await _mqttClientManager.Connect(mqttConnection);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        return Ok(_mapper.Map<MqttConnectionDto>(mqttConnection));
    }

    // POST: api/mqttconnections/{id}/reconnect
    [HttpPost("{id}/reconnect")]
    public async Task<IActionResult> ReconnectMqttConnection(int id)
    {
        var mqttConnection = await _mqttConnectionRepository.GetByIdAsync(id);

        var userId = User.GetLoggedInUserId();

        if (mqttConnection == null || string.IsNullOrEmpty(userId) || mqttConnection.UserId != userId)
        {
            return NotFound();
        }

        if (!mqttConnection.IsActive)
        {
            return Conflict(new { message = "MQTT connection is not active" });
        }

        try
        {
            await _mqttClientManager.Disconnect(id);
            await _mqttClientManager.Connect(mqttConnection);
            return Ok(new { message = "Reconnected successfully" });
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(502, "Failed to reconnect to MQTT broker");
        }
    }

    // DELETE: /api/mqttconnections/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMqttConnection(int id)
    {
        var mqttConnection = await _mqttConnectionRepository.GetByIdAsync(id);

        var userId = User.GetLoggedInUserId();

        if (mqttConnection == null)
        {
            return NotFound();
        }

        if (mqttConnection.UserId != userId)
        {
            return NotFound();
        }

        _mqttConnectionRepository.Delete(mqttConnection);
        await _mqttConnectionRepository.SaveChangesAsync();

        return NoContent();
    }
    
    // GET: /api/mqttconnections/page?pageSize=10&pageNumber=1&sortingField=receivedAt&sortingOrder=asc&filterQuery=test
    [HttpGet("page")]
    public async Task<ActionResult<MqttConnectionDto>> GetRulePage(
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
        
        var total = await _mqttConnectionRepository.GetTotalCount(userId, filterQuery);
        var mqttConnections = await _mqttConnectionRepository.GetPaginated(pageSize, (pageNumber * pageSize), sortingField, sortingOrder, filterQuery, userId);

        var dto = new PageDto<MqttConnectionDto>()
        {
            Total = total,
            Data = _mapper.Map<IEnumerable<MqttConnectionDto>>(mqttConnections)
        };
        
        return Ok(dto);
    }
}