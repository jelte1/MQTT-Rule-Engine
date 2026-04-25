using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using backend.Interfaces;
using backend.DTOs.Auth;
using backend.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace backend.Repositories;

public class AuthManager : IAuthManager
{
    private readonly IMapper _mapper;
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;
    private User? _user;

    private const string _providerName = "mqttRuleEngineApi";
    private const string _refreshTokenName = "RefreshToken";

    public AuthManager(IMapper mapper, UserManager<User> userManager, IConfiguration configuration)
    {
        this._mapper = mapper;
        this._userManager = userManager;
        this._configuration = configuration;
    }

    public async Task<IEnumerable<IdentityError>> Register(RegisterDto registerUserDto)
    {
        _user = _mapper.Map<User>(registerUserDto);
        var result = await _userManager.CreateAsync(_user, registerUserDto.Password);

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(_user, "User");
        }

        return result.Errors;
    }

    public async Task<AuthResponseDto?> Login(LoginDto loginUserDto)
    {
        _user = await _userManager.FindByNameAsync(loginUserDto.UserName);

        if (_user == null)
        {
            return null;
        }
        
        var isPasswordValid = await _userManager.CheckPasswordAsync(_user, loginUserDto.Password);

        if (!isPasswordValid)
        {
            return null;
        }

        var token = await GenerateJwtToken();

        return new AuthResponseDto
        {
            Token = token,
            UserId = _user.Id,
            RefreshToken = await CreateRefreshToken()
        };
    }

    public async Task<string> CreateRefreshToken()
    {
        await _userManager.RemoveAuthenticationTokenAsync(_user, _providerName, _refreshTokenName);

        var newToken = await _userManager.GenerateUserTokenAsync(_user, _providerName, _refreshTokenName);
        var result = await _userManager.SetAuthenticationTokenAsync(_user, _providerName, _refreshTokenName, newToken);

        if (!result.Succeeded)
        {
            return null;
        }

        return newToken;
    }

    public async Task<AuthResponseDto> VerifyRefreshToken(AuthResponseDto request)
    {
        var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();
        var tokenContent = jwtSecurityTokenHandler.ReadJwtToken(request.Token);
        var userName = tokenContent.Claims.ToList().FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Name)?.Value;

        _user = await _userManager.FindByNameAsync(userName);

        if (_user == null || _user.Id != request.UserId)
        {
            return null;
        }

        var isValidRefreshToken = await _userManager.VerifyUserTokenAsync(_user, _providerName, _refreshTokenName, request.RefreshToken);

        if (isValidRefreshToken)
        {
            var token = await GenerateJwtToken();
            return new AuthResponseDto
            {
                Token = token,
                UserId = _user.Id,
                RefreshToken = await CreateRefreshToken()
            };
        }

        await _userManager.UpdateSecurityStampAsync(_user);
        
        return null;
    }

    private async Task<string> GenerateJwtToken()
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var roles = await _userManager.GetRolesAsync(_user);

        var roleClaims = roles.Select(r => new Claim(ClaimTypes.Role, r)).ToList();
        var userClaims = await _userManager.GetClaimsAsync(_user);
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Name, _user.UserName),
            new Claim(JwtRegisteredClaimNames.Sub, _user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        }.Union(userClaims).Union(roleClaims);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(Convert.ToInt32(_configuration["JwtSettings:DurationInMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}