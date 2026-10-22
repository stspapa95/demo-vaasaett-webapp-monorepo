using Vaasaett.Api.SemanticKernel;

namespace Vaasaett.Api.Endpoints;

public static class PriceAskEndpoints
{
    private const int MaxQuestionLength = 400;

    public static void MapPriceAskEndpoints(this WebApplication app)
    {
        app.MapPost("/prices/ask", Ask).WithName("AskPrices");
    }

    private static async Task<IResult> Ask(
        AskPriceRequest request,
        PriceAskService ask,
        CancellationToken cancellationToken)
    {
        var question = request.Question?.Trim() ?? string.Empty;
        if (question.Length is 0 or > MaxQuestionLength)
        {
            return Results.BadRequest(new
            {
                message = $"Question is required and must be at most {MaxQuestionLength} characters.",
            });
        }

        if (!ask.IsConfigured)
        {
            return Results.Json(
                new { message = "Ask is not configured. Add Azure OpenAI settings on the API." },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        try
        {
            var answer = await ask.AskAsync(question, cancellationToken);
            return Results.Ok(new AskPriceResponse(answer));
        }
        catch (InvalidOperationException exception)
        {
            return Results.Json(new { message = exception.Message }, statusCode: StatusCodes.Status502BadGateway);
        }
    }
}

public sealed record AskPriceRequest(string? Question);

public sealed record AskPriceResponse(string Answer);
