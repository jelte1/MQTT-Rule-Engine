using AutoMapper;
using backend.DTOs.Device;
using backend.Entities;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IMapper _mapper;
    
    public DevicesController(IDeviceRepository deviceRepository, IMapper mapper)
    {
        _deviceRepository = deviceRepository;
        _mapper = mapper;
    }
    
    // GET: /api/devices
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DeviceDto>>> GetAll()
    {
        var devices = await _deviceRepository.GetAllWithConnectionAsync();
        return Ok(_mapper.Map<IEnumerable<DeviceDto>>(devices));
    }
    
    // GET: /api/devices/1
    [HttpGet("{id}")]
    public async Task<ActionResult<DeviceDto>> GetById(int id)
    {
        var device = await _deviceRepository.GetByIdAsync(id);
        
        if (device == null)
        {
            return NotFound();
        }
        
        return Ok(_mapper.Map<DeviceDto>(device));
    }
    
    // POST: /api/devices
    [HttpPost]
    public async Task<ActionResult<Device>> CreateDevice(CreateDeviceDto dto)
    {
        var device = _mapper.Map<Device>(dto);
        await _deviceRepository.AddAsync(device);
        await _deviceRepository.SaveChangesAsync();
        
        return CreatedAtAction("CreateDevice", new { id = device.Id }, _mapper.Map<CreateDeviceDto>(device));
    }
    
    // PUT: /api/devices/1
    [HttpPut("{id}")]
    public async Task<ActionResult<Device>> UpdateDevice(int id, CreateDeviceDto dto)
    {
        var device = await _deviceRepository.GetByIdAsync(id);
        
        if (device == null)
        {
            return NotFound();
        }
        
        _mapper.Map(dto, device);
        _deviceRepository.Update(device);
        await _deviceRepository.SaveChangesAsync();
        
        return Ok(_mapper.Map<DeviceDto>(device));
    }
    
    // DELETE: /api/devices/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDevice(int id)
    {
        var device = await _deviceRepository.GetByIdAsync(id);
        
        if (device == null)
        {
            return NotFound();
        }
        
        _deviceRepository.Delete(device);
        await _deviceRepository.SaveChangesAsync();
        
        return NoContent();
    }
}