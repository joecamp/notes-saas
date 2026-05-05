# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Notes SaaS is a full-stack note-taking application. The backend is ASP.NET Core 9.0 serving a REST API, and the frontend is React 18 + TypeScript built with Vite. PostgreSQL is the database, accessed via Entity Framework Core.

## Development Commands

### Backend (`/backend/NotesApi/`)
```bash
dotnet restore                   # Install NuGet packages
dotnet run                       # Start API server at http://localhost:5073
dotnet ef database update        # Apply pending EF Core migrations
dotnet ef migrations add <Name>  # Create a new migration
```
Swagger UI is available at `http://localhost:5073/swagger` when running in development.

### Frontend (`/frontend/`)
```bash
npm install      # Install dependencies
npm run dev      # Start Vite dev server at http://localhost:5173
npm run build    # Type-check + production build
npm run preview  # Preview the production build
```

### Database
Start a local PostgreSQL 15 instance via Docker:
```bash
docker run --name notes-db -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=notesdb -p 5432:5432 -d postgres:15
```
The connection string in `appsettings.json` targets `localhost:5432` with database `notesdb`, user `postgres`, password `devpass`.

## Architecture

```
Frontend (React/TS/Vite @ :5173)
  └── services/notesApi.ts  →  REST calls
Backend (ASP.NET Core @ :5073)
  └── Controllers/NotesController.cs  →  endpoint handlers
  └── Data/AppDbContext.cs            →  EF Core context
  └── DTOs/                           →  API contract shapes
  └── Models/                         →  EF Core entities
Database (PostgreSQL @ :5432)
  └── Notes table  (1:many)  ContentItems table
```

### Data Model
- **Note**: `Id`, `Title`, `CreatedAt`, `UpdatedAt` + navigation property `ContentItems`
- **ContentItem**: `Id`, `Text`, `Order` (sort within note), `NoteId` (FK, cascade delete)

### API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/notes` | List all notes with content items |
| GET | `/api/notes/{id}` | Get a single note |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/{id}` | Replace note title + content items |
| DELETE | `/api/notes/{id}` | Delete a note |
| POST | `/api/notes/{noteId}/contentitems` | Add a content item |
| DELETE | `/api/notes/{noteId}/contentitems/{itemId}` | Remove a content item |

PUT replaces all content items; it does not merge. Pass the full desired list.

### Frontend Structure
- `src/services/notesApi.ts` — all `fetch` calls to the backend (single source of truth for the API contract)
- `src/types/note.ts` — TypeScript interfaces mirroring backend DTOs
- `src/pages/NotesPage.tsx` — top-level state: note list, selected note, modal open/closed
- `src/components/NoteCard.tsx` — display tile; `NoteForm.tsx` — create/edit form

### CORS
The backend allows only `http://localhost:5173`. Update `Program.cs` if the frontend origin changes.

## TypeScript
Strict mode is enabled (`tsconfig.json`). Keep all types explicit; avoid `any`.
