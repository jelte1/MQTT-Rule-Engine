using AutoMapper;
using backend.DTOs.Device;
using backend.DTOs.Rule;
using backend.Entities;

namespace backend.MappingProfiles;

public class RuleMappingProfile : Profile
{
    public RuleMappingProfile()
    {
        CreateMap<Rule, RuleDto>()
            .ForMember(dest => dest.ConditionTopicName, opt => opt.MapFrom(src => src.ConditionTopic != null ? src.ConditionTopic.Name : string.Empty))
            .ForMember(dest => dest.ConditionTopicPath, opt => opt.MapFrom(src => src.ConditionTopic != null ? src.ConditionTopic.TopicPath : string.Empty))
            .ForMember(dest => dest.ActionTopicName, opt => opt.MapFrom(src => src.ActionTopic != null ? src.ActionTopic.Name : string.Empty))
            .ForMember(dest => dest.ActionTopicPath, opt => opt.MapFrom(src => src.ActionTopic != null ? src.ActionTopic.TopicPath : string.Empty))
            .ReverseMap();
        CreateMap<Rule, CreateRuleDto>().ReverseMap();
    }
}