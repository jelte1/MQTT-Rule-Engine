using AutoMapper;
using backend.DTOs.Variable;
using backend.Entities;
using backend.Interfaces;

namespace backend.Services;

public class VariableService : IVariableSevice
{
    private readonly IVariableRepository _variableRepository;
    private readonly ITopicRepository _topicRepository;
    private readonly IMqttClientManager _mqttClientManager;
    private readonly IPayloadParserService _payloadParserService;
    private readonly ISentDataRepository _sentDataRepository;
    private readonly IMapper _mapper;

    public VariableService(
        IVariableRepository variableRepository,
        ITopicRepository topicRepository,
        IMqttClientManager mqttClientManager,
        IPayloadParserService payloadParserService,
        ISentDataRepository sentDataRepository,
        IMapper mapper)
    {
        _variableRepository = variableRepository;
        _topicRepository = topicRepository;
        _mqttClientManager = mqttClientManager;
        _payloadParserService = payloadParserService;
        _sentDataRepository = sentDataRepository;
        _mapper = mapper;
    }

    public async Task<Variable> CreateAsync(CreateVariableDto dto, string userId)
    {
        var variable = _mapper.Map<Variable>(dto);

        await _variableRepository.AddAsync(variable);
        await _variableRepository.SaveChangesAsync();

        await PublishVariable(variable);

        return variable;
    }

    public async Task<Variable?> UpdateAsync(int id, CreateVariableDto dto, string userId)
    {
        var variable = await _variableRepository.GetByIdAndUserIdAsync(id, userId);
        if (variable == null) return null;

        _mapper.Map(dto, variable);
        variable.UpdatedAt = DateTime.UtcNow;
        _variableRepository.Update(variable);
        await _variableRepository.SaveChangesAsync();

        await PublishVariable(variable);

        return variable;
    }

    public async Task PublishVariable(Variable variable)
    {
        var topic = variable.Topic;
        var payload = _payloadParserService.Format(topic, variable.Field, variable.Value);

        var sentData = new SentData
        {
            SentTopicId = topic.Id,
            VariableId = variable.Id,
            Payload = payload,
            SentAt = DateTime.UtcNow,
            Type = SentDataType.Variable
        };

        try
        {
            await _mqttClientManager.Publish(topic, payload);
            sentData.Status = SentDataStatus.Sent;
        }
        catch (Exception ex)
        {
            sentData.Status = SentDataStatus.Failed;
            sentData.ErrorMessage = ex.Message;
        }

        await _sentDataRepository.AddAsync(sentData);
        await _sentDataRepository.SaveChangesAsync();
    }
}