import { useState, useEffect } from "react";
import { Note } from "../types/note";
import {
  getNotes,
  createNote,
  deleteNote,
  addContentItem,
  deleteContentItem,
  toggleStarContentItem,
} from "../services/notesApi";
import NoteCard from "../components/NoteCard";
import ContentItemRow from "../components/ContentItemRow";
import ConfirmDialog from "../components/ConfirmDialog";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    const title = newNoteTitle.trim();
    if (!title) return;
    try {
      setError(null);
      const created = await createNote({ title });
      setNotes((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setNewNoteTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    }
  }

  async function handleDeleteNote(id: number) {
    try {
      setError(null);
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const text = newItemText.trim();
    if (!text || !selectedId) return;
    try {
      setError(null);
      const updated = await addContentItem(selectedId, text);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setNewItemText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  }

  async function handleToggleStarItem(contentItemId: number) {
    if (!selectedId) return;
    try {
      setError(null);
      const updated = await toggleStarContentItem(selectedId, contentItemId);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle star on item");
    }
  }

  async function handleDeleteItem(contentItemId: number) {
    if (!selectedId) return;
    try {
      setError(null);
      await deleteContentItem(selectedId, contentItemId);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedId
            ? { ...n, contentItems: n.contentItems.filter((c) => c.id !== contentItemId) }
            : n
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title">Notes</h1>
          <form className="new-note-form" onSubmit={handleCreateNote}>
            <input
              type="text"
              placeholder="New note title..."
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              maxLength={200}
            />
            <button type="submit" className="btn btn-primary btn-block">
              + New Note
            </button>
          </form>
        </div>

        {error && <div className="error-banner sidebar-error">{error}</div>}

        <div className="sidebar-notes">
          {loading ? (
            <p className="sidebar-empty">Loading...</p>
          ) : notes.length === 0 ? (
            <p className="sidebar-empty">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                selected={note.id === selectedId}
                onSelect={setSelectedId}
              />
            ))
          )}
        </div>
      </aside>

      <main className="main-content">
        {selectedNote ? (
          <>
            <div className="main-header">
              <div className="main-header-row">
                <h2 className="main-title">{selectedNote.title}</h2>
                <button
                  className="btn btn-delete"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Note
                </button>
              </div>
              <div className="main-dates">
                <span>Created {formatDate(selectedNote.createdAt)}</span>
                <span>·</span>
                <span>Edited {formatDate(selectedNote.updatedAt)}</span>
              </div>
            </div>

            <ul className="content-items-list">
              {selectedNote.contentItems.length === 0 ? (
                <li className="empty-items">No items yet. Add one below.</li>
              ) : (
                selectedNote.contentItems.map((item) => (
                  <ContentItemRow
                    key={item.id}
                    item={item}
                    onToggleStar={handleToggleStarItem}
                    onDelete={handleDeleteItem}
                  />
                ))
              )}
            </ul>

            <form className="add-item-form" onSubmit={handleAddItem}>
              <input
                type="text"
                placeholder="Add a new item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                maxLength={200}
              />
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </form>
          </>
        ) : (
          <div className="no-selection">
            <p>Select a note to view its content.</p>
          </div>
        )}
      </main>

      {showDeleteDialog && selectedNote && (
        <ConfirmDialog
          title="Delete Note"
          message={`Are you sure you want to delete "${selectedNote.title}"? This cannot be undone.`}
          onConfirm={() => { handleDeleteNote(selectedNote.id); setShowDeleteDialog(false); }}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
