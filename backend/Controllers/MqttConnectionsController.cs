using System.Security.Claims;
using AutoMapper;
using backend.DTOs.MqttConnection;
using backend.Entities;
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var connections = await _mqttConnectionRepository.GetAllByUserId(userId);
        return Ok(_mapper.Map<IEnumerable<MqttConnectionDto>>(connections));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MqttConnectionDto>> GetById(int id)
    {
        var connection = await _mqttConnectionRepository.GetByIdAsync(id);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (connection == null)
        {
            return NotFound();
        }

        if (connection.UserId != userId)
        {
            return NotFound();
        }

        return Ok(_mapper.Map<MqttConnectionDto>(connection));
    }

    // POST: api/mqttconnections
    [HttpPost]
    public async Task<ActionResult<MqttConnectionDto>> CreateMqttConnection(CreateUpdateMqttConnectionDto dto)
    {
        var mqttConnection = _mapper.Map<MqttConnection>(dto);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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

    // DELETE: /api/mqttconnections/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMqttConnection(int id)
    {
        var mqttConnection = await _mqttConnectionRepository.GetByIdAsync(id);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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
}