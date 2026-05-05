using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApi.Data;
using NotesApi.DTOs;
using NotesApi.Models;

namespace NotesApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotesController(AppDbContext db)
    {
        _db = db;
    }

    // Get all Notes
    // GET /api/notes
    [HttpGet]
    public async Task<ActionResult<List<NoteDto>>> GetAll()
    {
        var notes = await _db.Notes
            .Include(n => n.ContentItems.OrderBy(c => c.Order))
            .OrderByDescending(n => n.UpdatedAt)
            .Select(n => MapToDto(n))
            .ToListAsync();

        return Ok(notes);
    }

    // Get a Note by ID
    // GET /api/notes/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<NoteDto>> GetById(int id)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems.OrderBy(c => c.Order))
            .FirstOrDefaultAsync(n => n.Id == id);

        if (note is null)
            return NotFound();

        return Ok(MapToDto(note));
    }

    // Create a Note
    // POST /api/notes
    [HttpPost]
    public async Task<ActionResult<NoteDto>> CreateNote(CreateNoteDto dto)
    {
        var note = new Note
        {
            Title = dto.Title,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Notes.Add(note);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = note.Id }, MapToDto(note));
    }

    // Update a Note with new data
    // PUT /api/notes/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<NoteDto>> UpdateNote(int id, UpdateNoteDto dto)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (note is null)
            return NotFound();

        note.Title = dto.Title;
        note.UpdatedAt = DateTime.UtcNow;

        // Remove old content items and replace with new ones
        _db.ContentItems.RemoveRange(note.ContentItems);
        note.ContentItems = dto.ContentItems
            .Select((text, index) => new ContentItem { Text = text, Order = index })
            .ToList();

        await _db.SaveChangesAsync();

        return Ok(MapToDto(note));
    }

    // Set a Note's Title
    // PATCH /api/notes/{id}

    // Delete a Note
    // DELETE /api/notes/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteNote(int id)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (note is null)
            return NotFound();

        _db.Notes.Remove(note);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // Create a new ContentItem
    // POST /api/notes/{noteId}/contentitems
    [HttpPost("{noteId}/contentitems")]
    public async Task<ActionResult> AddContentItem(int noteId, AddContentItemDto dto)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems.OrderBy(c => c.Order))
            .FirstOrDefaultAsync(n => n.Id == noteId);

        if (note is null)
            return NotFound();

        var newItem = new ContentItem
        {
            Text = dto.Text,
            Order = note.ContentItems.Any()
                ? note.ContentItems.Max(c => c.Order) + 1
                : 0,
            IsStarred = false,
            NoteId = noteId
        };

        note.ContentItems.Add(newItem);
        note.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = noteId }, MapToDto(note));
    }

    // Set a ContentItem's Text
    // PATCH /api/notes/{id}/contentitems/{contentItemId}

    // Toggle the IsStarred property of a ContentItem
    // PATCH /api/notes/{id}/contentitems/{contentItemId}
    [HttpPatch("{noteId}/contentitems/{contentItemId}")]
    public async Task<ActionResult<NoteDto>> ToggleStarContentItem(int noteId, int contentItemId)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems.OrderBy(c => c.Order))
            .FirstOrDefaultAsync(n => n.Id == noteId);

        if (note is null)
            return NotFound();

        var item = note.ContentItems.FirstOrDefault(item => item.Id == contentItemId);
        if(item is null)
        {
            return NotFound();
        }

        item.IsStarred = !item.IsStarred;

        await _db.SaveChangesAsync();

        return Ok(MapToDto(note));
    }

    // Delete a ContentItem
    // DELETE /api/notes/{id}/contentitems/{contentItemId}
    [HttpDelete("{noteId}/contentitems/{contentItemId}")]
    public async Task<ActionResult> DeleteContentItem(int noteId, int contentItemId)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems)
            .FirstOrDefaultAsync(n => n.Id == noteId);

        if (note is null)
            return NotFound();

        var itemToDelete = note.ContentItems.FirstOrDefault(item => item.Id == contentItemId);
        if (itemToDelete is null)
        {
            return NotFound();
        }

        _db.ContentItems.Remove(itemToDelete);
        note.UpdatedAt = DateTime.UtcNow;

        // Reorder remaining items to preserve 0 -> n count in Order properties
        var remaining = note.ContentItems
            .Where(c => c.Id != contentItemId)
            .OrderBy(c => c.Order)
            .ToList();
        for (int i = 0; i < remaining.Count; i++)
        {
            remaining[i].Order = i;
        }

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // Helper: convert entity → DTO (keeps internal model separate from API surface)
    private static NoteDto MapToDto(Note note) => new()
    {
        Id = note.Id,
        Title = note.Title,
        ContentItems = note.ContentItems
            .Select(c => new ContentItemDto { 
                Id = c.Id, 
                Text = c.Text, 
                Order = c.Order,
                IsStarred = c.IsStarred
            })
            .ToList(),
        CreatedAt = note.CreatedAt,
        UpdatedAt = note.UpdatedAt
    };
}
