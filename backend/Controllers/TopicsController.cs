using AutoMapper;
using backend.DTOs.Topic;
using backend.Entities;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopicsController: ControllerBase
{
    private readonly ITopicRepository _topicRepository;
    private readonly IMapper _mapper;
    
    public TopicsController(ITopicRepository topicRepository, IMapper mapper)
    {
        _topicRepository = topicRepository;
        _mapper = mapper;
    }
    
    // GET: /api/topics
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TopicDto>>> GetAll()
    {
        var topics = await _topicRepository.GetAllWithDeviceAsync();
        return Ok(_mapper.Map<IEnumerable<TopicDto>>(topics));
    }
    
    // GET: /api/topics/1
    [HttpGet("{id}")]
    public async Task<ActionResult<TopicDto>> GetById(int id)
    {
        var topic = await _topicRepository.GetByIdAsync(id);
        
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
        var topic = _mapper.Map<Topic>(dto);
        await _topicRepository.AddAsync(topic);
        await _topicRepository.SaveChangesAsync();
        
        return CreatedAtAction("CreateTopic", new { id = topic.Id }, _mapper.Map<TopicDto>(topic));
    }
    
    // PUT: /api/topics/1
    [HttpPut("{id}")]
    public async Task<ActionResult<TopicDto>> UpdateTopic(int id, CreateTopicDto dto)
    {
        var topic = await _topicRepository.GetByIdAsync(id);
        
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
        var topic = await _topicRepository.GetByIdAsync(id);
        
        if (topic == null)
        {
            return NotFound();
        }
        
        _topicRepository.Delete(topic);
        await _topicRepository.SaveChangesAsync();
        
        return NoContent();
    }
}