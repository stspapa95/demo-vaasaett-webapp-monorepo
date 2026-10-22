using System.ComponentModel;
using System.Globalization;
using Microsoft.SemanticKernel;
using Vaasaett.Api.Persistence;

namespace Vaasaett.Api.SemanticKernel;

public sealed class PriceKernelPlugins(PriceQueries queries)
{
    private const string BiddingZone = "GR";
    private const int MaxRangeDays = 31;

    [KernelFunction("get_daily_stats")]
    [Description(
        "Returns Greece (GR) day-ahead electricity prices summarised by market day in Europe/Athens. " +
        "Each day includes min, max and average EUR/MWh. Dates are inclusive YYYY-MM-DD. Range cannot exceed 31 days.")]
    public async Task<IReadOnlyList<DailyStatsAskDto>> GetDailyStatsAsync(
        [Description("Start date inclusive, YYYY-MM-DD in Europe/Athens")] string from,
        [Description("End date inclusive, YYYY-MM-DD in Europe/Athens")] string to,
        CancellationToken cancellationToken)
    {
        var (fromDate, toDate) = ParseRange(from, to);
        var rows = await queries.GetDailyStatsAsync(BiddingZone, fromDate, toDate, cancellationToken);
        return rows
            .Select(row => new DailyStatsAskDto(
                row.Day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                row.Min,
                row.Max,
                decimal.Round(row.Average, 2),
                row.Count))
            .ToList();
    }

    [KernelFunction("get_ingestion_runs")]
    [Description(
        "Returns recent price ingestion runs for the worker: status, fetched/upserted counts, " +
        "and how many points were skipped as null, duplicate, or unrealistic.")]
    public async Task<IReadOnlyList<IngestionRunAskDto>> GetIngestionRunsAsync(
        [Description("Number of recent runs to return, between 1 and 10")] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        limit = Math.Clamp(limit, 1, 10);
        var rows = await queries.GetIngestionRunsAsync(limit, cancellationToken);
        return rows
            .Select(row => new IngestionRunAskDto(
                row.Id.ToString(),
                row.BiddingZone,
                row.Status,
                row.StartedAt.ToString("O"),
                row.FinishedAt?.ToString("O"),
                row.FetchedCount,
                row.UpsertedCount,
                row.SkippedNullCount,
                row.SkippedDuplicateCount,
                row.SkippedUnrealisticCount,
                row.ErrorMessage))
            .ToList();
    }

    private static (DateOnly From, DateOnly To) ParseRange(string from, string to)
    {
        if (!TryParseDay(from, out var fromDate) || !TryParseDay(to, out var toDate))
        {
            throw new ArgumentException("from and to must be dates in YYYY-MM-DD format.");
        }

        if (fromDate > toDate)
        {
            throw new ArgumentException("from must be on or before to.");
        }

        if (toDate.DayNumber - fromDate.DayNumber > MaxRangeDays)
        {
            throw new ArgumentException("Date range cannot exceed 31 days.");
        }

        return (fromDate, toDate);
    }

    private static bool TryParseDay(string value, out DateOnly day) =>
        DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out day);
}

public sealed record DailyStatsAskDto(
    string Day,
    decimal MinEurPerMwh,
    decimal MaxEurPerMwh,
    decimal AverageEurPerMwh,
    int SampleCount);

public sealed record IngestionRunAskDto(
    string Id,
    string BiddingZone,
    string Status,
    string StartedAt,
    string? FinishedAt,
    int FetchedCount,
    int UpsertedCount,
    int SkippedNullCount,
    int SkippedDuplicateCount,
    int SkippedUnrealisticCount,
    string? ErrorMessage);
