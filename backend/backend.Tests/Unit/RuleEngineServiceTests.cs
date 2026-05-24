using backend.Entities;
using backend.Interfaces;
using backend.Services;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace backend.Tests.Unit;

/// <summary>
/// Tests for RuleEngineService. Condition evaluation methods are private so they are
/// exercised indirectly through ProcessMessage, which is the public API.
/// </summary>
public class RuleEngineServiceTests
{
    // mock services
    private readonly Mock<IServiceScopeFactory> _mockScopeFactory = new();
    private readonly Mock<IServiceScope> _mockScope = new();
    private readonly Mock<IServiceProvider> _mockSp = new();
    private readonly Mock<IRuleRepository> _mockRuleRepo = new();
    private readonly Mock<IPayloadParserService> _mockParser = new();
    private readonly Mock<IMqttClientManager> _mockMqtt = new();
    private readonly Mock<ISentDataRepository> _mockSentDataRepo = new();

    private readonly RuleEngineService _ruleEngineService;

    public RuleEngineServiceTests()
    {
        // Wire the scope factory so every CreateScope() call returns the same scope
        _mockScopeFactory.Setup(x => x.CreateScope()).Returns(_mockScope.Object);
        _mockScope.Setup(x => x.ServiceProvider).Returns(_mockSp.Object);

        // Register all services on the mock provider
        _mockSp.Setup(x => x.GetService(typeof(IRuleRepository))).Returns(_mockRuleRepo.Object);
        _mockSp.Setup(x => x.GetService(typeof(IPayloadParserService))).Returns(_mockParser.Object);
        _mockSp.Setup(x => x.GetService(typeof(IMqttClientManager))).Returns(_mockMqtt.Object);
        _mockSp.Setup(x => x.GetService(typeof(ISentDataRepository))).Returns(_mockSentDataRepo.Object);

        _mockSentDataRepo.Setup(x => x.AddAsync(It.IsAny<SentData>())).ReturnsAsync(new SentData());
        _mockSentDataRepo.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        _ruleEngineService = new RuleEngineService(_mockScopeFactory.Object);
    }

    //
    // helper functions tests:
    //

    private static (MqttConnection conn, Topic topic, SensorData sd) MakeContext(
        DataFormat format = DataFormat.PlainText) =>
    (
        new MqttConnection { Id = 1 },
        new Topic { Id = 10, DataFormat = format },
        new SensorData { Id = 100 }
    );

    private static Topic ActionTopic(int id = 20) =>
        new() { Id = id, DataFormat = DataFormat.PlainText, TopicPath = "devices/out" };

    //
    // no existing rules tests:
    //

