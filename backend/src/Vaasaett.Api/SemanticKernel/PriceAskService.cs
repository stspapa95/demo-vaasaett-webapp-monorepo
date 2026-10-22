using System.Globalization;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace Vaasaett.Api.SemanticKernel;

public sealed class PriceAskService(
    IServiceProvider services,
    ILogger<PriceAskService> logger)
{
    private static readonly TimeZoneInfo MarketTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("Europe/Athens");

    public bool IsConfigured => services.GetService<Kernel>() is not null;

    public async Task<string> AskAsync(string question, CancellationToken cancellationToken)
    {
        var kernel = services.GetService<Kernel>();
        if (kernel is null)
        {
            throw new InvalidOperationException("Ask is not configured.");
        }

        var chat = kernel.GetRequiredService<IChatCompletionService>();
        var history = new ChatHistory(BuildSystemPrompt());
        history.AddUserMessage(question);

        var settings = new OpenAIPromptExecutionSettings
        {
            FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(),
            MaxTokens = 400,
            Temperature = 0.2,
        };

        try
        {
            var message = await chat.GetChatMessageContentAsync(
                history,
                settings,
                kernel,
                cancellationToken);
            var answer = message.Content?.Trim();
            return string.IsNullOrWhiteSpace(answer)
                ? "I could not produce an answer from the stored prices."
                : answer;
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogError(exception, "Price ask failed");
            throw new InvalidOperationException("Could not answer that question. Try again.");
        }
    }

    private static string BuildSystemPrompt()
    {
        var todayLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, MarketTimeZone);
        var today = DateOnly.FromDateTime(todayLocal).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        return
            $"""
            You answer questions about Greece (bidding zone GR) day-ahead electricity prices.
            Today in Europe/Athens is {today}. Prices are EUR/MWh.

            Use only get_daily_stats and get_ingestion_runs. Do not invent prices, dates, or run results.
            If a tool returns no rows, say there is no stored data for that range.
            Keep answers short and factual. If the question is unrelated to these prices or ingestion, refuse.
            """;
    }
}
