using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.DTOs.Auth;
using backend.DTOs.Device;
using backend.DTOs.MqttConnection;
using FluentAssertions;
using Xunit;

namespace backend.Tests.Integration;

/// <summary>
/// Integration tests for /api/devices endpoints.
/// </summary>
public class DevicesControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public DevicesControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    //
    // Auth guard tests:
    //

    [Fact]
    public async Task GetDevicesPage_NoToken_Returns401Unauthorized()
    {
        // Arrange – no Authorization header set

        // Act
        var response = await _client.GetAsync("/api/devices/page?pageSize=10&pageNumber=0&sortingField=id&sortingOrder=desc");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetDevicesPage_ValidToken_Returns200Ok()
    {
        // Arrange
        await AuthorizeClientAsync();

        // Act
        var response = await _client.GetAsync("/api/devices/page?pageSize=10&pageNumber=0&sortingField=id&sortingOrder=desc");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    //
    // crud operation tests:
    //
    [Fact]
    public async Task CreateDevice_InvalidMqttConnection_Returns400BadRequest()
    {
        // Arrange
        await AuthorizeClientAsync();

        var dto = new CreateDeviceDto
        {
            Name = "TestDevice",
            Description = "No connection",
            MqttConnectionId = 99999 // does not exist
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/devices", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateDevice_WithValidMqttConnection_Returns201Created()
    {
        // Arrange
        await AuthorizeClientAsync();
        var conn = await CreateMqttConnectionAsync();

        var dto = new CreateDeviceDto
        {
            Name = "Sensor Device 1",
            Description = "Integration test device",
            MqttConnectionId = conn.Id
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/devices", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await response.Content.ReadFromJsonAsync<DeviceDto>();
        body.Should().NotBeNull();
        body!.Name.Should().Be("Sensor Device 1");
    }

    [Fact]
    public async Task GetDeviceById_ExistingDevice_Returns200Ok()
    {
        // Arrange
        await AuthorizeClientAsync();
        var device = await CreateTestDeviceAsync("GetByIdDevice");

        // Act
        var response = await _client.GetAsync($"/api/devices/{device.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<DeviceDto>();
        body!.Name.Should().Be("GetByIdDevice");
    }

    [Fact]
    public async Task GetDeviceById_NonExistentDevice_Returns404NotFound()
    {
        // Arrange
        await AuthorizeClientAsync();

        // Act
        var response = await _client.GetAsync("/api/devices/99999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteDevice_ExistingDevice_Returns204AndDeviceIsGone()
    {
        // Arrange
        await AuthorizeClientAsync();
        var device = await CreateTestDeviceAsync("DeviceToDelete");

        // Act
        var deleteResponse = await _client.DeleteAsync($"/api/devices/{device.Id}");

        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getResponse = await _client.GetAsync($"/api/devices/{device.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    //
    // helper tests:
    //

    private async Task AuthorizeClientAsync()
    {
        var username = $"devtest_{Guid.NewGuid():N}";
        const string password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new RegisterDto
        {
            UserName = username,
            Password = password
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginDto
        {
            UserName = username,
            Password = password
        });

        var auth = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", auth!.Token);
    }

    private async Task<MqttConnectionDto> CreateMqttConnectionAsync()
    {
        var dto = new CreateUpdateMqttConnectionDto
        {
            Name = $"TestConn_{Guid.NewGuid():N}",
            Host = "localhost",
            Port = 1883,
            IsActive = false // avoid real connect attempts
        };

        var response = await _client.PostAsJsonAsync("/api/mqttconnections", dto);
        return (await response.Content.ReadFromJsonAsync<MqttConnectionDto>())!;
    }

    private async Task<DeviceDto> CreateTestDeviceAsync(string name)
    {
        var conn = await CreateMqttConnectionAsync();

        var response = await _client.PostAsJsonAsync("/api/devices", new CreateDeviceDto
        {
            Name = name,
            Description = "Test",
            MqttConnectionId = conn.Id
        });

        return (await response.Content.ReadFromJsonAsync<DeviceDto>())!;
    }
}
