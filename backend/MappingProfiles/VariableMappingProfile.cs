using AutoMapper;
using backend.DTOs.Variable;
using backend.Entities;

namespace backend.MappingProfiles;

public class VariableMappingProfile : Profile
{
        public VariableMappingProfile()
        {
            CreateMap<Variable, VariableDto>()
                .ForMember(dest => dest.TopicName, opt => opt.MapFrom(src => src.Topic != null ? src.Topic.Name : string.Empty))
                .ForMember(dest => dest.TopicPath, opt => opt.MapFrom(src => src.Topic != null ? src.Topic.TopicPath : string.Empty))
                .ReverseMap();
            CreateMap<Variable, CreateVariableDto>().ReverseMap();
        }
}