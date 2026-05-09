using Microsoft.EntityFrameworkCore;

using NotesApi.Data;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---

// Register EF Core with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register controllers
builder.Services.AddControllers();

// Swagger for API testing in browser (http://localhost:5073/swagger)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS — allow the React dev server to call our API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vite default port
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Apply any pending EF Core migrations automatically on startup.
// This means you never need to run "dotnet ef database update" manually —
// the app creates/updates the schema itself when it first connects.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// --- Middleware pipeline ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
