using System.Net;
using System.Net.Http.Json;
using backend.DTOs.Auth;
using FluentAssertions;
using Xunit;

namespace backend.Tests.Integration;

/// <summary>
/// Integration tests for /api/auth endpoints using an in-memory database.
/// </summary>
public class AuthControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    //
    // Register Tests:
    //
    
    [Fact]
    public async Task Register_ValidCredentials_Returns200Ok()
    {
        // Arrange
        var dto = new RegisterDto
        {
            UserName = $"testuser_{Guid.NewGuid():N}",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Register_WeakPassword_Returns400BadRequest()
    {
        // Arrange – ASP.NET Identity rejects passwords shorter than 6 chars
        var dto = new RegisterDto
        {
            UserName = $"testuser_{Guid.NewGuid():N}",
            Password = "weak"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_DuplicateUsername_Returns400BadRequest()
    {
        // Arrange
        var dto = new RegisterDto
        {
            UserName = $"duplicate_{Guid.NewGuid():N}",
            Password = "Password123!"
        };

        // Register once successfully
        await _client.PostAsJsonAsync("/api/auth/register", dto);

        // Act – register again with the same username
        var response = await _client.PostAsJsonAsync("/api/auth/register", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    //
    // Login Tests:
    //

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithTokens()
    {
        // Arrange
        var username = $"loginuser_{Guid.NewGuid():N}";
        var password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new RegisterDto
        {
            UserName = username,
            Password = password
        });

        var loginDto = new LoginDto { UserName = username, Password = password };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        body.Should().NotBeNull();
        body!.Token.Should().NotBeNullOrWhiteSpace();
        body.UserId.Should().NotBeNullOrWhiteSpace();
        body.RefreshToken.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401Unauthorized()
    {
        // Arrange
        var username = $"wrongpw_{Guid.NewGuid():N}";
        await _client.PostAsJsonAsync("/api/auth/register", new RegisterDto
        {
            UserName = username,
            Password = "CorrectPass1!"
        });

        var loginDto = new LoginDto { UserName = username, Password = "WrongPassword!" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_NonExistentUser_Returns401Unauthorized()
    {
        // Arrange
        var loginDto = new LoginDto { UserName = "nobody", Password = "Password123!" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
