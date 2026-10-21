using Npgsql;
using Vaasaett.Worker;
using Vaasaett.Worker.EnergyCharts;
using Vaasaett.Worker.Persistence;
using Vaasaett.Worker.Validation;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<PriceValidationOptions>(
    builder.Configuration.GetSection(PriceValidationOptions.SectionName));

var connectionString = builder.Configuration.GetConnectionString("Supabase")
    ?? throw new InvalidOperationException(
        "Set ConnectionStrings:Supabase (dotnet user-secrets set).");

builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));
builder.Services.AddSingleton<PriceStore>();

builder.Services.AddHttpClient<EnergyChartsClient>(client =>
{
    var baseUrl = builder.Configuration["EnergyCharts:BaseUrl"]
        ?? "https://api.energy-charts.info/";
    client.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddSingleton<PriceValidator>();
builder.Services.AddHostedService<PriceIngestionWorker>();

var host = builder.Build();
host.Run();
