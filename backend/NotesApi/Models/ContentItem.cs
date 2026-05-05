using System.ComponentModel.DataAnnotations;

namespace NotesApi.Models;

public class ContentItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Text { get; set; } = string.Empty;

    public int Order { get; set; }

    public bool IsStarred { get; set; } = false;

    // Foreign key - tells EF Core which note this belongs to
    public int NoteId { get; set; }

    // Navigation property - lets you access the parent note from a content item
    public Note? Note { get; set; } = null;
}