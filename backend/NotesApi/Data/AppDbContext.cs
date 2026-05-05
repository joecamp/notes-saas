using Microsoft.EntityFrameworkCore;
using NotesApi.Models;

namespace NotesApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Note> Notes => Set<Note>();
    public DbSet<ContentItem> ContentItems => Set<ContentItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Note>().HasData(
            new Note
            {
                Id = 1,
                Title = "Welcome to Notes",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Note
            {
                Id = 2,
                Title = "Call Janice",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<ContentItem>().HasData(
            new ContentItem
            {
                Id = 1,
                NoteId = 1,
                Text = "This is your first note. Try editing or deleting it!",
                Order = 0
            },
            new ContentItem
            {
                Id = 2,
                NoteId = 2,
                Text = "Let her know that I cannot watch her cat on Friday the 16th",
                Order = 0
            },
            new ContentItem
            {
                Id = 3,
                NoteId = 2,
                Text = "Tell her happy belated birthday",
                Order = 1
            }
        );
    }
}
