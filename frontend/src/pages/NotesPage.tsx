import { useState, useEffect } from "react";
import { Note, ContentItem } from "../types/note";
import { getEmail } from "../services/authApi";
import {
  getNotes,
  createNote,
  patchNote,
  deleteNote,
  addContentItem,
  deleteContentItem,
  patchContentItem,
  patchReorderContentItems,
} from "../services/notesApi";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

import NoteCard from "../components/NoteCard";
import DraggableContentItemRow from "../components/DraggableContentItemRow";
import CreateNoteDialog from "../components/CreateNoteDialog";
import EditNoteTitleDialog from "../components/EditNoteTitleDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import EditContentItemDialog from "../components/EditContentItemDialog";

interface Props {
  onLogout: () => void;
}

export default function NotesPage({ onLogout }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draggableItems, setDraggableItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateNoteDialog, setShowCreateNoteDialog] = useState(false);
  const [showEditNoteTitleDialog, setShowEditNoteTitleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    setSearchQuery("");
    setDraggableItems(selectedNote ? [...selectedNote.contentItems] : []);
  }, [selectedId]);

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

  async function handleCreateNote(text: string) {
    try {
      setError(null);
      const created = await createNote({ title : text });
      setNotes((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setShowCreateNoteDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    }
  }

  async function handleEditNoteTitle(text: string) {
    if (!selectedId) return;
    try {
      setError(null);
      const updated = await patchNote(selectedId, { title: text });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setShowEditNoteTitleDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note title");
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

  async function handleAddContentItem(e: React.FormEvent) {
    e.preventDefault();
    const text = newItemText.trim();
    if (!text || !selectedId) return;
    try {
      setError(null);
      const updated = await addContentItem(selectedId, text);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setDraggableItems([...updated.contentItems]);
      setNewItemText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  }

  async function handleToggleStarContentItem(contentItemId: number) {
    if (!selectedId || !selectedNote) return;
    const item = selectedNote.contentItems.find((c) => c.id === contentItemId);
    if (!item) return;
    try {
      setError(null);
      const updated = await patchContentItem(selectedId, contentItemId, { isStarred: !item.isStarred });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setDraggableItems((prev) => prev.map((c) => c.id === contentItemId ? { ...c, isStarred: !c.isStarred } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle star on item");
    }
  }

  function handleEditContentItem(contentItemId: number) {
    if (!selectedNote) return;
    const item = selectedNote.contentItems.find((c) => c.id === contentItemId);
    if (item) setEditingItem(item);
  }

  async function handleSaveEditContentItem(text: string) {
    if (!selectedId || !editingItem) return;
    try {
      setError(null);
      const updated = await patchContentItem(selectedId, editingItem.id, { text });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setDraggableItems((prev) => prev.map((c) => c.id === editingItem.id ? { ...c, text } : c));
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  }

  async function handleDragEnd(event: any) {
    if (!selectedId) return;
    const reordered = move(draggableItems, event);
    setDraggableItems(reordered);
    try {
      setError(null);
      const updated = await patchReorderContentItems(selectedId, {
        orderedIds: reordered.map((item) => item.id),
      });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } catch (err) {
      setDraggableItems(selectedNote ? [...selectedNote.contentItems] : []);
      setError(err instanceof Error ? err.message : "Failed to reorder items");
    }
  }

  async function handleDeleteContentItem(contentItemId: number) {
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
      setDraggableItems((prev) => prev.filter((c) => c.id !== contentItemId));
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
          <h1 className="app-title no-select">Notes</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p className="no-select" style={{ fontSize: "0.75rem", margin: 0, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {getEmail()}
            </p>
            <button className="btn btn-delete" onClick={onLogout}>Logout</button>
          </div>
        </div>

        {error && <div className="error-banner sidebar-error">{error}</div>}

        <div className="sidebar-notes">
          {loading ? (
            <p className="sidebar-empty no-select" >Loading...</p>
          ) : notes.length === 0 ? (
            <p className="sidebar-empty no-select">No notes yet.</p>
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
        <div>
          <button className="btn btn-new-note btn-primary btn-block" onClick={() => setShowCreateNoteDialog(true)}>
            New Note
          </button>
        </div>
      </aside>

      <main className="main-content">
        {selectedNote ? (
          <>
            <div className="main-header">
              <div className="main-header-row">
                <h2 className="main-title no-select">{selectedNote.title}</h2>
                <div>
                  <button 
                    className="btn btn-edit"
                    onClick={() => setShowEditNoteTitleDialog(true)}>
                    Edit Title
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => setShowDeleteDialog(true)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="main-dates no-select">
                <span>Created {formatDate(selectedNote.createdAt)}</span>
                <span>·</span>
                <span>Edited {formatDate(selectedNote.updatedAt)}</span>
              </div>
            </div>

            <div className="search-bar">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DragDropProvider onDragEnd={handleDragEnd}>
              <ul className="content-items-list">
                {draggableItems.length === 0 ? (
                  <li className="empty-items no-select">No items yet. Add one below.</li>
                ) : (
                  draggableItems
                    .filter((item) => item.text.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item, index) => (
                    <DraggableContentItemRow
                      key={item.id}
                      item={item}
                      index={index}
                      onToggleStar={handleToggleStarContentItem}
                      onEdit={handleEditContentItem}
                      onDelete={handleDeleteContentItem}
                    />
                  ))
                )}
              </ul>
            </DragDropProvider>

            <form className="add-item-form" onSubmit={handleAddContentItem}>
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
          /* No Notes to display */
          <div className="no-selection no-select">
            <p>Select a note to view its content.</p>
          </div>
        )}
      </main>

      {/* Create Note Dialog */}
      {showCreateNoteDialog && (
        <CreateNoteDialog
          onConfirm={handleCreateNote}
          onCancel={() => setShowCreateNoteDialog(false)}
        />
      )}

      {/* Edit Note Dialog */}
      {showEditNoteTitleDialog && selectedNote && (
        <EditNoteTitleDialog
          note={selectedNote}
          onSave={handleEditNoteTitle}
          onCancel={() => setShowEditNoteTitleDialog(false)}
        />
      )}

      {/* Delete Note Dialog */}
      {showDeleteDialog && selectedNote && (
        <ConfirmDialog
          title="Delete Note"
          message={`Are you sure you want to delete "${selectedNote.title}"? This cannot be undone.`}
          onConfirm={() => { handleDeleteNote(selectedNote.id); setShowDeleteDialog(false); }}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
      
      {/* Edit ContentItem Dialog */}
      {editingItem && (
        <EditContentItemDialog
          item={editingItem}
          onSave={handleSaveEditContentItem}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
