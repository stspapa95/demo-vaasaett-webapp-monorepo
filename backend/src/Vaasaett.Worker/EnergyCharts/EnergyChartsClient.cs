using System.Net.Http.Json;
using System.Text.Json;

namespace Vaasaett.Worker.EnergyCharts;

public sealed class EnergyChartsClient(HttpClient http, IConfiguration config)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    public async Task<EnergyChartsPriceResponse> GetPricesAsync(CancellationToken cancellationToken)
    {
        var zone = config["EnergyCharts:BiddingZone"] ?? "GR";
        var payload = await http.GetFromJsonAsync<EnergyChartsPriceResponse>(
            $"price?bzn={Uri.EscapeDataString(zone)}",
            JsonOptions,
            cancellationToken);

        if (payload is null)
        {
            throw new InvalidOperationException("Energy-charts returned an empty body.");
        }

        return payload;
    }
}
