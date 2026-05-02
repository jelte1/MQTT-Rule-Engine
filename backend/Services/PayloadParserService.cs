using System.Globalization;
using System.Text.Json;
using backend.Entities;
using backend.Interfaces;

namespace backend.Services;

public class PayloadParserService : IPayloadParserService
{
    public object? Parse(DataFormat format, string payload, string? conditionField)
    {
        var formattedData = format switch
        {
            DataFormat.Json => ParseJsonPayload(payload, conditionField),
            DataFormat.PlainText => payload,
            DataFormat.Numeric => ParseNumeric(payload),
            _ => null
        };
        return formattedData;
    }

    private static double? ParseNumeric(string payload)
    {
        if (double.TryParse(payload, NumberStyles.Any, CultureInfo.InvariantCulture, out var num))
        {
            return num;
        }
        return null;
    }
    
    private static object? ExtractJsonValue(JsonElement property)
    {
        object? jsonValue = property.ValueKind switch {
            JsonValueKind.Number => property.GetDouble(),
            JsonValueKind.String => property.GetString(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => property.ToString()
        };
        return jsonValue;
    }

    private static object? ParseJsonPayload(string payload, string? fieldName)
    {
        try
        {
            var json = JsonSerializer.Deserialize<JsonElement>(payload);

            if (string.IsNullOrEmpty(fieldName))
            {
                return payload;
            }

            // check if property exists in json
            if (!json.TryGetProperty(fieldName, out var property))
            {
                return null;
            }

            return ExtractJsonValue(property);
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"Failed to parse JSON payload '{payload}': {ex.Message}");
            return null;
        }
    }
    
    public string Format(Topic topic, string? field, string value)
    {
        var payload = topic.DataFormat switch
        {
            DataFormat.Json => JsonSerializer.Serialize(new Dictionary<string, object> { { field!, value } }),
            DataFormat.Numeric => double.TryParse(value, 
                NumberStyles.Any, CultureInfo.InvariantCulture, out var num) 
                ? num.ToString(CultureInfo.InvariantCulture)
                : value,
            DataFormat.PlainText => value,
            _ => value
        };
        return payload;
    }
}