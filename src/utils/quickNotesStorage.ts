import { QuickNote, QuickNoteColor, QuickNoteCategory } from '../types/quickNotes';

const STORAGE_KEY = 'spenta_investor_quick_notes_v1';
export const QUICK_NOTES_CHANGED_EVENT = 'spenta-quick-notes-changed';

// Sample initial notes to provide an authentic, live institutional preview if none exist
const DEFAULT_INITIAL_NOTES: QuickNote[] = [
  {
    id: 'note-init-1',
    sectionId: 'dual-engines',
    sectionTitle: 'Dual Engines',
    text: 'Strong margin insulation between physical architecture agency cashflow and digital asset royalties. Verify cross-selling conversion rates.',
    color: 'emerald',
    category: 'High Conviction',
    author: 'Investor Note',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'note-init-2',
    sectionId: 'unit-economics',
    sectionTitle: 'Unit Economics',
    text: 'Gross margins capped safely under 45% with fully absorbed Dhaka engineering labor. Model looks defensible for Seed SAFE round.',
    color: 'cyan',
    category: 'Due Diligence',
    author: 'Investor Note',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'note-init-3',
    sectionId: 'investment-terms',
    sectionTitle: 'Investment Terms',
    text: '$4.5M post-money cap aligns with standard YC SAFE terms. Clarify pro-rata rights for Series A follow-on.',
    color: 'amber',
    category: 'Key Question',
    author: 'Investor Note',
    createdAt: Date.now() - 3600000,
  },
];

export function getStoredQuickNotes(): QuickNote[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_NOTES));
      return DEFAULT_INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_NOTES;
  } catch (e) {
    console.warn('Failed to read quick notes from localStorage', e);
    return DEFAULT_INITIAL_NOTES;
  }
}

export function saveStoredQuickNotes(notes: QuickNote[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    window.dispatchEvent(new CustomEvent(QUICK_NOTES_CHANGED_EVENT, { detail: notes }));
  } catch (e) {
    console.warn('Failed to save quick notes to localStorage', e);
  }
}

export function addQuickNote(note: Omit<QuickNote, 'id' | 'createdAt'>): QuickNote {
  const current = getStoredQuickNotes();
  const newNote: QuickNote = {
    ...note,
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
  };
  const updated = [newNote, ...current];
  saveStoredQuickNotes(updated);
  return newNote;
}

export function updateQuickNote(id: string, updates: Partial<Pick<QuickNote, 'text' | 'color' | 'category'>>): void {
  const current = getStoredQuickNotes();
  const updated = current.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  saveStoredQuickNotes(updated);
}

export function deleteQuickNote(id: string): void {
  const current = getStoredQuickNotes();
  const updated = current.filter((n) => n.id !== id);
  saveStoredQuickNotes(updated);
}

export function getQuickNotesForSection(sectionId: string): QuickNote[] {
  const all = getStoredQuickNotes();
  return all.filter((n) => n.sectionId === sectionId);
}
