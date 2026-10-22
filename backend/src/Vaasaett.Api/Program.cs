using Microsoft.SemanticKernel;
using Npgsql;
using Vaasaett.Api.Endpoints;
using Vaasaett.Api.Persistence;
using Vaasaett.Api.SemanticKernel;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = (builder.Configuration["Frontend:Origin"] ?? "http://localhost:3000")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var connectionString = PostgresConnectionString.Normalize(
    builder.Configuration.GetConnectionString("Supabase"));

builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));
builder.Services.AddSingleton<PriceQueries>();
builder.Services.AddSingleton<PriceKernelPlugins>();
builder.Services.AddSingleton<PriceAskService>();

var azureOpenAi = builder.Configuration.GetSection(AzureOpenAIOptions.SectionName).Get<AzureOpenAIOptions>()
    ?? new AzureOpenAIOptions();
if (azureOpenAi.IsConfigured)
{
    builder.Services.AddKernel()
        .AddAzureOpenAIChatCompletion(azureOpenAi.Deployment!, azureOpenAi.Endpoint!, azureOpenAi.Key!)
        .Plugins.AddFromType<PriceKernelPlugins>();
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors();
app.MapPriceEndpoints();
app.MapPriceAskEndpoints();

app.Run();
