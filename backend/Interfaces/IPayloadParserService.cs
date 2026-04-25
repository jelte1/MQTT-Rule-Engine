using backend.Entities;

namespace backend.Interfaces;

public interface IPayloadParserService
{
    object? Parse(DataFormat format, string payload, string? conditionField);
    string Format(Topic topic, string? field, string value);
}