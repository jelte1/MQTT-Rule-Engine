using AutoMapper;
using backend.DTOs.Variable;
using backend.Entities;
using backend.Interfaces;
using backend.Services;
using FluentAssertions;
using Moq;
using Xunit;

namespace backend.Tests.Unit;

public class VariableServiceTests
{
    private readonly Mock<IVariableRepository> _mockVariableRepo = new();
    private readonly Mock<ITopicRepository> _mockTopicRepo = new();
    private readonly Mock<IMqttClientManager> _mockMqtt = new();
    private readonly Mock<IPayloadParserService> _mockParser = new();
    private readonly Mock<ISentDataRepository> _mockSentDataRepo = new();
    private readonly Mock<IMapper> _mockMapper = new();

    private readonly VariableService _variableService;

    // Shared topic used across tests
    private static readonly Topic DefaultTopic = new()
    {
        Id = 1,
        DataFormat = DataFormat.PlainText,
        TopicPath = "home/relay"
    };

    public VariableServiceTests()
    {
        _mockVariableRepo.Setup(x => x.AddAsync(It.IsAny<Variable>())).ReturnsAsync((Variable v) => v);
        _mockVariableRepo.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _mockSentDataRepo.Setup(x => x.AddAsync(It.IsAny<SentData>())).ReturnsAsync(new SentData());
        _mockSentDataRepo.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        _variableService = new VariableService(
            _mockVariableRepo.Object,
            _mockTopicRepo.Object,
            _mockMqtt.Object,
            _mockParser.Object,
            _mockSentDataRepo.Object,
            _mockMapper.Object);
    }

    //
    // create tests:
    //

