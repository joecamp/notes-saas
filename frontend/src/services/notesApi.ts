import { Note, CreateNote, UpdateNote, PatchContentItem } from "../types/note";

const API_BASE = "http://localhost:5073/api";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error ${response.status}: ${message}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}

// --- Notes API ---

export async function getNotes(): Promise<Note[]> {
  return apiFetch<Note[]>(`${API_BASE}/notes`);
}

export async function getNoteById(id: number): Promise<Note> {
  return apiFetch<Note>(`${API_BASE}/notes/${id}`);
}

export async function createNote(note: CreateNote): Promise<Note> {
  return apiFetch<Note>(`${API_BASE}/notes`, {
    method: "POST",
    body: JSON.stringify(note),
  });
}

export async function updateNote(id: number, note: UpdateNote): Promise<Note> {
  return apiFetch<Note>(`${API_BASE}/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(note),
  });
}

export async function deleteNote(id: number): Promise<void> {
  return apiFetch<void>(`${API_BASE}/notes/${id}`, {
    method: "DELETE",
  });
}

// --- Content Items API ---

export async function addContentItem(noteId: number, text: string): Promise<Note> {
  return apiFetch<Note>(`${API_BASE}/notes/${noteId}/contentitems`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function patchContentItem(noteId: number, contentItemId: number, patch: PatchContentItem): Promise<Note> {
  return apiFetch<Note>(`${API_BASE}/notes/${noteId}/contentitems/${contentItemId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteContentItem(noteId: number, contentItemId: number): Promise<void> {
  return apiFetch<void>(`${API_BASE}/notes/${noteId}/contentitems/${contentItemId}`, {
    method: "DELETE",
  });
}
