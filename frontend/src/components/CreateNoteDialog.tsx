import { useState } from "react";

interface CreateNoteDialogProps {
  onConfirm: (noteTitle: string) => void;
  onCancel: () => void;
}

export default function CreateNoteDialog({ onConfirm, onCancel }: CreateNoteDialogProps) {
  const [noteTitle, setNoteTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = noteTitle.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="dialog-title">New Note Title</h3>
        <form className="basic-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            maxLength={200}
            autoFocus
          />
          <div className="dialog-actions">
            <button type="button" className="btn btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" disabled={!noteTitle.trim()} className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
