namespace Vaasaett.Worker.EnergyCharts;

public sealed class EnergyChartsPriceResponse
{
    public string LicenseInfo { get; init; } = "";
    public IReadOnlyList<long>? UnixSeconds { get; init; }
    public IReadOnlyList<decimal?>? Price { get; init; }
    public string Unit { get; init; } = "";
    public bool Deprecated { get; init; }
}
