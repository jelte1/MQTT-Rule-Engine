using backend.Entities;
using backend.Services;
using FluentAssertions;
using Xunit;

namespace backend.Tests.Unit;

public class PayloadParserServiceTests
{
    private readonly PayloadParserService _payloadParserService = new();

    //
    // parsing plaintext tests:
    //

    [Fact]
    public void Parse_PlainText_ReturnsRawPayload()
    {
        // Arrange
        const string payload = "hello world";

        // Act
        var result = _payloadParserService.Parse(DataFormat.PlainText, payload, null);

        // Assert
        result.Should().Be(payload);
    }

    [Fact]
    public void Parse_PlainText_WithFieldName_StillReturnsRawPayload()
    {
        // Arrange
        const string payload = "42";

        // Act
        var result = _payloadParserService.Parse(DataFormat.PlainText, payload, "temperature");

        // Assert
        result.Should().Be(payload);
    }

    //
    // parsing numeric tests:
    //

    [Theory]
    [InlineData("42.5", 42.5)]
    [InlineData("0", 0.0)]
    [InlineData("-10.1", -10.1)]
    [InlineData("1000", 1000.0)]
    [InlineData("3.14", 3.14)]
    public void Parse_Numeric_ValidNumber_ReturnsParsedDouble(string payload, double expected)
    {
        // Act
        var result = _payloadParserService.Parse(DataFormat.Numeric, payload, null);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void Parse_Numeric_InvalidInput_ReturnsNull()
    {
        // Act
        var result = _payloadParserService.Parse(DataFormat.Numeric, "not-a-number", null);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void Parse_Numeric_EmptyString_ReturnsNull()
    {
        // Act
        var result = _payloadParserService.Parse(DataFormat.Numeric, string.Empty, null);

        // Assert
        result.Should().BeNull();
    }

    //
    // parsing json tests:
    //

    [Fact]
    public void Parse_Json_WithNumericField_ExtractsDouble()
    {
        // Arrange
        const string payload = """{"temperature": 23.5, "humidity": 60}""";

        // Act
        var result = _payloadParserService.Parse(DataFormat.Json, payload, "temperature");

        // Assert
        result.Should().Be(23.5);
    }

    [Fact]
    public void Parse_Json_WithStringField_ExtractsString()
    {
        // Arrange
        const string payload = """{"status": "on"}""";

        // Act
        var result = _payloadParserService.Parse(DataFormat.Json, payload, "status");

        // Assert
        result.Should().Be("on");
    }

    [Fact]
    public void Parse_Json_WithBooleanTrueField_ReturnsTrue()
    {
        // Arrange
        const string payload = """{"active": true}""";

        // Act
        var result = _payloadParserService.Parse(DataFormat.Json, payload, "active");

        // Assert
        result.Should().Be(true);
    }

    [Fact]
    public void Parse_Json_WithBooleanFalseField_ReturnsFalse()
    {
        // Arrange
        const string payload = """{"active": false}""";

        // Act
        var result = _payloadParserService.Parse(DataFormat.Json, payload, "active");

        // Assert
        result.Should().Be(false);
    }

    [Fact]
    public void Parse_Json_WithNullOrEmptyFieldName_ReturnsFullPayload()
    {
        // Arrange
        const string payload = """{"temperature": 23.5}""";

        // Act
        var result = _payloadParserService.Parse(DataFormat.Json, payload, null);

        // Assert
        result.Should().Be(payload);
    }

    [Fact]
    public void Parse_Json_WithEmptyFieldName_ReturnsFullPayload()
    {
        // Arrange
        const string payload = """{"temperature": 23.5}""";

        // Act
        var result = _payloadParserService.Parse(DataFormat.Json, payload, string.Empty);

        // Assert
        result.Should().Be(payload);
    }

    [Fact]
    public void Parse_Json_FieldDoesNotExist_ReturnsNull()
    {
        // Arrange
        const string payload = """{"temperature": 23.5}""";

        // Act
        var result = _payloadParserService.Parse(DataFormat.Json, payload, "nonexistent_field");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void Parse_Json_InvalidJson_ReturnsNull()
    {
        // Act
        var result = _payloadParserService.Parse(DataFormat.Json, "{ invalid json }", "field");

        // Assert
        result.Should().BeNull();
    }

    // ─── Format ───────────────────────────────────────────────────────────

    [Fact]
    public void Format_PlainText_ReturnsValueUnchanged()
    {
        // Arrange
        var topic = new Topic { DataFormat = DataFormat.PlainText };

        // Act
        var result = _payloadParserService.Format(topic, null, "hello");

        // Assert
        result.Should().Be("hello");
    }

    [Fact]
    public void Format_Numeric_ValidNumber_ReturnsInvariantCultureString()
    {
        // Arrange
        var topic = new Topic { DataFormat = DataFormat.Numeric };

        // Act
        var result = _payloadParserService.Format(topic, null, "42.5");

        // Assert
        result.Should().Be("42.5");
    }

    [Fact]
    public void Format_Numeric_InvalidNumber_ReturnsOriginalValue()
    {
        // Arrange
        var topic = new Topic { DataFormat = DataFormat.Numeric };

        // Act
        var result = _payloadParserService.Format(topic, null, "not-a-number");

        // Assert
        result.Should().Be("not-a-number");
    }

    [Fact]
    public void Format_Json_WithField_ProducesJsonObject()
    {
        // Arrange
        var topic = new Topic { DataFormat = DataFormat.Json };

        // Act
        var result = _payloadParserService.Format(topic, "power", "on");

        // Assert
        result.Should().Be("""{"power":"on"}""");
    }

    [Fact]
    public void Format_Json_WithNumericValueField_ProducesJsonObject()
    {
        // Arrange
        var topic = new Topic { DataFormat = DataFormat.Json };

        // Act
        var result = _payloadParserService.Format(topic, "temperature", "23.5");

        // Assert
        result.Should().Be("""{"temperature":"23.5"}""");
    }
}
