import { Note } from "../types/note";

interface NoteCardProps {
  note: Note;
  selected: boolean;
  onSelect: (id: number) => void;
}

export default function NoteCard({ note, selected, onSelect }: NoteCardProps) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div
      className={`note-list-item${selected ? " selected" : ""}`}
      onClick={() => onSelect(note.id)}
    >
      <div className="note-list-title">{note.title}</div>
      <div className="note-list-dates">
        <span>{note.contentItems.length} Items</span>
        <span>Created {formatDate(note.createdAt)}</span>
        <span>Edited {formatDate(note.updatedAt)}</span>
      </div>
    </div>
  );
}
