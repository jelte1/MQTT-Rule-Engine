using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public class RegisterDto
{
    [Required]
    [MaxLength(50)]
    public string UserName { get; set; } = string.Empty;
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required]
    public string UserName { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public required string UserId { get; set; }
    public required string Token { get; set; }
    public required string RefreshToken { get; set; }
}