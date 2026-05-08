import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Star, Pencil, Trash2 } from "lucide-react";
import { ContentItem } from "../types/note";

interface DraggableContentItemRowProps {
  item: ContentItem;
  index: number;
  onToggleStar: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function DraggableContentItemRow({ item, index, onToggleStar, onEdit, onDelete }: DraggableContentItemRowProps) {
  const [hovered, setHovered] = useState(false);
  const [starHovered, setStarHovered] = useState(false);
  const { ref, isDragging } = useSortable({ id: item.id, index });

  return (
    <li
      ref={ref}
      className={`content-item-row${hovered ? " hovered" : ""}${isDragging ? " dragging" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Star
        className={`item-star${item.isStarred ? " item-star-active" : starHovered ? " item-star-hovered" : ""}`}
        size={20}
        onMouseEnter={() => setStarHovered(true)}
        onMouseLeave={() => setStarHovered(false)}
        onClick={() => onToggleStar(item.id)}
      />
      <span className="item-text">{item.text}</span>
      <button className="icon-btn" onClick={() => onEdit(item.id)}>
        <Pencil size={20} />
      </button>
      <button className="icon-btn icon-btn-trash" onClick={() => onDelete(item.id)}>
        <Trash2 size={20} />
      </button>
    </li>
  );
}
