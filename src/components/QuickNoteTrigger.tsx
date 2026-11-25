import React, { useState } from 'react';
import { FileEdit } from 'lucide-react';
import { useQuickNotes } from '../hooks/useQuickNotes';
import { NOTE_COLOR_CONFIG } from '../types/quickNotes';
import { QuickNoteModal } from './QuickNoteModal';

interface QuickNoteTriggerProps {
  sectionId: string;
  sectionTitle: string;
  className?: string;
}

export const QuickNoteTrigger: React.FC<QuickNoteTriggerProps> = ({
  sectionId,
  sectionTitle,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sectionNotes, primaryColorBySection } = useQuickNotes(sectionId);

  const noteCount = sectionNotes.length;
  const primaryColor = primaryColorBySection[sectionId] || 'cyan';
  const colorCfg = NOTE_COLOR_CONFIG[primaryColor];

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-slate-900/60 ${className}`}
        title={`View or add notes for ${sectionTitle}`}
        aria-label={`Investor notes for ${sectionTitle}`}
      >
        <div className="relative flex items-center justify-center">
          <FileEdit className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          {noteCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-slate-950"
              style={{ backgroundColor: colorCfg.hex, boxShadow: `0 0 6px ${colorCfg.hex}` }}
            />
          )}
        </div>
        <span className="text-[11px] font-mono text-slate-400 hover:text-slate-200">
          {noteCount > 0 ? `Notes (${noteCount})` : 'Note'}
        </span>
      </button>

      <QuickNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectionId={sectionId}
        sectionTitle={sectionTitle}
      />
    </>
  );
};
