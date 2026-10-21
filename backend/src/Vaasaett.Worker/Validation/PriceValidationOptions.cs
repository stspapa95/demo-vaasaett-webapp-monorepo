namespace Vaasaett.Worker.Validation;

public sealed class PriceValidationOptions
{
    public const string SectionName = "PriceValidation";

    public decimal MinPrice { get; set; } = -500;
    public decimal MaxPrice { get; set; } = 4000;
}
