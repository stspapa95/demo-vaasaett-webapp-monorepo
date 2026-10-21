using Microsoft.Extensions.Options;
using Vaasaett.Worker.EnergyCharts;

namespace Vaasaett.Worker.Validation;

public sealed class PriceValidator(IOptions<PriceValidationOptions> options)
{
    public PriceValidationResult Validate(EnergyChartsPriceResponse payload)
    {
        var timestamps = payload.UnixSeconds ?? Array.Empty<long>();
        var prices = payload.Price ?? Array.Empty<decimal?>();
        var pairedCount = Math.Min(timestamps.Count, prices.Count);
        var bounds = options.Value;

        var seen = new HashSet<long>();
        var accepted = new List<ValidatedPricePoint>();
        var skippedNull = Math.Abs(timestamps.Count - prices.Count);
        var skippedDuplicate = 0;
        var skippedUnrealistic = 0;

        for (var i = 0; i < pairedCount; i++)
        {
            var unixSeconds = timestamps[i];
            var price = prices[i];

            if (price is null)
            {
                skippedNull++;
                continue;
            }

            if (!seen.Add(unixSeconds))
            {
                skippedDuplicate++;
                continue;
            }

            if (price.Value < bounds.MinPrice || price.Value > bounds.MaxPrice)
            {
                skippedUnrealistic++;
                continue;
            }

            accepted.Add(new ValidatedPricePoint(unixSeconds, price.Value));
        }

        return new PriceValidationResult
        {
            Accepted = accepted,
            SkippedNull = skippedNull,
            SkippedDuplicate = skippedDuplicate,
            SkippedUnrealistic = skippedUnrealistic,
        };
    }
}
