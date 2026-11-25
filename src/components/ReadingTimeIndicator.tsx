import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getSectionReadingTime, ReadingTimeResult } from '../utils/readingTime';

interface ReadingTimeIndicatorProps {
  sectionId: string;
  className?: string;
  showWordCount?: boolean;
}

/**
 * Clean, unboxed Reading Time indicator metadata component.
 * Adheres to Zero-Pill design constitution: rendered as clean text with typographic separator.
 */
export const ReadingTimeIndicator: React.FC<ReadingTimeIndicatorProps> = ({
  sectionId,
  className = '',
  showWordCount = true,
}) => {
  const [stats, setStats] = useState<ReadingTimeResult>(() =>
    getSectionReadingTime(sectionId)
  );

  useEffect(() => {
    // Recompute reading time once DOM has fully settled
    const timeout = setTimeout(() => {
      setStats(getSectionReadingTime(sectionId));
    }, 400);

    return () => clearTimeout(timeout);
  }, [sectionId]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 select-none ${className}`}
      title={`Estimated investor reading depth: ~${stats.wordCount} words (${stats.minutes} min at standard briefing pace)`}
    >
      <Clock className="w-3.5 h-3.5 text-cyan-400/90 shrink-0" aria-hidden="true" />
      <span className="text-slate-300 font-medium">{stats.formatted}</span>
      {showWordCount && (
        <>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="text-slate-400 tabular-nums">
            {stats.wordCount.toLocaleString()} words
          </span>
        </>
      )}
    </span>
  );
};
