using AutoMapper;
using backend.DTOs.SentData;
using backend.Entities;

namespace backend.MappingProfiles;

public class SentDataMappingProfile : Profile
{
    public SentDataMappingProfile()
    {
        CreateMap<SentData, SentDataDto>()
            .ForMember(dest => dest.SentTopicName, opt => opt.MapFrom(src => src.SentTopic != null ? src.SentTopic.Name : string.Empty))
            .ForMember(dest => dest.SentTopicPath, opt => opt.MapFrom(src => src.SentTopic != null ? src.SentTopic.TopicPath : string.Empty))
            .ForMember(dest => dest.TriggerSensorDataPayload, opt => opt.MapFrom(src => src.TriggerSensorDataId != null ? src.TriggerSensorData.RawPayload : string.Empty))
            .ForMember(dest => dest.RuleName, opt => opt.MapFrom(src => src.RuleId != null ? src.Rule.Name : string.Empty))
            .ReverseMap();
    }
}