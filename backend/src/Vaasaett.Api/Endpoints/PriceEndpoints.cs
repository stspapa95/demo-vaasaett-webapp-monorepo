using Vaasaett.Api.Persistence;

namespace Vaasaett.Api.Endpoints;

public static class PriceEndpoints
{
    public static void MapPriceEndpoints(this WebApplication app)
    {
        app.MapGet("/prices", GetPrices).WithName("GetPrices");
        app.MapGet("/prices/daily-stats", GetDailyStats).WithName("GetDailyStats");
        app.MapGet("/ingestion-runs", GetIngestionRuns).WithName("GetIngestionRuns");
    }

    private static async Task<IResult> GetPrices(
        PriceQueries queries,
        DateOnly? from,
        DateOnly? to,
        string biddingZone = "GR",
        CancellationToken cancellationToken = default)
    {
        var error = ValidateRange(from, to);
        if (error is not null)
        {
            return Results.BadRequest(new { message = error });
        }

        var prices = await queries.GetPricesAsync(biddingZone, from!.Value, to!.Value, cancellationToken);
        return Results.Ok(prices);
    }

    private static async Task<IResult> GetDailyStats(
        PriceQueries queries,
        DateOnly? from,
        DateOnly? to,
        string biddingZone = "GR",
        CancellationToken cancellationToken = default)
    {
        var error = ValidateRange(from, to);
        if (error is not null)
        {
            return Results.BadRequest(new { message = error });
        }

        var stats = await queries.GetDailyStatsAsync(biddingZone, from!.Value, to!.Value, cancellationToken);
        return Results.Ok(stats);
    }

    private static async Task<IResult> GetIngestionRuns(
        PriceQueries queries,
        int limit = 50,
        CancellationToken cancellationToken = default)
    {
        limit = Math.Clamp(limit, 1, 100);
        var runs = await queries.GetIngestionRunsAsync(limit, cancellationToken);
        return Results.Ok(runs);
    }

    private static string? ValidateRange(DateOnly? from, DateOnly? to)
    {
        if (from is null || to is null)
        {
            return "Query parameters from and to are required (YYYY-MM-DD).";
        }

        if (from > to)
        {
            return "from must be on or before to.";
        }

        if (to.Value.DayNumber - from.Value.DayNumber > 31)
        {
            return "Date range cannot exceed 31 days.";
        }

        return null;
    }
}
