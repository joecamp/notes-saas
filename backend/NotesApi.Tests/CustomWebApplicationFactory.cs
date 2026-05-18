using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotesApi.Data;

namespace NotesApi.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration(config =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = "test-secret-key-that-is-at-least-32-chars!",
                ["JwtSettings:Issuer"] = "NotesApi",
                ["JwtSettings:Audience"] = "NotesApp",
                ["JwtSettings:ExpirationMinutes"] = "60",
                ["AllowedOrigins:0"] = "http://localhost:5173"
            });
        });

        builder.ConfigureServices(services =>
        {
            // In EF Core 9, provider-specific services are registered via
            // IDbContextOptionsConfiguration<T> — remove those first
            var dbConfigDescriptors = services
                .Where(s => s.ServiceType.IsGenericType &&
                            s.ServiceType.GetGenericTypeDefinition() == typeof(IDbContextOptionsConfiguration<>) &&
                            s.ServiceType.GenericTypeArguments[0] == typeof(AppDbContext))
                .ToList();
            foreach (var d in dbConfigDescriptors) services.Remove(d);

            // Also remove DbContextOptions itself
            var dbOptionsDescriptors = services
                .Where(s => s.ServiceType == typeof(DbContextOptions<AppDbContext>))
                .ToList();
            foreach (var d in dbOptionsDescriptors) services.Remove(d);

            // Replace with in-memory database
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("TestDb"));
        });
    }
}
