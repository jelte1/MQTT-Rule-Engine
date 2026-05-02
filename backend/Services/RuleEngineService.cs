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

    public async Task ProcessMessage(MqttConnection mqttConnection, Topic topic, SensorData sensorData, string payload)
    {
        using var scope = _scopeFactory.CreateScope();
        var ruleRepository = scope.ServiceProvider.GetRequiredService<IRuleRepository>();
        var payloadParserService = scope.ServiceProvider.GetRequiredService<IPayloadParserService>();

        var rules = await ruleRepository.GetActiveRulesByConditionTopic(topic.Id);

        foreach (var rule in rules)
        {
            try
            {
                var parsedPayload = payloadParserService.Parse(rule.ConditionTopic.DataFormat, payload, rule.ConditionField);

                if (EvaluateCondition(rule, parsedPayload))
                {
                    await ExecuteAction(rule, sensorData, rule.ActionTopic, rule.ActionField, rule.ActionValue, SentDataType.Action);
                    // await ExecuteAction(rule.ActionTopic, rule.ActionField, rule.ActionValue);
                } else if (HasElseAction(rule))
                {
                    await ExecuteAction(rule, sensorData, rule.ElseActionTopic, rule.ElseActionField, rule.ElseActionValue, SentDataType.ElseAction);
                    // await ExecuteAction(rule.ElseActionTopic, rule.ElseActionField, rule.ElseActionValue);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing rule {rule.Id}: {ex.Message}");
            }
        }
    }

    private bool EvaluateCondition(Rule rule, object? payload)
    {
        return rule.Operator switch
        {
            ConditionOperator.Equal => IsEqual(payload, rule.ConditionValue),
            ConditionOperator.NotEqual => !IsEqual(payload, rule.ConditionValue),
            ConditionOperator.Contains => Contains(payload, rule.ConditionValue),
            ConditionOperator.GreaterThan => CompareNumeric(payload, rule.ConditionValue, (a, b) => a > b),
            ConditionOperator.GreaterThanOrEqual => CompareNumeric(payload, rule.ConditionValue, (a, b) => a >= b),
            ConditionOperator.LessThan => CompareNumeric(payload, rule.ConditionValue, (a, b) => a < b),
            ConditionOperator.LessThanOrEqual => CompareNumeric(payload, rule.ConditionValue, (a, b) => a <= b),
            _ => false
        };
    }

    private bool IsEqual(object? payload, string conditionValue)
    {
        if (payload != null && payload?.ToString() == conditionValue)
        {
            return true;
        }
        return false;
    }

    private bool Contains(object? payload, string conditionValue)
    {
        if (payload != null && payload.ToString()?.Contains(conditionValue) == true)
        {
            return true;
        }
        return false;
    }
    
    private bool CompareNumeric(object? payload, string conditionValue, Func<double, double, bool> comparison)
    {
        if (payload is double payloadNum)
        {
            if (double.TryParse(conditionValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var conditionNum))
            {
                var result = comparison(payloadNum, conditionNum);
                return result;
            }
        }
        
        return false;
    }
    private async Task ExecuteAction(Rule rule, SensorData sensorData, Topic topic, string field, string value, SentDataType type)
    {
        using var scope = _scopeFactory.CreateScope();
        var mqttClientManager = scope.ServiceProvider.GetRequiredService<IMqttClientManager>();
        var payloadParserService = scope.ServiceProvider.GetRequiredService<IPayloadParserService>();
        var sentDataRepository = scope.ServiceProvider.GetRequiredService<ISentDataRepository>();

        if (field != null && !string.IsNullOrEmpty(value))
        {
            var sentData = new SentData()
            {
                SentTopicId = topic.Id,
                RuleId = rule.Id,
                TriggerSensorDataId = sensorData.Id,
                Payload = payloadParserService.Format(topic, field, value),
                SentAt = DateTime.Now,
                Type = type
            };
            
            try
            {
                var actionPayload = payloadParserService.Format(topic, field, value);
                
                sentData.Payload = actionPayload;
                
                await mqttClientManager.Publish(topic, actionPayload);
                
                sentData.Status = SentDataStatus.Sent;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to execute action for rule: {ex.Message}");
                
                sentData.Status = SentDataStatus.Failed;
                sentData.ErrorMessage = ex.Message;
            }
            
            await sentDataRepository.AddAsync(sentData);
            await sentDataRepository.SaveChangesAsync();
        }
    }

    private bool HasElseAction(Rule rule)
    {
        if (rule.ElseActionTopic != null && !string.IsNullOrEmpty(rule.ElseActionValue))
        {
            return true;
        }
        return false;
    }
}