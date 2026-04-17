using AutoMapper;
using backend.DTOs.Topic;
using backend.Entities;

namespace backend.MappingProfiles;

public class TopicMappingProfile : Profile
{
    public TopicMappingProfile()
    {
        CreateMap<Topic, TopicDto>()
            .ForMember(dest => dest.DeviceName,
                opt => opt.MapFrom(src => src.Device != null ? src.Device.Name : string.Empty))
            .ReverseMap();
        CreateMap<Topic, CreateTopicDto>().ReverseMap();
    }
}