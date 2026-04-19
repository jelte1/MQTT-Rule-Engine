using AutoMapper;
using backend.DTOs.SensorData;
using backend.Entities;

namespace backend.MappingProfiles;

public class SensorDataMappingProfile : Profile
{
    public SensorDataMappingProfile()
    {
        CreateMap<SensorData, SensorDataDto>()
            .ForMember(dest => dest.TopicName, opt => opt.MapFrom(src => src.Topic != null ? src.Topic.Name : string.Empty))
            .ForMember(dest => dest.TopicPath, opt => opt.MapFrom(src => src.Topic != null ? src.Topic.TopicPath : string.Empty))
            .ReverseMap();
    }
}