using System.Net;
using System.Net.Http.Json;

using Microsoft.Extensions.DependencyInjection;

using NotesApi.Data;

namespace NotesApi.Tests;

public class AuthTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuthTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public async Task InitializeAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Register_WithValidData_ReturnsOk()
    {
        // POST /api/auth/register with valid email and password, assert 200
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "newuser@example.com",
            password = "Test123!"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Register the same email twice, assert second attempt returns 400
        var payload = new { email = "duplicate@example.com", password = "Test123!" };
        await _client.PostAsJsonAsync("/api/auth/register", payload);

        var response = await _client.PostAsJsonAsync("/api/auth/register", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokenInBody()
    {
        // Register a user, login with correct credentials, assert 200 and token present in body
        var email = "loginuser@example.com";
        var password = "Test123!";
        await _client.PostAsJsonAsync("/api/auth/register", new { email, password });

        var response = await _client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(body!.ContainsKey("token"));
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // Register a user, login with wrong password, assert 401
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "wrongpass@example.com",
            password = "Test123!"
        });

        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "wrongpass@example.com",
            password = "WrongPassword1!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetNotes_WithoutToken_ReturnsUnauthorized()
    {
        // GET /api/notes with no Authorization header, assert 401
        var response = await _client.GetAsync("/api/notes");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
