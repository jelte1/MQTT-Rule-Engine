using System.Globalization;
using System.Text.Json;
using backend.Entities;
using backend.Interfaces;

namespace backend.Services;

public class RuleEngineService : IRuleEngineService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public RuleEngineService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task ProcessMessage(MqttConnection mqttConnection, Topic topic, string payload)
    {
        using var scope = _scopeFactory.CreateScope();
        var ruleRepository = scope.ServiceProvider.GetRequiredService<IRuleRepository>();

        var rules = await ruleRepository.GetActiveRulesByConditionTopic(topic.Id);

        foreach (var rule in rules)
        {
            try
            {
                object? parsedPayload = topic.DataFormat switch
                {
                    DataFormat.Json => ParseJsonPayload(payload, rule.ConditionField),
                    DataFormat.PlainText => payload,
                    DataFormat.Numeric => double.TryParse(payload, NumberStyles.Any, CultureInfo.InvariantCulture, out var num) ? num : (double?)null,
                    _ => null
                };

                if (EvaluateCondition(rule, parsedPayload))
                {
                    await ExecuteAction(rule);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing rule {rule.Id}: {ex.Message}");
            }
        }
    }

    private object? ParseJsonPayload(string payload, string? fieldName)
    {
        try
        {
            var json = JsonSerializer.Deserialize<JsonElement>(payload);

            if (string.IsNullOrEmpty(fieldName))
                return payload; // no field specified, use raw payload

            if (json.TryGetProperty(fieldName, out var property))
            {
                return property.ValueKind switch
                {
                    JsonValueKind.Number => property.GetDouble(),
                    JsonValueKind.String => property.GetString(),
                    JsonValueKind.True => true,
                    JsonValueKind.False => false,
                    _ => property.ToString()
                };
            }

            Console.WriteLine($"Property '{fieldName}' not found in JSON payload: {payload}");
            return null;
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"Failed to parse JSON payload: {payload}. Error: {ex.Message}");
            return null;
        }
    }

    private bool EvaluateCondition(Rule rule, object? payload)
    {
        var operatorr = rule.Operator switch
        {
            ConditionOperator.Equal => (Func<object?, bool>)(p => p?.ToString() == rule.ConditionValue),
            ConditionOperator.NotEqual => (p => p?.ToString() != rule.ConditionValue),
            ConditionOperator.Contains => (p => p?.ToString()?.Contains(rule.ConditionValue) == true),
            ConditionOperator.GreaterThan => (p => p is double d && double.TryParse(rule.ConditionValue, out var val) && d > val),
            ConditionOperator.GreaterThanOrEqual => (p => p is double d && double.TryParse(rule.ConditionValue, out var val) && d >= val),
            ConditionOperator.LessThan => (p => p is double d && double.TryParse(rule.ConditionValue, out var val) && d < val),
            ConditionOperator.LessThanOrEqual => (p => p is double d && double.TryParse(rule.ConditionValue, out var val) && d <= val),
            _ => null
        };

        if (operatorr == null)
        {
            return false;
        }

        return operatorr(payload);
    }

    private async Task ExecuteAction(Rule rule)
    {
        using var scope = _scopeFactory.CreateScope();
        var mqttClientManager = scope.ServiceProvider.GetRequiredService<IMqttClientManager>();

        if (rule.ActionField != null && !string.IsNullOrEmpty(rule.ActionValue))
        {
            try
            {
                var dataformat = rule.ActionTopic.DataFormat switch
                {
                    DataFormat.Json => JsonSerializer.Serialize(new Dictionary<string, object> { { rule.ActionField, rule.ActionValue } }),
                    DataFormat.Numeric => double.TryParse(rule.ActionValue, out var num) ? num.ToString() : rule.ActionValue,
                    DataFormat.PlainText => rule.ActionValue,
                    _ => rule.ActionValue
                };
                await mqttClientManager.Publish(rule.ActionTopic, dataformat);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to execute action for rule {rule.Id}: {ex.Message}");
            }
        }
    }
}