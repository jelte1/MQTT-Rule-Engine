using AutoMapper;
using backend.DTOs.Topic;
using backend.Entities;
using backend.Extensions;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TopicsController: ControllerBase
{
    private readonly ITopicRepository _topicRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IMapper _mapper;
    
    public TopicsController(ITopicRepository topicRepository, IDeviceRepository deviceRepository, IMapper mapper)
    {
        _topicRepository = topicRepository;
        _deviceRepository = deviceRepository;
        _mapper = mapper;
    }
    
    // GET: /api/topics
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TopicDto>>> GetAll()
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var topics = await _topicRepository.GetAllByUserIdAsync(userId);
        return Ok(_mapper.Map<IEnumerable<TopicDto>>(topics));
    }
    
    // GET: /api/topics/1
    [HttpGet("{id}")]
    public async Task<ActionResult<TopicDto>> GetById(int id)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var topic = await _topicRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (topic == null)
        {
            return NotFound();
        }
        
        return Ok(_mapper.Map<TopicDto>(topic));
    }
    
    // POST: /api/topics
    [HttpPost]
    public async Task<ActionResult<TopicDto>> CreateTopic(CreateTopicDto dto)
    {
        var userId = User.GetLoggedInUserId();

        var device = await _deviceRepository.GetByIdAndUserIdAsync(dto.DeviceId, userId);

        if (device == null)
        {
            return BadRequest("Invalid device");
        }
        
        var topic = _mapper.Map<Topic>(dto);
        await _topicRepository.AddAsync(topic);
        await _topicRepository.SaveChangesAsync();
        
        return CreatedAtAction("CreateTopic", new { id = topic.Id }, _mapper.Map<TopicDto>(topic));
    }
    
    // PUT: /api/topics/1
    [HttpPut("{id}")]
    public async Task<ActionResult<TopicDto>> UpdateTopic(int id, CreateTopicDto dto)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var topic = await _topicRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (topic == null)
        {
            return NotFound();
        }
        
        _mapper.Map(dto, topic);
        _topicRepository.Update(topic);
        await _topicRepository.SaveChangesAsync();
        
        return Ok(_mapper.Map<TopicDto>(topic));
    }
    
    // DELETE /api/topics/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTopic(int id)
    {
        var userId = User.GetLoggedInUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return NotFound();
        }
        
        var topic = await _topicRepository.GetByIdAndUserIdAsync(id, userId);
        
        if (topic == null)
        {
            return NotFound();
        }
        
        _topicRepository.Delete(topic);
        await _topicRepository.SaveChangesAsync();
        
        return NoContent();
    }
}