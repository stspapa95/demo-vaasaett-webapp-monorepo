using Npgsql;
using Vaasaett.Worker;
using Vaasaett.Worker.EnergyCharts;
using Vaasaett.Worker.Persistence;
using Vaasaett.Worker.Validation;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<PriceValidationOptions>(
    builder.Configuration.GetSection(PriceValidationOptions.SectionName));
builder.Services.Configure<EnergyChartsOptions>(
    builder.Configuration.GetSection(EnergyChartsOptions.SectionName));

var energyCharts = builder.Configuration
    .GetSection(EnergyChartsOptions.SectionName)
    .Get<EnergyChartsOptions>() ?? new EnergyChartsOptions();

var connectionString = PostgresConnectionString.Normalize(
    builder.Configuration.GetConnectionString("Supabase"));

builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));
builder.Services.AddSingleton<PriceStore>();

builder.Services.AddHttpClient<EnergyChartsClient>(client =>
{
    client.BaseAddress = new Uri(energyCharts.BaseUrl);
    client.Timeout = TimeSpan.FromSeconds(Math.Max(5, energyCharts.TimeoutSeconds));
    client.DefaultRequestHeaders.TryAddWithoutValidation(
        "User-Agent",
        "Vaasaett.Worker/1.0 (price-ingest)");
    client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
}).ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
{
    ConnectTimeout = TimeSpan.FromSeconds(10),
});

builder.Services.AddSingleton<PriceValidator>();
builder.Services.AddHostedService<PriceIngestionWorker>();

var host = builder.Build();
host.Run();
