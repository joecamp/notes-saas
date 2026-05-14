using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using NotesApi.Data;
using NotesApi.DTOs;
using NotesApi.Models;

namespace NotesApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly AppDbContext _db;

    private string GetUserId()
    {
        return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
    }

    public NotesController(AppDbContext db)
    {
        _db = db;
    }

    // Get all Notes
    // GET /api/notes
    [HttpGet]
    public async Task<ActionResult<List<NoteDto>>> GetAll()
    {
        var userId = GetUserId();
        var notes = await _db.Notes
            .Where(n => n.UserId == userId)
            .Include(n => n.ContentItems.OrderBy(c => c.Order))
            .OrderByDescending(n => n.UpdatedAt)
            .Select(n => MapToDto(n))
            .ToListAsync();

        return Ok(notes);
    }

    // Get a Note by Id
    // GET /api/notes/{id}
    [HttpGet("{noteId}")]
    public async Task<ActionResult<NoteDto>> GetById(int noteId)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems.OrderBy(c => c.Order))
            .FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == GetUserId());

        if (note is null) return NotFound();

        return Ok(MapToDto(note));
    }

    // Create a Note
    // POST /api/notes
    [HttpPost]
    public async Task<ActionResult<NoteDto>> CreateNote(CreateNoteDto dto)
    {
        var note = new Note
        {
            UserId = GetUserId(),
            Title = dto.Title,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Notes.Add(note);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { noteId = note.Id }, MapToDto(note));
    }

    // Update a Note with new data
    // PUT /api/notes/{id}
    [HttpPut("{noteId}")]
    public async Task<ActionResult<NoteDto>> ReplaceNote(int noteId, UpdateNoteDto dto)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems)
            .FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == GetUserId());

        if (note is null) return NotFound();

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

    // Patch properties of a Note
    // PATCH /api/notes/{id}
    [HttpPatch("{noteId}")]
    public async Task<ActionResult<NoteDto>> UpdateNote(
    int noteId, PatchNoteDto dto)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems.OrderBy(c => c.Order))
            .FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == GetUserId());

        if (note is null) return NotFound();

        if (dto.Title is not null)
        {
            note.Title = dto.Title;
        }
        if(dto.ContentItems is not null)
        {
            // Remove old content items and replace with new ones
            _db.ContentItems.RemoveRange(note.ContentItems);
            note.ContentItems = dto.ContentItems
                .Select((text, index) => new ContentItem { Text = text, Order = index })
                .ToList();
        }

        note.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(MapToDto(note));
    }

    // Delete a Note
    // DELETE /api/notes/{id}
    [HttpDelete("{noteId}")]
    public async Task<ActionResult> DeleteNote(int noteId)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems)
            .FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == GetUserId());

        if (note is null) return NotFound();

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
            .FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == GetUserId());

        if (note is null) return NotFound();

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

        return CreatedAtAction(nameof(GetById), new { noteId = noteId }, MapToDto(note));
    }

    // Patch properties of a ContentItem
    // PATCH /api/notes/{id}/contentitems/{contentItemId}
    [HttpPatch("{noteId}/contentitems/{contentItemId}")]
    public async Task<ActionResult<NoteDto>> UpdateContentItem(
        int noteId, int contentItemId, PatchContentItemDto dto)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems.OrderBy(c => c.Order))
            .FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == GetUserId());

        if (note is null) return NotFound();

        var item = note.ContentItems.FirstOrDefault(item => item.Id == contentItemId);
        if (item is null) return NotFound();

        if(dto.Text is not null)
        {
            item.Text = dto.Text;
        }
        if (dto.Order is not null)
        {
            item.Order = dto.Order.Value;
        }
        if (dto.IsStarred is not null)
        {
            item.IsStarred = dto.IsStarred.Value;
        }

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
            .FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == GetUserId());

        if (note is null) return NotFound();

        var itemToDelete = note.ContentItems.FirstOrDefault(item => item.Id == contentItemId);
        if (itemToDelete is null) return NotFound();

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

    // Reorder a Note's ContentItems
    // PATCH /api/notes/{noteId}/contentitems/reorder
    [HttpPatch("{noteId}/contentitems/reorder")]
    public async Task<ActionResult<NoteDto>> ReorderContentItems(int noteId, ReorderContentItemsDto dto)
    {
        var note = await _db.Notes
            .Include(n => n.ContentItems)
            .FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == GetUserId());

        if (note is null) return NotFound();

        // Validate ContentItem Ids
        var noteItemIds = note.ContentItems.Select(c => c.Id).ToHashSet();
        var sentIds = dto.OrderedIds.ToHashSet();
        if(!noteItemIds.SetEquals(sentIds))
        {
            return BadRequest("Provided IDs do not match the note's content items.");
        }

        for(int i = 0; i < dto.OrderedIds.Count; i++)
        {
            var item = note.ContentItems.FirstOrDefault(c => c.Id == dto.OrderedIds[i]);
            if(item is not null)
            {
                item.Order = i;
            }
        }

        note.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(MapToDto(note));
    }

    // Helper: convert entity → DTO (keeps internal model separate from API surface)
    private static NoteDto MapToDto(Note note) => new()
    {
        Id = note.Id,
        Title = note.Title,
        ContentItems = note.ContentItems
            .OrderBy(c => c.Order)
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
