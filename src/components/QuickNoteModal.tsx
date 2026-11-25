import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileEdit,
  Trash2,
  Check,
  Plus,
  Clock,
  Sparkles,
  Tag,
  Shield,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { QuickNote, QuickNoteColor, QuickNoteCategory, NOTE_COLOR_CONFIG } from '../types/quickNotes';
import { useQuickNotes } from '../hooks/useQuickNotes';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionTitle: string;
}

const CATEGORY_MAP: Record<QuickNoteColor, QuickNoteCategory> = {
  emerald: 'High Conviction',
  amber: 'Key Question',
  cyan: 'Due Diligence',
  rose: 'Risk Flag',
  purple: 'Valuation Note',
};

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  isOpen,
  onClose,
  sectionId,
  sectionTitle,
}) => {
  const { sectionNotes, addNote, deleteNote } = useQuickNotes(sectionId);
  const [noteText, setNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState<QuickNoteColor>('cyan');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    addNote(
      sectionId,
      sectionTitle,
      noteText.trim(),
      selectedColor,
      CATEGORY_MAP[selectedColor],
      'Investor Note'
    );
    setNoteText('');
    setIsAddingNew(false);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/50">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>PERSISTENT INVESTOR ANNOTATIONS</span>
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Quick Notes: {sectionTitle}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Saved locally to your briefing session and mapped to the sidebar SectionMap.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notes List */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1 divide-y divide-slate-800/50">
              {sectionNotes.length === 0 && !isAddingNew ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                    <FileEdit className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium">No notes on this section yet</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Add a conviction point, question, or risk flag to track your evaluation.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/80 text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Annotation</span>
                  </button>
                </div>
              ) : (
                sectionNotes.map((note) => {
                  const cfg = NOTE_COLOR_CONFIG[note.color] || NOTE_COLOR_CONFIG.cyan;
                  return (
                    <div key={note.id} className="pt-3.5 first:pt-0 space-y-2 group">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cfg.hex, boxShadow: `0 0 8px ${cfg.hex}` }}
                          />
                          <span
                            className="text-[11px] font-mono font-bold uppercase tracking-wider"
                            style={{ color: cfg.hex }}
                          >
                            {note.category}
                          </span>
                          <span className="text-slate-600 font-mono text-[10px]">·</span>
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            {formatDate(note.createdAt)}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-all cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                        {note.text}
                      </p>
                    </div>
                  );
                })
              )}

              {/* Form to Add New Note */}
              {isAddingNew && (
                <form onSubmit={handleSubmit} className="pt-4 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Annotation Category & Color Marker:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(NOTE_COLOR_CONFIG) as QuickNoteColor[]).map((c) => {
                        const cfg = NOTE_COLOR_CONFIG[c];
                        const isSelected = selectedColor === c;
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 border-cyan-400 text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cfg.hex }}
                            />
                            <span className="text-[11px] font-mono truncate">{cfg.category}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Annotation Note:
                    </label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="e.g. Confirm Dhaka team retention rate and air-gapped security protocols..."
                      rows={3}
                      autoFocus
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!noteText.trim()}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
                    >
                      Save Annotation
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            {!isAddingNew && (
              <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  {sectionNotes.length} {sectionNotes.length === 1 ? 'annotation' : 'annotations'} saved
                </span>

                <button
                  onClick={() => setIsAddingNew(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Add Note</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
