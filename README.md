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

#### Auth
| Method | Path | Purpose |
|--------|------|---------|
| POST   | `/api/auth/register` | Create a new account |
| POST   | `/api/auth/login` | Login and receive a JWT token |

#### Notes (requires Bearer token)
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

**For Docker Compose:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**For manual setup:**
- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/download/)

## Quick Start

### Option A — Docker Compose (recommended)

Runs the database, backend, and frontend together in containers. Migrations are applied automatically on startup.

```bash
docker compose up --build
```

Open http://localhost:5173 in your browser. Swagger is available at http://localhost:5073/swagger.

To run the frontend manually with hot reload while keeping the rest in Docker:

```bash
docker compose up db backend   # start only the database and API
cd frontend && npm run dev     # run frontend locally
```

---

### Option B — Manual Setup

#### 1. Database

Create `backend/NotesApi/appsettings.Development.json` with your credentials:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=notesdb;Username=postgres;Password=<your-password>"
  }
}
```

Or spin up PostgreSQL via Docker:
```bash
docker run --name notes-db -e POSTGRES_PASSWORD=<your-password> -e POSTGRES_DB=notesdb -p 5432:5432 -d postgres:15
```

#### 2. Backend

```bash
cd backend/NotesApi
dotnet restore
dotnet ef database update        # apply migrations
dotnet run                       # starts on http://localhost:5073
```

#### 3. Frontend

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
│       │   ├── NotesController.cs              # Notes endpoints (requires auth)
│       │   └── AuthController.cs               # Register / login endpoints
│       ├── Models/
│       │   ├── Note.cs                         # Note entity
│       │   ├── ContentItem.cs                  # ContentItem entity
│       │   └── ApplicationUser.cs              # ASP.NET Identity user
│       ├── Data/
│       │   └── AppDbContext.cs                 # EF Core DbContext (extends IdentityDbContext)
│       ├── DTOs/
│       │   ├── NoteDto.cs                      # Note request/response shapes
│       │   ├── ContentItemDto.cs               # ContentItem request/response shapes
│       │   └── AuthDtos.cs                     # Register / login / token shapes
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
│   │   │   ├── NotesPage.tsx                   # Main page — all state and handlers
│   │   │   └── AuthPage.tsx                    # Login / register page
│   │   ├── services/
│   │   │   ├── notesApi.ts                     # All fetch calls to the notes backend
│   │   │   └── authApi.ts                      # Login, register, token storage
│   │   ├── types/
│   │   │   ├── note.ts                         # TypeScript interfaces for notes
│   │   │   └── auth.ts                         # TypeScript interfaces for auth
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
- [x] Authentication (ASP.NET Identity + JWT)
- [ ] Tags / folders
- [ ] Sharing & collaboration
