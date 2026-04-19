using backend.DTOs.Auth;
using Microsoft.AspNetCore.Identity;

namespace backend.Interfaces;

public interface IAuthManager
{
    Task<IEnumerable<IdentityError>> Register(RegisterDto user);
    Task<AuthResponseDto> Login(LoginDto user);
    Task<string> CreateRefreshToken();
    Task<AuthResponseDto> VerifyRefreshToken(AuthResponseDto request);
}
