import { useState, useEffect, useCallback } from 'react';
import { QuickNote, QuickNoteColor, QuickNoteCategory } from '../types/quickNotes';
import {
  getStoredQuickNotes,
  addQuickNote,
  updateQuickNote,
  deleteQuickNote,
  QUICK_NOTES_CHANGED_EVENT,
} from '../utils/quickNotesStorage';

export function useQuickNotes(sectionId?: string) {
  const [notes, setNotes] = useState<QuickNote[]>(() => getStoredQuickNotes());

  useEffect(() => {
    const handleUpdate = () => {
      setNotes(getStoredQuickNotes());
    };

    window.addEventListener(QUICK_NOTES_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(QUICK_NOTES_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const sectionNotes = sectionId
    ? notes.filter((n) => n.sectionId === sectionId)
    : notes;

  const notesCountBySection = notes.reduce<Record<string, number>>((acc, n) => {
    acc[n.sectionId] = (acc[n.sectionId] || 0) + 1;
    return acc;
  }, {});

  const primaryColorBySection = notes.reduce<Record<string, QuickNoteColor>>((acc, n) => {
    // If not set yet, use the most recent note's color
    if (!acc[n.sectionId]) {
      acc[n.sectionId] = n.color;
    }
    return acc;
  }, {});

  const handleAddNote = useCallback(
    (targetSectionId: string, sectionTitle: string, text: string, color: QuickNoteColor, category: QuickNoteCategory, author: string = 'Investor Note') => {
      return addQuickNote({
        sectionId: targetSectionId,
        sectionTitle,
        text,
        color,
        category,
        author,
      });
    },
    []
  );

  const handleUpdateNote = useCallback((id: string, updates: Partial<Pick<QuickNote, 'text' | 'color' | 'category'>>) => {
    updateQuickNote(id, updates);
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    deleteQuickNote(id);
  }, []);

  return {
    allNotes: notes,
    sectionNotes,
    notesCountBySection,
    primaryColorBySection,
    addNote: handleAddNote,
    updateNote: handleUpdateNote,
    deleteNote: handleDeleteNote,
  };
}
