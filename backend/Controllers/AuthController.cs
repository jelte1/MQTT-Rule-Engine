using AutoMapper;
using backend.DTOs.Auth;
using backend.Entities;
using backend.Interfaces;
using backend.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController :  ControllerBase
{
    private readonly IMapper _mapper;
    private readonly IAuthManager _authManager;
    
    public AuthController(IMapper mapper, IAuthManager authManager)
    {
        _mapper = mapper;
        _authManager = authManager;
    }
    
    // POST: /api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDto dto)
    {
        var errors = await _authManager.Register(dto);

        if (errors.Any())
        {
            foreach (var error in errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return BadRequest(ModelState);
        }
        
        return Ok();
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var authResponse = await _authManager.Login(dto);

        if (authResponse == null)
        {
            return Unauthorized();
        }

        return Ok(authResponse);
    }
    
    // POST: api/User/refreshtoken
    [HttpPost("refreshtoken")]
    public async Task<IActionResult> RefreshToken([FromBody] AuthResponseDto requestDto)
    {
        var authResponse = await _authManager.VerifyRefreshToken(requestDto);

        if (authResponse == null)
        {
            return Unauthorized();
        }

        return Ok(authResponse);
    }
}