    [Fact]
    public async Task CreateAsync_ValidDto_SavesVariableAndPublishes()
    {
        // Arrange
        var dto = new CreateVariableDto { Name = "LivingRoomTemp", Value = "22", TopicId = 1 };
        var variable = new Variable { Id = 1, Name = "LivingRoomTemp", Value = "22", Topic = DefaultTopic };

        _mockMapper.Setup(x => x.Map<Variable>(dto)).Returns(variable);
        _mockParser.Setup(x => x.Format(DefaultTopic, variable.Field, "22")).Returns("22");
        _mockMqtt.Setup(x => x.Publish(DefaultTopic, "22")).Returns(Task.CompletedTask);

        // Act
        var result = await _variableService.CreateAsync(dto, "user-1");

        // Assert
        result.Should().Be(variable);
        _mockVariableRepo.Verify(x => x.AddAsync(variable), Times.Once);
        _mockVariableRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
        _mockMqtt.Verify(x => x.Publish(DefaultTopic, "22"), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_AfterSuccessfulPublish_RecordsSentDataWithSentStatus()
    {
        // Arrange
        var dto = new CreateVariableDto { Name = "Relay", Value = "on", TopicId = 1 };
        var variable = new Variable { Id = 5, Name = "Relay", Value = "on", Topic = DefaultTopic };

        _mockMapper.Setup(x => x.Map<Variable>(dto)).Returns(variable);
        _mockParser.Setup(x => x.Format(DefaultTopic, variable.Field, "on")).Returns("on");
        _mockMqtt.Setup(x => x.Publish(DefaultTopic, "on")).Returns(Task.CompletedTask);

        SentData? captured = null;
        _mockSentDataRepo.Setup(x => x.AddAsync(It.IsAny<SentData>()))
            .Callback<SentData>(sd => captured = sd)
            .ReturnsAsync(new SentData());

        // Act
        await _variableService.CreateAsync(dto, "user-1");

        // Assert
        captured.Should().NotBeNull();
        captured!.Status.Should().Be(SentDataStatus.Sent);
        captured.Type.Should().Be(SentDataType.Variable);
        captured.VariableId.Should().Be(5);
    }

    //
    // update tests:
    //

    [Fact]
    public async Task UpdateAsync_VariableExists_UpdatesAndPublishes()
    {
        // Arrange
        var dto = new CreateVariableDto { Name = "UpdatedName", Value = "42", TopicId = 1 };
        var existing = new Variable { Id = 3, Name = "OldName", Value = "0", Topic = DefaultTopic };

        _mockVariableRepo.Setup(x => x.GetByIdAndUserIdAsync(3, "user-1")).ReturnsAsync(existing);
        _mockMapper.Setup(x => x.Map(dto, existing)).Callback(() =>
        {
            existing.Name = dto.Name;
            existing.Value = dto.Value;
        });
        _mockParser.Setup(x => x.Format(DefaultTopic, existing.Field, "42")).Returns("42");
        _mockMqtt.Setup(x => x.Publish(DefaultTopic, "42")).Returns(Task.CompletedTask);

        // Act
        var result = await _variableService.UpdateAsync(3, dto, "user-1");

        // Assert
        result.Should().NotBeNull();
        result.Should().Be(existing);
        _mockVariableRepo.Verify(x => x.Update(existing), Times.Once);
        _mockVariableRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
        _mockMqtt.Verify(x => x.Publish(DefaultTopic, It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_VariableExists_SetsUpdatedAtTimestamp()
    {
        // Arrange
        var dto = new CreateVariableDto { Name = "Var", Value = "x", TopicId = 1 };
        var existing = new Variable { Id = 1, Name = "Var", Value = "old", Topic = DefaultTopic, UpdatedAt = null };

        _mockVariableRepo.Setup(x => x.GetByIdAndUserIdAsync(1, "user-1")).ReturnsAsync(existing);
        _mockParser.Setup(x => x.Format(DefaultTopic, It.IsAny<string?>(), "x")).Returns("x");
        _mockMqtt.Setup(x => x.Publish(DefaultTopic, "x")).Returns(Task.CompletedTask);

        // Act
        await _variableService.UpdateAsync(1, dto, "user-1");

        // Assert
        existing.UpdatedAt.Should().NotBeNull();
        existing.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task UpdateAsync_VariableNotFound_ReturnsNullAndNeverPublishes()
    {
        // Arrange
        _mockVariableRepo.Setup(x => x.GetByIdAndUserIdAsync(999, "user-1")).ReturnsAsync((Variable?)null);
        var dto = new CreateVariableDto { Name = "Var", Value = "x" };

        // Act
        var result = await _variableService.UpdateAsync(999, dto, "user-1");

        // Assert
        result.Should().BeNull();
        _mockMqtt.Verify(x => x.Publish(It.IsAny<Topic>(), It.IsAny<string>()), Times.Never);
    }

    //
    // publish variables tests:
    //

    [Fact]
    public async Task PublishVariable_PublishSucceeds_RecordsSentDataWithSentStatus()
    {
        // Arrange
        var variable = new Variable { Id = 7, Value = "on", Topic = DefaultTopic };

        _mockParser.Setup(x => x.Format(DefaultTopic, variable.Field, "on")).Returns("on");
        _mockMqtt.Setup(x => x.Publish(DefaultTopic, "on")).Returns(Task.CompletedTask);

        SentData? captured = null;
        _mockSentDataRepo.Setup(x => x.AddAsync(It.IsAny<SentData>()))
            .Callback<SentData>(sd => captured = sd)
            .ReturnsAsync(new SentData());

        // Act
        await _variableService.PublishVariable(variable);

        // Assert
        captured.Should().NotBeNull();
        captured!.Status.Should().Be(SentDataStatus.Sent);
        captured.ErrorMessage.Should().BeNull();
        captured.VariableId.Should().Be(7);
    }

    [Fact]
    public async Task PublishVariable_PublishFails_RecordsSentDataWithFailedStatus()
    {
        // Arrange
        var variable = new Variable { Id = 8, Value = "on", Topic = DefaultTopic };

        _mockParser.Setup(x => x.Format(DefaultTopic, variable.Field, "on")).Returns("on");
        _mockMqtt.Setup(x => x.Publish(DefaultTopic, "on"))
            .ThrowsAsync(new Exception("Broker unavailable"));

        SentData? captured = null;
        _mockSentDataRepo.Setup(x => x.AddAsync(It.IsAny<SentData>()))
            .Callback<SentData>(sd => captured = sd)
            .ReturnsAsync(new SentData());

        // Act
        await _variableService.PublishVariable(variable);

        // Assert
        captured.Should().NotBeNull();
        captured!.Status.Should().Be(SentDataStatus.Failed);
        captured.ErrorMessage.Should().Be("Broker unavailable");
    }

    [Fact]
    public async Task PublishVariable_AlwaysPersistsSentData_EvenWhenPublishFails()
    {
        // Arrange
        var variable = new Variable { Id = 9, Value = "x", Topic = DefaultTopic };

        _mockParser.Setup(x => x.Format(DefaultTopic, variable.Field, "x")).Returns("x");
        _mockMqtt.Setup(x => x.Publish(DefaultTopic, "x"))
            .ThrowsAsync(new Exception("timeout"));

        // Act
        await _variableService.PublishVariable(variable);

        // Assert
        _mockSentDataRepo.Verify(x => x.AddAsync(It.IsAny<SentData>()), Times.Once);
        _mockSentDataRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }
}
