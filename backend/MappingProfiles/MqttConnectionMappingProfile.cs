using AutoMapper;
using backend.DTOs.MqttConnection;
using backend.Entities;

namespace backend.MappingProfiles;

public class MqttConnectionMappingProfile : Profile
{
    public MqttConnectionMappingProfile()
    {
        CreateMap<MqttConnection, MqttConnectionDto>().ReverseMap();
        CreateMap<CreateUpdateMqttConnectionDto, MqttConnection>()
            .ForMember(dest => dest.Password, opt =>
            {
                opt.PreCondition((src, ctx) => !string.IsNullOrEmpty(src.Password));
                opt.MapFrom(src => src.Password);
            });
    }
}