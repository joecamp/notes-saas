using System.Net;
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
    private async Task AuthenticateAsync(string email = "testuser@example.com", string password = "Test123!")
    {
        await _client.PostAsJsonAsync("/api/auth/register", new { email, password });
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var body = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
    }

    [Fact]
    public async Task GetAllNotes_AddSingle_ReturnsValidNotes()
    {
        // Authenticate, POST one note, GET /api/notes, assert single note with correct title
        await AuthenticateAsync();

        var postResponse = await _client.PostAsJsonAsync("/api/notes", new { title = "Note1" });
        Assert.True(postResponse.IsSuccessStatusCode);

        var getResponse = await _client.GetAsync("/api/notes");
        Assert.True(getResponse.IsSuccessStatusCode);

        var notes = await getResponse.Content.ReadFromJsonAsync<List<NoteDto>>();
        Assert.NotNull(notes);
        Assert.Single(notes);
        Assert.Equal("Note1", notes[0].Title);
    }

    [Fact]
    public async Task GetAllNotes_Empty_ReturnsEmpty()
    {
        // Authenticate without creating any notes, GET /api/notes, assert empty list
        await AuthenticateAsync();

        var getResponse = await _client.GetAsync("/api/notes");
        Assert.True(getResponse.IsSuccessStatusCode);

        var notes = await getResponse.Content.ReadFromJsonAsync<List<NoteDto>>();
        Assert.NotNull(notes);
        Assert.Empty(notes);
    }

    [Fact]
    public async Task GetAllNotes_UserIsolation()
    {
        // Authenticate as user1, create a note, authenticate as user2, GET /api/notes, assert empty
        await AuthenticateAsync("user1@test.com");
        await _client.PostAsJsonAsync("/api/notes", new { title = "User1 Note" });

        await AuthenticateAsync("user2@test.com");
        var getResponse = await _client.GetAsync("/api/notes");
        var notes = await getResponse.Content.ReadFromJsonAsync<List<NoteDto>>();
        
        Assert.NotNull(notes);
        Assert.Empty(notes);
    }

    [Fact]
    public async Task AddContentItems()
    {
        // Authenticate, create a note, POST a content item to it, assert item appears in response
        await AuthenticateAsync();

        var createNoteResponse = await _client.PostAsJsonAsync("/api/notes", new { title = "Note1" });
        var note = await createNoteResponse.Content.ReadFromJsonAsync<NoteDto>();

        var itemResponse = await _client.PostAsJsonAsync($"/api/notes/{note!.Id}/contentitems",
            new { text = "Item1" });
        Assert.True(itemResponse.IsSuccessStatusCode);

        var updatedNote = await itemResponse.Content.ReadFromJsonAsync<NoteDto>();
        Assert.NotNull(updatedNote);
        Assert.Single(updatedNote.ContentItems);
        Assert.Equal("Item1", updatedNote.ContentItems[0].Text);
    }

    [Fact]
    public async Task GetNoteById_ReturnsNote()
    {
        // Authenticate, create a note, GET /api/notes/{id}, assert title matches
        await AuthenticateAsync();

        var createNoteResponse = await _client.PostAsJsonAsync("/api/notes", new { title = "Note1" });
        var createdNote = await createNoteResponse.Content.ReadFromJsonAsync<NoteDto>();

        var getNoteResponse = await _client.GetAsync($"/api/notes/{createdNote!.Id}");
        Assert.True(getNoteResponse.IsSuccessStatusCode);

        var note = await getNoteResponse.Content.ReadFromJsonAsync<NoteDto>();
        Assert.Equal("Note1", note!.Title);
    }

    [Fact]
    public async Task GetNoteById_OtherUsersNote_ReturnsNotFound()
    {
        // Authenticate as user1, create a note, get its id
        await AuthenticateAsync("user1@test.com");
        var createNoteResponse = await _client.PostAsJsonAsync("/api/notes", new { title = "Note1" });
        var createdNote = await createNoteResponse.Content.ReadFromJsonAsync<NoteDto>();
        var createdNoteId = createdNote!.Id;

        // Authenticate as user2, GET /api/notes/{id}, assert 404
        await AuthenticateAsync("user2@test.com");
        var getNoteResponse = await _client.GetAsync($"/api/notes/{createdNoteId}");
        Assert.Equal(HttpStatusCode.NotFound, getNoteResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteNote_RemovesNote()
    {
        // Authenticate, create a note, DELETE /api/notes/{id}
        await AuthenticateAsync();
        var createNoteResponse = await _client.PostAsJsonAsync("/api/notes", new { title = "Note1" });
        var createdNote = await createNoteResponse.Content.ReadFromJsonAsync<NoteDto>();
        var createdNoteId = createdNote!.Id;

        var deleteNoteResponse = await _client.DeleteAsync($"/api/notes/{createdNoteId}");
        Assert.True(deleteNoteResponse.IsSuccessStatusCode);

        // GET /api/notes, assert list is empty
        var getNotesResponse = await _client.GetAsync("/api/notes");
        var notes = await getNotesResponse.Content.ReadFromJsonAsync<List<NoteDto>>();
        Assert.NotNull(notes);
        Assert.Empty(notes);

        var getNoteByIdResponse = await _client.GetAsync($"/api/notes/{createdNoteId}");
        Assert.Equal(HttpStatusCode.NotFound, getNoteByIdResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteNote_OtherUsersNote_ReturnsNotFound()
    {
        // Authenticate as user1, create a note, get its id
        await AuthenticateAsync("user1@test.com");
        var createNoteResponse = await _client.PostAsJsonAsync("/api/notes", new { title = "Note1" });
        var createdNote = await createNoteResponse.Content.ReadFromJsonAsync<NoteDto>();
        var createdNoteId = createdNote!.Id;

        // Authenticate as user2, DELETE /api/notes/{id}, assert 404
        await AuthenticateAsync("user2@test.com");
        var deleteNoteResponse = await _client.DeleteAsync($"/api/notes/{createdNoteId}");
        Assert.Equal(HttpStatusCode.NotFound, deleteNoteResponse.StatusCode);
    }
}
