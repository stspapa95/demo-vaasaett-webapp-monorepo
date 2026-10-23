using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Vaasaett.Worker.EnergyCharts;

public sealed class EnergyChartsClient(
    HttpClient http,
    IOptions<EnergyChartsOptions> options,
    ILogger<EnergyChartsClient> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    public async Task<EnergyChartsPriceResponse> GetPricesAsync(CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var path = BuildPricePath(settings);
        var retries = Math.Max(0, settings.RetryCount);

        logger.LogInformation("Fetching energy-charts prices from {Path}", path);

        for (var attempt = 1; ; attempt++)
        {
            try
            {
                using var response = await http.GetAsync(path, cancellationToken);

                if (ShouldRetryStatus(response.StatusCode) && attempt <= retries)
                {
                    await DelayBeforeRetryAsync(response, attempt, cancellationToken);
                    continue;
                }

                response.EnsureSuccessStatusCode();

                var payload = await response.Content.ReadFromJsonAsync<EnergyChartsPriceResponse>(
                    JsonOptions,
                    cancellationToken);

                if (payload is null)
                {
                    throw new InvalidOperationException("Energy-charts returned an empty body.");
                }

                return payload;
            }
            catch (Exception exception) when (
                attempt <= retries &&
                IsTransient(exception, cancellationToken))
            {
                logger.LogWarning(
                    exception,
                    "Energy-charts request failed on attempt {Attempt}/{MaxAttempts}. Retrying.",
                    attempt,
                    retries + 1);
                await Task.Delay(RetryDelay(attempt), cancellationToken);
            }
        }
    }

    internal static string BuildPricePath(EnergyChartsOptions settings, DateTime utcNow)
    {
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(settings.TimeZone);
        var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(utcNow, timeZone));
        var start = today.AddDays(-Math.Max(0, settings.LookbackDays));
        var end = today.AddDays(Math.Max(0, settings.HorizonDays));
        var zone = Uri.EscapeDataString(settings.BiddingZone);

        return $"price?bzn={zone}&start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}";
    }

    private string BuildPricePath(EnergyChartsOptions settings) =>
        BuildPricePath(settings, DateTime.UtcNow);

    private static bool ShouldRetryStatus(HttpStatusCode statusCode) =>
        statusCode == HttpStatusCode.RequestTimeout
        || statusCode == HttpStatusCode.TooManyRequests
        || (int)statusCode >= 500;

    private static bool IsTransient(Exception exception, CancellationToken cancellationToken)
    {
        if (cancellationToken.IsCancellationRequested)
        {
            return false;
        }

        return exception is HttpRequestException
            or IOException
            or TaskCanceledException
            or TimeoutException;
    }

    private async Task DelayBeforeRetryAsync(
        HttpResponseMessage response,
        int attempt,
        CancellationToken cancellationToken)
    {
        var delay = RetryAfter(response) ?? RetryDelay(attempt);
        logger.LogWarning(
            "Energy-charts returned {StatusCode} on attempt {Attempt}. Retrying in {Delay}.",
            (int)response.StatusCode,
            attempt,
            delay);
        await Task.Delay(delay, cancellationToken);
    }

    private static TimeSpan RetryDelay(int attempt) =>
        TimeSpan.FromSeconds(Math.Min(8, Math.Pow(2, attempt)));

    private static TimeSpan? RetryAfter(HttpResponseMessage response)
    {
        var retryAfter = response.Headers.RetryAfter;
        if (retryAfter?.Delta is { } delta)
        {
            return delta;
        }

        if (retryAfter?.Date is { } date)
        {
            var wait = date - DateTimeOffset.UtcNow;
            return wait > TimeSpan.Zero ? wait : TimeSpan.Zero;
        }

        return null;
    }
}
