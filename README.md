# Notes SaaS — Phase 1: Walking Skeleton

A full-stack note-taking app built with ASP.NET Core + React + PostgreSQL.

## Architecture

```
┌─────────────────┐       HTTP/JSON       ┌─────────────────┐       EF Core       ┌─────────────────┐
│   React App     │  ◄──────────────────►  │  ASP.NET Core   │  ◄───────────────►  │   PostgreSQL    │
│   (Vite + TS)   │     localhost:5173     │   Web API        │    localhost:5432   │   Database      │
│                 │         ──►            │                 │        ──►          │                 │
│  - Note list    │   GET /api/notes       │  - Controllers  │   SELECT * FROM     │  - Notes table  │
│  - Create form  │   POST /api/notes      │  - EF Core      │     notes           │                 │
│  - Edit/Delete  │   PUT /api/notes/{id}  │  - Validation   │   INSERT INTO ...   │                 │
│                 │   DELETE /api/notes/{id}│                 │                     │                 │
└─────────────────┘                        └─────────────────┘                     └─────────────────┘
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
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
│       ├── Controllers/         # API endpoints
│       │   └── NotesController.cs
│       ├── Models/              # Database entities
│       │   └── Note.cs
│       ├── Data/                # EF Core DbContext
│       │   └── AppDbContext.cs
│       ├── DTOs/                # Request/response shapes
│       │   └── NoteDto.cs
│       ├── Program.cs           # App entry point & config
│       ├── appsettings.json
│       └── NotesApi.csproj
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI pieces
│   │   │   └── NoteCard.tsx
│   │   ├── pages/               # Page-level components
│   │   │   └── NotesPage.tsx
│   │   ├── services/            # API call functions
│   │   │   └── notesApi.ts
│   │   ├── types/               # TypeScript interfaces
│   │   │   └── note.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

## Phase Roadmap

- [x] **Phase 1** — Walking skeleton (list, create, edit, delete notes)
- [ ] **Phase 2** — Full CRUD polish (validation, error handling, loading states)
- [ ] **Phase 3** — Authentication (ASP.NET Identity + JWT)
- [ ] **Phase 4** — Features (search, tags/folders, sharing, dashboard)
