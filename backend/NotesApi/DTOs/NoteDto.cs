using System.ComponentModel.DataAnnotations;

namespace NotesApi.DTOs;

// What the API returns to the client
public class NoteDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<ContentItemDto> ContentItems { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateNoteDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
}

public class UpdateNoteTitleDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
}

public class UpdateNoteDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public List<string> ContentItems { get; set; } = new();
}
