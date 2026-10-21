using Vaasaett.Worker.EnergyCharts;
using Vaasaett.Worker.Persistence;
using Vaasaett.Worker.Validation;

namespace Vaasaett.Worker;

public class PriceIngestionWorker(
    ILogger<PriceIngestionWorker> logger,
    IConfiguration config,
    EnergyChartsClient energyCharts,
    PriceValidator validator,
    PriceStore store) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var biddingZone = config["EnergyCharts:BiddingZone"] ?? "GR";
        logger.LogInformation("Price ingestion worker started for {BiddingZone}", biddingZone);

        var runId = await store.StartRunAsync(biddingZone, stoppingToken);

        try
        {
            var payload = await energyCharts.GetPricesAsync(stoppingToken);
            var result = validator.Validate(payload);
            var fetchedCount = payload.UnixSeconds?.Count ?? 0;

            await store.UpsertAsync(
                runId,
                biddingZone,
                payload.Unit,
                result.Accepted,
                stoppingToken);

            await store.CompleteRunAsync(runId, result, fetchedCount, stoppingToken);

            logger.LogInformation(
                "Run {RunId} succeeded. Fetched {Fetched}. Upserted {Accepted}. Skipped null {SkippedNull}, duplicate {SkippedDuplicate}, unrealistic {SkippedUnrealistic}",
                runId,
                fetchedCount,
                result.Accepted.Count,
                result.SkippedNull,
                result.SkippedDuplicate,
                result.SkippedUnrealistic);
        }
        catch (Exception exception)
        {
            try
            {
                await store.FailRunAsync(runId, exception.Message, CancellationToken.None);
            }
            catch (Exception failException)
            {
                logger.LogError(failException, "Could not mark run {RunId} as failed", runId);
            }

            logger.LogError(exception, "Run {RunId} failed", runId);
            throw;
        }
    }
}
