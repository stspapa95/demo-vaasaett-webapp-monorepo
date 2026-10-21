using Vaasaett.Worker;
using Vaasaett.Worker.EnergyCharts;
using Vaasaett.Worker.Validation;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<PriceValidationOptions>(
    builder.Configuration.GetSection(PriceValidationOptions.SectionName));

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