    [Fact]
    public async Task ProcessMessage_NoRulesForTopic_NeverPublishes()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([]);

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "any-payload");

        // Assert
        _mockMqtt.Verify(x => x.Publish(It.IsAny<Topic>(), It.IsAny<string>()), Times.Never);
    }

    //
    // operator tests:
    //

    [Fact]
    public async Task ProcessMessage_EqualCondition_ConditionMet_ExecutesPrimaryAction()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        var actionTopic = ActionTopic();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.Equal,
            ConditionValue = "on",
            ConditionTopic = topic,
            ActionTopic = actionTopic,
            ActionField = "relay",
            ActionValue = "1"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.PlainText, "on", null)).Returns("on");
        _mockParser.Setup(x => x.Format(actionTopic, "relay", "1")).Returns("1");
        _mockMqtt.Setup(x => x.Publish(actionTopic, "1")).Returns(Task.CompletedTask);

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "on");

        // Assert
        _mockMqtt.Verify(x => x.Publish(actionTopic, "1"), Times.Once);
    }

    [Fact]
    public async Task ProcessMessage_EqualCondition_ConditionNotMet_NoElseAction_NeverPublishes()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.Equal,
            ConditionValue = "on",
            ConditionTopic = topic,
            ActionTopic = ActionTopic(),
            ActionField = "relay",
            ActionValue = "1"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.PlainText, "off", null)).Returns("off");

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "off");

        // Assert
        _mockMqtt.Verify(x => x.Publish(It.IsAny<Topic>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ProcessMessage_NotEqualCondition_ConditionMet_ExecutesPrimaryAction()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        var actionTopic = ActionTopic();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.NotEqual,
            ConditionValue = "off",
            ConditionTopic = topic,
            ActionTopic = actionTopic,
            ActionField = "relay",
            ActionValue = "1"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.PlainText, "on", null)).Returns("on");
        _mockParser.Setup(x => x.Format(actionTopic, "relay", "1")).Returns("1");
        _mockMqtt.Setup(x => x.Publish(actionTopic, "1")).Returns(Task.CompletedTask);

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "on");

        // Assert
        _mockMqtt.Verify(x => x.Publish(actionTopic, "1"), Times.Once);
    }

    //
    // elseAction tests:
    //

    [Fact]
    public async Task ProcessMessage_ConditionNotMet_WithElseAction_ExecutesElseAction()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        var actionTopic = ActionTopic(20);
        var elseTopic = ActionTopic(30);
        elseTopic.TopicPath = "devices/else";

        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.Equal,
            ConditionValue = "on",
            ConditionTopic = topic,
            ActionTopic = actionTopic,
            ActionField = "relay",
            ActionValue = "1",
            ElseActionTopic = elseTopic,
            ElseActionField = "relay",
            ElseActionValue = "0"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.PlainText, "off", null)).Returns("off");
        _mockParser.Setup(x => x.Format(elseTopic, "relay", "0")).Returns("0");
        _mockMqtt.Setup(x => x.Publish(elseTopic, "0")).Returns(Task.CompletedTask);

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "off");

        // Assert
        _mockMqtt.Verify(x => x.Publish(elseTopic, "0"), Times.Once);
        _mockMqtt.Verify(x => x.Publish(actionTopic, It.IsAny<string>()), Times.Never);
    }

    //
    // numeric operator tests:
    //

    [Fact]
    public async Task ProcessMessage_GreaterThan_ConditionMet_ExecutesPrimaryAction()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext(DataFormat.Numeric);
        var actionTopic = ActionTopic();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.GreaterThan,
            ConditionValue = "20",
            ConditionTopic = topic,
            ActionTopic = actionTopic,
            ActionField = "alert",
            ActionValue = "high"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.Numeric, "25", null)).Returns(25.0);
        _mockParser.Setup(x => x.Format(actionTopic, "alert", "high")).Returns("high");
        _mockMqtt.Setup(x => x.Publish(actionTopic, "high")).Returns(Task.CompletedTask);

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "25");

        // Assert
        _mockMqtt.Verify(x => x.Publish(actionTopic, "high"), Times.Once);
    }

    [Fact]
    public async Task ProcessMessage_LessThan_ConditionMet_ExecutesPrimaryAction()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext(DataFormat.Numeric);
        var actionTopic = ActionTopic();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.LessThan,
            ConditionValue = "10",
            ConditionTopic = topic,
            ActionTopic = actionTopic,
            ActionField = "heat",
            ActionValue = "on"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.Numeric, "5", null)).Returns(5.0);
        _mockParser.Setup(x => x.Format(actionTopic, "heat", "on")).Returns("on");
        _mockMqtt.Setup(x => x.Publish(actionTopic, "on")).Returns(Task.CompletedTask);

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "5");

        // Assert
        _mockMqtt.Verify(x => x.Publish(actionTopic, "on"), Times.Once);
    }

    [Fact]
    public async Task ProcessMessage_GreaterThanOrEqual_BoundaryValue_ExecutesPrimaryAction()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext(DataFormat.Numeric);
        var actionTopic = ActionTopic();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.GreaterThanOrEqual,
            ConditionValue = "20",
            ConditionTopic = topic,
            ActionTopic = actionTopic,
            ActionField = "fan",
            ActionValue = "on"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.Numeric, "20", null)).Returns(20.0);
        _mockParser.Setup(x => x.Format(actionTopic, "fan", "on")).Returns("on");
        _mockMqtt.Setup(x => x.Publish(actionTopic, "on")).Returns(Task.CompletedTask);

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "20");

        // Assert
        _mockMqtt.Verify(x => x.Publish(actionTopic, "on"), Times.Once);
    }

    //
    // contains operator tests:
    //

    [Fact]
    public async Task ProcessMessage_Contains_ConditionMet_ExecutesPrimaryAction()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        var actionTopic = ActionTopic();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.Contains,
            ConditionValue = "error",
            ConditionTopic = topic,
            ActionTopic = actionTopic,
            ActionField = "log",
            ActionValue = "alert"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.PlainText, "critical error occurred", null))
            .Returns("critical error occurred");
        _mockParser.Setup(x => x.Format(actionTopic, "log", "alert")).Returns("alert");
        _mockMqtt.Setup(x => x.Publish(actionTopic, "alert")).Returns(Task.CompletedTask);

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "critical error occurred");

        // Assert
        _mockMqtt.Verify(x => x.Publish(actionTopic, "alert"), Times.Once);
    }

    [Fact]
    public async Task ProcessMessage_Contains_ConditionNotMet_NeverPublishes()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.Contains,
            ConditionValue = "error",
            ConditionTopic = topic,
            ActionTopic = ActionTopic(),
            ActionField = "log",
            ActionValue = "alert"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.PlainText, "all good", null)).Returns("all good");

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "all good");

        // Assert
        _mockMqtt.Verify(x => x.Publish(It.IsAny<Topic>(), It.IsAny<string>()), Times.Never);
    }

    //
    // fail handeling tests:
    //

    [Fact]
    public async Task ProcessMessage_PublishThrows_StillRecordsSentDataWithFailedStatus()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        var actionTopic = ActionTopic();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.Equal,
            ConditionValue = "on",
            ConditionTopic = topic,
            ActionTopic = actionTopic,
            ActionField = "relay",
            ActionValue = "1"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.PlainText, "on", null)).Returns("on");
        _mockParser.Setup(x => x.Format(actionTopic, "relay", "1")).Returns("1");
        _mockMqtt.Setup(x => x.Publish(actionTopic, "1")).ThrowsAsync(new Exception("MQTT connection lost"));

        SentData? captured = null;
        _mockSentDataRepo.Setup(x => x.AddAsync(It.IsAny<SentData>()))
            .Callback<SentData>(sd => captured = sd)
            .ReturnsAsync(new SentData());

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "on");

        // Assert
        captured.Should().NotBeNull();
        captured!.Status.Should().Be(SentDataStatus.Failed);
        captured.ErrorMessage.Should().Be("MQTT connection lost");
    }

    [Fact]
    public async Task ProcessMessage_PublishSucceeds_RecordsSentDataWithSentStatus()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        var actionTopic = ActionTopic();
        var rule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.Equal,
            ConditionValue = "on",
            ConditionTopic = topic,
            ActionTopic = actionTopic,
            ActionField = "relay",
            ActionValue = "1"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([rule]);
        _mockParser.Setup(x => x.Parse(DataFormat.PlainText, "on", null)).Returns("on");
        _mockParser.Setup(x => x.Format(actionTopic, "relay", "1")).Returns("1");
        _mockMqtt.Setup(x => x.Publish(actionTopic, "1")).Returns(Task.CompletedTask);

        SentData? captured = null;
        _mockSentDataRepo.Setup(x => x.AddAsync(It.IsAny<SentData>()))
            .Callback<SentData>(sd => captured = sd)
            .ReturnsAsync(new SentData());

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "on");

        // Assert
        captured.Should().NotBeNull();
        captured!.Status.Should().Be(SentDataStatus.Sent);
        captured.Type.Should().Be(SentDataType.Action);
        captured.TriggerSensorDataId.Should().Be(sd.Id);
        captured.RuleId.Should().Be(rule.Id);
    }

    [Fact]
    public async Task ProcessMessage_RuleProcessingThrows_ContinuesToNextRule()
    {
        // Arrange
        var (conn, topic, sd) = MakeContext();
        var goodTopic = ActionTopic(30);
        var badRule = new Rule
        {
            Id = 1,
            Operator = ConditionOperator.Equal,
            ConditionValue = "on",
            ConditionTopic = topic,
            ActionTopic = ActionTopic(20),
            ActionField = "relay",
            ActionValue = "1"
        };
        var goodRule = new Rule
        {
            Id = 2,
            Operator = ConditionOperator.Equal,
            ConditionValue = "on",
            ConditionTopic = topic,
            ActionTopic = goodTopic,
            ActionField = "light",
            ActionValue = "on"
        };

        _mockRuleRepo.Setup(x => x.GetActiveRulesByConditionTopic(topic.Id)).ReturnsAsync([badRule, goodRule]);

        // First rule causes parser to throw; second rule should still execute
        _mockParser.Setup(x => x.Parse(DataFormat.PlainText, "on", null))
            .Returns("on");
        _mockParser.Setup(x => x.Format(ActionTopic(20), "relay", "1"))
            .Throws(new Exception("format error"));
        _mockParser.Setup(x => x.Format(goodTopic, "light", "on")).Returns("on");
        _mockMqtt.Setup(x => x.Publish(goodTopic, "on")).Returns(Task.CompletedTask);

        // Act
        await _ruleEngineService.ProcessMessage(conn, topic, sd, "on");

        // Assert – second rule ran despite the first failing
        _mockMqtt.Verify(x => x.Publish(goodTopic, "on"), Times.Once);
    }
}
