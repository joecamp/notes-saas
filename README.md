# Notes SaaS

A full-stack note-taking app built with ASP.NET Core + React + PostgreSQL.

## Architecture

```
┌──────────────────────┐     HTTP/JSON     ┌──────────────────────┐     EF Core    ┌─────────────────┐
│   React App          │ ◄───────────────► │   ASP.NET Core 9     │ ◄────────────► │   PostgreSQL    │
│   (Vite + TS)        │   localhost:5173  │   Web API            │ localhost:5432 │   Database      │
│                      │                   │                      │                │                 │
│  - Note list         │                   │  - NotesController   │                │  - Notes        │
│  - Note CRUD         │                   │  - EF Core           │                │  - ContentItems │
│  - ContentItem CRUD  │                   │  - DTOs / Validation │                │  (1:many)       │
│  - Drag/drop reorder │                   │                      │                │                 │
│  - Search / filter   │                   │                      │                │                 │
└──────────────────────┘                   └──────────────────────┘                └─────────────────┘
```

### Data Model

- **Note**: `Id`, `Title`, `CreatedAt`, `UpdatedAt` — has many `ContentItems`
- **ContentItem**: `Id`, `Text`, `Order`, `IsStarred`, `NoteId` (ForeignKey, cascade delete)

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/api/notes` | List all notes with content items |
| GET    | `/api/notes/{noteId}` | Get a single note |
| POST   | `/api/notes` | Create a note |
| PUT    | `/api/notes/{noteId}` | Replace note title + all content items |
| PATCH  | `/api/notes/{noteId}` | Update note title and/or content items |
| DELETE | `/api/notes/{noteId}` | Delete a note |
| POST   | `/api/notes/{noteId}/contentitems` | Add a content item |
| PATCH  | `/api/notes/{noteId}/contentitems/{itemId}` | Update content item properties |
| PATCH  | `/api/notes/{noteId}/contentitems/reorder` | Reorder content items |
| DELETE | `/api/notes/{noteId}/contentitems/{itemId}` | Remove a content item |

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/download/) (or use Docker: see below)

## Quick Start

### 1. Database (pick one)

**Option A — Docker (recommended):**
```bash
docker run --name notes-db -e POSTGRES_PASSWORD=<your-password> -e POSTGRES_DB=notesdb -p 5432:5432 -d postgres:15
```

**Option B — Local PostgreSQL:**
Create a database called `notesdb` and set the connection string in `appsettings.Development.json` (see below).

After either option, create `backend/NotesApi/appsettings.Development.json` with your credentials:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=notesdb;Username=postgres;Password=<your-password>"
  }
}
```

### 2. Backend

```bash
cd backend/NotesApi
dotnet restore
dotnet ef database update        # apply migrations
dotnet run                       # starts on http://localhost:5073
```

Test it: `curl http://localhost:5073/api/notes`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                      # starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Project Structure

```
notes-saas/
├── backend/
│   └── NotesApi/
│       ├── Controllers/
│       │   └── NotesController.cs              # All API endpoints
│       ├── Models/
│       │   ├── Note.cs                         # Note entity
│       │   └── ContentItem.cs                  # ContentItem entity
│       ├── Data/
│       │   └── AppDbContext.cs                 # EF Core DbContext
│       ├── DTOs/
│       │   ├── NoteDto.cs                      # Note request/response shapes
│       │   └── ContentItemDto.cs               # ContentItem request/response shapes
│       ├── Migrations/                         # EF Core migrations
│       ├── Program.cs                          # App entry point & config
│       ├── appsettings.json
│       └── NotesApi.csproj
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NoteCard.tsx                    # Sidebar note list item
│   │   │   ├── ContentItemRow.tsx              # Static content item row
│   │   │   ├── DraggableContentItemRow.tsx     # Drag/drop content item row
│   │   │   ├── ConfirmDialog.tsx               # Generic confirmation modal
│   │   │   ├── CreateNoteDialog.tsx            # New note modal
│   │   │   ├── EditNoteTitleDialog.tsx         # Edit note title modal
│   │   │   └── EditContentItemDialog.tsx       # Edit content item modal
│   │   ├── pages/
│   │   │   └── NotesPage.tsx                   # Main page — all state and handlers
│   │   ├── services/
│   │   │   └── notesApi.ts                     # All fetch calls to the backend
│   │   ├── types/
│   │   │   └── note.ts                         # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

## Roadmap

- [x] Walking skeleton (list, create, edit, delete notes)
- [x] ContentItems CRUD (add, edit, delete, star)
- [x] ContentItem drag/drop reordering
- [x] Note title editing
- [x] Search/filter content items
- [ ] Authentication (ASP.NET Identity + JWT)
- [ ] Tags / folders
- [ ] Sharing & collaboration
