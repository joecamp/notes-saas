using System.Net.Http.Headers;
using System.Net.Http.Json;

using Microsoft.Extensions.DependencyInjection;

using NotesApi.Data;
using NotesApi.DTOs;

namespace NotesApi.Tests;

public class NotesTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public NotesTests(CustomWebApplicationFactory factory)
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

    // Helper: register, login, and attach the token to the client
    private async Task AuthenticateAsync()
    {
        var email = "testuser@example.com";
        var password = "Test123!";
        await _client.PostAsJsonAsync("/api/auth/register", new { email, password });
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var body = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
    }

    [Fact]
    public async Task GetAllNotes_ReturnsValidNotes()
    {
        await AuthenticateAsync();

        var authHeader = _client.DefaultRequestHeaders.Authorization;
        Assert.NotNull(authHeader);
        Assert.NotEmpty(authHeader.Parameter!);

        var postResponse = await _client.PostAsJsonAsync("/api/notes", new { title = "Note1" });
        Assert.True(postResponse.IsSuccessStatusCode, $"POST /api/notes failed with {postResponse.StatusCode}");

        var getResponse = await _client.GetAsync("/api/notes");
        Assert.True(getResponse.IsSuccessStatusCode, $"GET /api/notes failed with {getResponse.StatusCode}");

        var notes = await getResponse.Content.ReadFromJsonAsync<List<NoteDto>>();
        Assert.NotNull(notes);
        Assert.Single(notes);
        Assert.Equal("Note1", notes[0].Title);
    }
}
