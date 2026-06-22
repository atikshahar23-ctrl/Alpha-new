// Smart Notes — structured notes with categories, pinning,
// timestamps, and quick capture.

export interface SmartNote {
  id: string;
  text: string;
  category: string;
  pinned: boolean;
  created: string;
  updated: string;
}

const KEY = 'alpha_smart_notes_v1';

export function loadSmartNotes(): SmartNote[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function save(notes: SmartNote[]) {
  localStorage.setItem(KEY, JSON.stringify(notes));
}

export function addSmartNote(text: string, category = 'General'): SmartNote {
  const notes = loadSmartNotes();
  const now = new Date().toISOString();
  const note: SmartNote = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: text.trim(),
    category,
    pinned: false,
    created: now.slice(0, 10),
    updated: now.slice(0, 10),
  };
  notes.unshift(note);
  save(notes);
  return note;
}

export function updateSmartNote(id: string, patch: Partial<SmartNote>) {
  const notes = loadSmartNotes();
  const n = notes.find(x => x.id === id);
  if (n) {
    Object.assign(n, patch, { updated: new Date().toISOString().slice(0, 10) });
    save(notes);
  }
}

export function removeSmartNote(id: string) {
  save(loadSmartNotes().filter(n => n.id !== id));
}

export function togglePin(id: string) {
  const notes = loadSmartNotes();
  const n = notes.find(x => x.id === id);
  if (n) { n.pinned = !n.pinned; save(notes); }
}

export function notesByCategory(): Record<string, SmartNote[]> {
  const notes = loadSmartNotes();
  const grouped: Record<string, SmartNote[]> = {};
  for (const n of notes) {
    const cat = n.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(n);
  }
  return grouped;
}

export function noteCategories(): string[] {
  const cats = new Set(loadSmartNotes().map(n => n.category || 'General'));
  return ['General', 'Ideas', 'Work', 'Personal', 'Reference', ...Array.from(cats)].filter((c, i, a) => a.indexOf(c) === i);
}

export const NOTE_CATEGORIES = ['General', 'Ideas', 'Work', 'Personal', 'Reference', 'Meeting', 'Research'];
