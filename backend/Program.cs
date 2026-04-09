using backend.Database;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var conString = builder.Configuration.GetConnectionString("DbCon");
builder.Services.AddDbContext<MqttRuleEngineDbContext>(options =>
    options.UseMySql(conString, ServerVersion.AutoDetect(conString)));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyHeader()
            .AllowAnyOrigin()
            .AllowAnyMethod()));

// Add all mapping profiles from the assembly, no need to add each one separately
builder.Services.AddAutoMapper(typeof(Program).Assembly);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.MapGet("/test-db", async (MqttRuleEngineDbContext db) =>
{
    try
    {
        await db.Database.CanConnectAsync();
        return Results.Ok("DB connection successful");
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.Run();