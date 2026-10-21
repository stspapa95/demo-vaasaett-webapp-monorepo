namespace Vaasaett.Worker.Validation;

public sealed class PriceValidationResult
{
    public required IReadOnlyList<ValidatedPricePoint> Accepted { get; init; }
    public int SkippedNull { get; init; }
    public int SkippedDuplicate { get; init; }
    public int SkippedUnrealistic { get; init; }
}
