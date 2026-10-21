using Npgsql;

namespace Vaasaett.Api.Persistence;

public sealed class PriceQueries(NpgsqlDataSource dataSource)
{
    private static readonly TimeZoneInfo MarketTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("Europe/Athens");

    public async Task<IReadOnlyList<PricePointDto>> GetPricesAsync(
        string biddingZone,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken)
    {
        var (fromUtc, toExclusiveUtc) = ToUtcRange(from, to);

        await using var command = dataSource.CreateCommand(
            """
            select occurred_at, price, unit, bidding_zone
            from day_ahead_prices
            where bidding_zone = @bidding_zone
              and occurred_at >= @from_utc
              and occurred_at < @to_utc
            order by occurred_at;
            """);
        command.Parameters.AddWithValue("bidding_zone", biddingZone);
        command.Parameters.AddWithValue("from_utc", fromUtc);
        command.Parameters.AddWithValue("to_utc", toExclusiveUtc);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<PricePointDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(new PricePointDto(
                reader.GetFieldValue<DateTimeOffset>(0),
                reader.GetFieldValue<decimal>(1),
                reader.GetString(2),
                reader.GetString(3)));
        }

        return rows;
    }

    public async Task<IReadOnlyList<DailyStatsDto>> GetDailyStatsAsync(
        string biddingZone,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken)
    {
        var (fromUtc, toExclusiveUtc) = ToUtcRange(from, to);

        await using var command = dataSource.CreateCommand(
            """
            select
                (occurred_at at time zone 'Europe/Athens')::date as day,
                min(price) as min_price,
                max(price) as max_price,
                avg(price) as avg_price,
                count(*)::int as sample_count
            from day_ahead_prices
            where bidding_zone = @bidding_zone
              and occurred_at >= @from_utc
              and occurred_at < @to_utc
            group by 1
            order by 1;
            """);
        command.Parameters.AddWithValue("bidding_zone", biddingZone);
        command.Parameters.AddWithValue("from_utc", fromUtc);
        command.Parameters.AddWithValue("to_utc", toExclusiveUtc);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<DailyStatsDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(new DailyStatsDto(
                DateOnly.FromDateTime(reader.GetDateTime(0)),
                reader.GetFieldValue<decimal>(1),
                reader.GetFieldValue<decimal>(2),
                reader.GetFieldValue<decimal>(3),
                reader.GetInt32(4)));
        }

        return rows;
    }

    public async Task<IReadOnlyList<IngestionRunDto>> GetIngestionRunsAsync(
        int limit,
        CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand(
            """
            select
                id,
                bidding_zone,
                status,
                started_at,
                finished_at,
                fetched_count,
                upserted_count,
                skipped_null_count,
                skipped_duplicate_count,
                skipped_unrealistic_count,
                error_message
            from ingestion_runs
            order by started_at desc
            limit @limit;
            """);
        command.Parameters.AddWithValue("limit", limit);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<IngestionRunDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(new IngestionRunDto(
                reader.GetGuid(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetFieldValue<DateTimeOffset>(3),
                reader.IsDBNull(4) ? null : reader.GetFieldValue<DateTimeOffset>(4),
                reader.GetInt32(5),
                reader.GetInt32(6),
                reader.GetInt32(7),
                reader.GetInt32(8),
                reader.GetInt32(9),
                reader.IsDBNull(10) ? null : reader.GetString(10)));
        }

        return rows;
    }

    private static (DateTimeOffset FromUtc, DateTimeOffset ToExclusiveUtc) ToUtcRange(
        DateOnly from,
        DateOnly to)
    {
        var fromLocal = DateTime.SpecifyKind(from.ToDateTime(TimeOnly.MinValue), DateTimeKind.Unspecified);
        var toExclusiveLocal = DateTime.SpecifyKind(
            to.AddDays(1).ToDateTime(TimeOnly.MinValue),
            DateTimeKind.Unspecified);

        return (
            TimeZoneInfo.ConvertTimeToUtc(fromLocal, MarketTimeZone),
            TimeZoneInfo.ConvertTimeToUtc(toExclusiveLocal, MarketTimeZone));
    }
}

public sealed record PricePointDto(
    DateTimeOffset OccurredAt,
    decimal Price,
    string Unit,
    string BiddingZone);

public sealed record DailyStatsDto(
    DateOnly Day,
    decimal Min,
    decimal Max,
    decimal Average,
    int Count);

public sealed record IngestionRunDto(
    Guid Id,
    string BiddingZone,
    string Status,
    DateTimeOffset StartedAt,
    DateTimeOffset? FinishedAt,
    int FetchedCount,
    int UpsertedCount,
    int SkippedNullCount,
    int SkippedDuplicateCount,
    int SkippedUnrealisticCount,
    string? ErrorMessage);
