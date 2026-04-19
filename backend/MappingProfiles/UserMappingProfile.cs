using AutoMapper;
using backend.DTOs.Auth;
using backend.Entities;

namespace backend.MappingProfiles;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<User, LoginDto>().ReverseMap();
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); 
    }
}