using Vaasaett.Worker.EnergyCharts;
using Vaasaett.Worker.Persistence;
using Vaasaett.Worker.Validation;

namespace Vaasaett.Worker;

public class PriceIngestionWorker(
    ILogger<PriceIngestionWorker> logger,
    IConfiguration config,
    EnergyChartsClient energyCharts,
    PriceValidator validator,
    PriceStore store,
    IHostApplicationLifetime lifetime) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Guid? runId = null;

        try
        {
            var biddingZone = config["EnergyCharts:BiddingZone"] ?? "GR";
            logger.LogInformation("Price ingestion worker started for {BiddingZone}", biddingZone);

            runId = await store.StartRunAsync(biddingZone, stoppingToken);

            var payload = await energyCharts.GetPricesAsync(stoppingToken);
            var result = validator.Validate(payload);
            var fetchedCount = payload.UnixSeconds?.Count ?? 0;

            await store.UpsertAsync(
                runId.Value,
                biddingZone,
                payload.Unit,
                result.Accepted,
                stoppingToken);

            await store.CompleteRunAsync(runId.Value, result, fetchedCount, stoppingToken);

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
            Environment.ExitCode = 1;

            if (runId is { } id)
            {
                try
                {
                    await store.FailRunAsync(id, exception.Message, CancellationToken.None);
                }
                catch (Exception failException)
                {
                    logger.LogError(failException, "Could not mark run {RunId} as failed", id);
                }
            }

            logger.LogError(exception, "Run {RunId} failed", runId);
        }
        finally
        {
            lifetime.StopApplication();
        }
    }
}
