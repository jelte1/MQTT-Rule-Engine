using AutoMapper;
using backend.DTOs.Device;
using backend.Entities;

namespace backend.MappingProfiles;

public class DeviceMappingProfile : Profile
{
    public DeviceMappingProfile()
    {
        CreateMap<Device, DeviceDto>()
            .ForMember(dest => dest.ConnectionName,
                opt => opt.MapFrom(src => src.MqttConnection != null ? src.MqttConnection.Name : string.Empty))
            .ReverseMap();
        CreateMap<Device, CreateDeviceDto>().ReverseMap();
    }
}