import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionTooltipState } from '../hooks/useSectionSummaryTooltip';
import { Sparkles, Clock } from 'lucide-react';
import { getSectionReadingTime } from '../utils/readingTime';

interface SectionSummaryTooltipProps {
  tooltipState: SectionTooltipState | null;
}

const ACCENT_CLASSES: Record<
  SectionTooltipState['accent'],
  { badge: string; border: string; glow: string }
> = {
  cyan: {
    badge: 'text-cyan-400 bg-cyan-950/70 border-cyan-500/40',
    border: 'border-cyan-500/40',
    glow: 'shadow-cyan-950/50',
  },
  emerald: {
    badge: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-950/50',
  },
  indigo: {
    badge: 'text-indigo-400 bg-indigo-950/70 border-indigo-500/40',
    border: 'border-indigo-500/40',
    glow: 'shadow-indigo-950/50',
  },
  purple: {
    badge: 'text-purple-400 bg-purple-950/70 border-purple-500/40',
    border: 'border-purple-500/40',
    glow: 'shadow-purple-950/50',
  },
  amber: {
    badge: 'text-amber-400 bg-amber-950/70 border-amber-500/40',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-950/50',
  },
};

export const SectionSummaryTooltip: React.FC<SectionSummaryTooltipProps> = ({
  tooltipState,
}) => {
  if (!tooltipState || !tooltipState.isVisible) return null;

  const styleConfig = ACCENT_CLASSES[tooltipState.accent] || ACCENT_CLASSES.cyan;
  const readingStats = getSectionReadingTime(tooltipState.sectionId);

  return (
    <AnimatePresence>
      <motion.div
        key={`tooltip-${tooltipState.sectionId}`}
        initial={{ opacity: 0, scale: 0.94, y: tooltipState.placement === 'top' ? 4 : -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          left: `${tooltipState.x}px`,
          top: `${tooltipState.y}px`,
          transform: `translate(-50%, ${tooltipState.placement === 'top' ? '-100%' : '0%'})`,
        }}
        className={`pointer-events-none z-[80] w-[320px] sm:w-[360px] p-3.5 rounded-xl bg-slate-950/95 border ${styleConfig.border} shadow-2xl ${styleConfig.glow} backdrop-blur-xl text-slate-100 select-none no-print`}
        role="tooltip"
        aria-hidden="true"
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border uppercase shrink-0 ${styleConfig.badge}`}
            >
              {tooltipState.code}
            </span>
            <span className="text-xs font-bold text-white font-display truncate">
              {tooltipState.title}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{readingStats.formatted}</span>
          </div>
        </div>

        {/* One-Sentence Summary */}
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {tooltipState.summary}
        </p>

        {/* Pointer Triangle */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-slate-950 border-r border-b ${
            styleConfig.border
          } ${
            tooltipState.placement === 'top'
              ? '-bottom-1.5 border-t-0 border-l-0'
              : '-top-1.5 border-b-0 border-r-0 border-t border-l'
          }`}
        />
      </motion.div>
    </AnimatePresence>
  );
};
