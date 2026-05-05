using System.ComponentModel.DataAnnotations;

namespace NotesApi.Models;

public class Note
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    // Navigation property - one note has many content items
    public List<ContentItem> ContentItems { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
