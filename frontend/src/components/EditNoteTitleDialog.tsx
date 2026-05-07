import { useState } from "react";
import { Note } from "../types/note";

interface EditNoteTitleDialogProps {
  note: Note;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export default function EditNoteTitleDialog({ note, onSave, onCancel }: EditNoteTitleDialogProps) {
  const [text, setText] = useState(note.title);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(trimmed);
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="dialog-title">New Title</h3>
        <form className="basic-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            autoFocus
          />
          <div className="dialog-actions">
            <button type="button" className="btn btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" disabled={!text.trim()} className="btn btn-primary">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
