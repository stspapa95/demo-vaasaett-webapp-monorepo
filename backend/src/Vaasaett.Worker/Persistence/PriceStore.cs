using Npgsql;
using Vaasaett.Worker.Validation;

namespace Vaasaett.Worker.Persistence;

public sealed class PriceStore(NpgsqlDataSource dataSource)
{
    public async Task<Guid> StartRunAsync(string biddingZone, CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand(
            """
            insert into ingestion_runs (source, bidding_zone, status)
            values ('energy-charts', @bidding_zone, 'running')
            returning id;
            """);
        command.Parameters.AddWithValue("bidding_zone", biddingZone);

        var id = await command.ExecuteScalarAsync(cancellationToken);
        return (Guid)id!;
    }

    public async Task UpsertAsync(
        Guid runId,
        string biddingZone,
        string unit,
        IReadOnlyList<ValidatedPricePoint> points,
        CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        foreach (var point in points)
        {
            await using var command = new NpgsqlCommand(
                """
                insert into day_ahead_prices
                    (bidding_zone, occurred_at, price, unit, source, ingestion_run_id)
                values
                    (@bidding_zone, @occurred_at, @price, @unit, 'energy-charts', @run_id)
                on conflict (bidding_zone, occurred_at)
                do update set
                    price = excluded.price,
                    unit = excluded.unit,
                    ingestion_run_id = excluded.ingestion_run_id;
                """,
                connection,
                transaction);

            command.Parameters.AddWithValue("bidding_zone", biddingZone);
            command.Parameters.AddWithValue(
                "occurred_at",
                DateTimeOffset.FromUnixTimeSeconds(point.UnixSeconds));
            command.Parameters.AddWithValue("price", point.Price);
            command.Parameters.AddWithValue("unit", unit);
            command.Parameters.AddWithValue("run_id", runId);

            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
    }

    public async Task CompleteRunAsync(
        Guid runId,
        PriceValidationResult result,
        int fetchedCount,
        CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand(
            """
            update ingestion_runs
            set
                status = 'succeeded',
                finished_at = now(),
                fetched_count = @fetched_count,
                upserted_count = @upserted_count,
                skipped_null_count = @skipped_null_count,
                skipped_duplicate_count = @skipped_duplicate_count,
                skipped_unrealistic_count = @skipped_unrealistic_count
            where id = @id;
            """);
        command.Parameters.AddWithValue("id", runId);
        command.Parameters.AddWithValue("fetched_count", fetchedCount);
        command.Parameters.AddWithValue("upserted_count", result.Accepted.Count);
        command.Parameters.AddWithValue("skipped_null_count", result.SkippedNull);
        command.Parameters.AddWithValue("skipped_duplicate_count", result.SkippedDuplicate);
        command.Parameters.AddWithValue("skipped_unrealistic_count", result.SkippedUnrealistic);

        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task FailRunAsync(Guid runId, string errorMessage, CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand(
            """
            update ingestion_runs
            set
                status = 'failed',
                finished_at = now(),
                error_message = @error_message
            where id = @id;
            """);
        command.Parameters.AddWithValue("id", runId);
        command.Parameters.AddWithValue("error_message", errorMessage);

        await command.ExecuteNonQueryAsync(cancellationToken);
    }
}
