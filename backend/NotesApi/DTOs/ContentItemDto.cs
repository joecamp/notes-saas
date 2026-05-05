using System.ComponentModel.DataAnnotations;

namespace NotesApi.DTOs;

public class ContentItemDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsStarred { get; set; }
}

public class AddContentItemDto
{
    [Required]
    [MaxLength(200)]
    public string Text { get; set; } = string.Empty;
}

public class UpdateContentItemTextDto
{
    [Required]
    [MaxLength(200)]
    public string Text { get; set; } = string.Empty;
}
