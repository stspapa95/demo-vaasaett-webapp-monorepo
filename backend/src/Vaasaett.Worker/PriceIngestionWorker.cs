using Vaasaett.Worker.EnergyCharts;
using Vaasaett.Worker.Validation;

namespace Vaasaett.Worker;

public class PriceIngestionWorker(
    ILogger<PriceIngestionWorker> logger,
    EnergyChartsClient energyCharts,
    PriceValidator validator) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Price ingestion worker started");

        var payload = await energyCharts.GetPricesAsync(stoppingToken);
        var result = validator.Validate(payload);

        logger.LogInformation(
            "Fetched {TimestampCount} timestamps. Accepted {Accepted}. Skipped null {SkippedNull}, duplicate {SkippedDuplicate}, unrealistic {SkippedUnrealistic}",
            payload.UnixSeconds?.Count ?? 0,
            result.Accepted.Count,
            result.SkippedNull,
            result.SkippedDuplicate,
            result.SkippedUnrealistic);
    }
}
