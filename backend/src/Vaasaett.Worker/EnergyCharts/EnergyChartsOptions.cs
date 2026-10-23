namespace Vaasaett.Worker.EnergyCharts;

public sealed class EnergyChartsOptions
{
    public const string SectionName = "EnergyCharts";

    public string BaseUrl { get; set; } = "https://api.energy-charts.info/";
    public string BiddingZone { get; set; } = "GR";
    public string TimeZone { get; set; } = "Europe/Athens";
    public int LookbackDays { get; set; } = 7;
    public int HorizonDays { get; set; } = 1;
    public int TimeoutSeconds { get; set; } = 30;
    public int RetryCount { get; set; } = 3;
}
