import React from 'react';
import { useSectionSummaryTooltip } from '../hooks/useSectionSummaryTooltip';
import { SectionSummaryTooltip } from './SectionSummaryTooltip';

interface SectionDividerProps {
  accent?: 'cyan' | 'emerald' | 'indigo' | 'purple';
  label?: string;
  sectionId?: string;
}

const ACCENT_STYLES: Record<
  NonNullable<SectionDividerProps['accent']>,
  {
    line: string;
    beam: string;
    ring: string;
    core: string;
    glow: string;
    tick: string;
    label: string;
  }
> = {
  cyan: {
    line: 'from-transparent via-cyan-500/35 to-transparent',
    beam: 'from-transparent via-cyan-300/80 to-transparent',
    ring: 'border-cyan-400/50 bg-cyan-500/10',
    core: 'bg-cyan-300',
    glow: 'shadow-[0_0_14px_3px_rgba(34,211,238,0.65)]',
    tick: 'bg-cyan-400/45',
    label: 'text-cyan-400/70',
  },
  emerald: {
    line: 'from-transparent via-emerald-500/35 to-transparent',
    beam: 'from-transparent via-emerald-300/80 to-transparent',
    ring: 'border-emerald-400/50 bg-emerald-500/10',
    core: 'bg-emerald-300',
    glow: 'shadow-[0_0_14px_3px_rgba(52,211,153,0.65)]',
    tick: 'bg-emerald-400/45',
    label: 'text-emerald-400/70',
  },
  indigo: {
    line: 'from-transparent via-indigo-500/35 to-transparent',
    beam: 'from-transparent via-indigo-300/80 to-transparent',
    ring: 'border-indigo-400/50 bg-indigo-500/10',
    core: 'bg-indigo-300',
    glow: 'shadow-[0_0_14px_3px_rgba(129,140,248,0.65)]',
    tick: 'bg-indigo-400/45',
    label: 'text-indigo-400/70',
  },
  purple: {
    line: 'from-transparent via-purple-500/35 to-transparent',
    beam: 'from-transparent via-purple-300/80 to-transparent',
    ring: 'border-purple-400/50 bg-purple-500/10',
    core: 'bg-purple-300',
    glow: 'shadow-[0_0_14px_3px_rgba(192,132,252,0.65)]',
    tick: 'bg-purple-400/45',
    label: 'text-purple-400/70',
  },
};

export const SectionDivider: React.FC<SectionDividerProps> = ({
  accent = 'cyan',
  label,
  sectionId,
}) => {
  const styles = ACCENT_STYLES[accent];
  const { tooltipState, showTooltip, hideTooltip } = useSectionSummaryTooltip();

  // If sectionId is not explicitly provided, try to extract from label e.g. "01 // Dual-Engine Model"
  const targetSectionId =
    sectionId ||
    (label
      ? label.toLowerCase().includes('dual-engine')
        ? 'dual-engines'
        : label.toLowerCase().includes('fusion stack') || label.toLowerCase().includes('6-layer')
        ? 'fusion-stack'
        : label.toLowerCase().includes('r&d') || label.toLowerCase().includes('roadmap')
        ? 'rd-roadmap'
        : label.toLowerCase().includes('milestones') || label.toLowerCase().includes('sprints')
        ? 'milestones'
        : label.toLowerCase().includes('value exchange')
        ? 'value-exchange'
        : label.toLowerCase().includes('macro') || label.toLowerCase().includes('hardware shift')
        ? 'market-shift'
        : label.toLowerCase().includes('case studies') || label.toLowerCase().includes('deployments')
        ? 'case-studies'
        : label.toLowerCase().includes('unit economics')
        ? 'unit-economics'
        : label.toLowerCase().includes('dual-shore') || label.toLowerCase().includes('globe')
        ? 'dual-shore-globe'
        : label.toLowerCase().includes('leadership') || label.toLowerCase().includes('team')
        ? 'executive-team'
        : label.toLowerCase().includes('passive ip')
        ? 'passive-ip'
        : label.toLowerCase().includes('moat') || label.toLowerCase().includes('benchmarks')
        ? 'moat-benchmarks'
        : label.toLowerCase().includes('safe') || label.toLowerCase().includes('terms')
        ? 'investment-terms'
        : undefined
      : undefined);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (targetSectionId) {
      showTooltip(targetSectionId, e);
    }
  };

  return (
    <>
      <div
        className="section-divider relative w-full py-2 sm:py-3 px-4 sm:px-8 overflow-hidden select-none"
        role="separator"
        aria-hidden="true"
      >
        <div className="max-w-7xl mx-auto relative flex items-center justify-center h-8">
          {/* Base subtle horizontal gradient line */}
          <div
            className={`w-full h-px bg-gradient-to-r ${styles.line} relative overflow-hidden`}
          >
            {/* Animated horizontal energy sweep */}
            <div
              className={`absolute inset-y-0 w-1/3 bg-gradient-to-r ${styles.beam} animate-divider-sweep pointer-events-none`}
            />
          </div>

          {/* Center Glowing Node Assembly */}
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={hideTooltip}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 ${
              targetSectionId ? 'cursor-help pointer-events-auto p-2' : 'pointer-events-none'
            }`}
            title={targetSectionId ? 'Hover to preview section summary' : undefined}
          >
            {/* Left micro-tick */}
            <span className={`w-4 h-px ${styles.tick} hidden sm:block`} />
            <span className={`w-1 h-1 rounded-full ${styles.tick}`} />

            {/* Glowing center core */}
            <div className="relative flex items-center justify-center w-6 h-6 transition-transform hover:scale-125">
              {/* Ambient pulsing ring */}
              <span
                className={`absolute inset-0 rounded-full border ${styles.ring} animate-divider-pulse`}
              />
              {/* Rotated inner diamond housing */}
              <span
                className={`relative w-2.5 h-2.5 rotate-45 rounded-[2px] ${styles.core} ${styles.glow}`}
              />
            </div>

            {/* Right micro-tick */}
            <span className={`w-1 h-1 rounded-full ${styles.tick}`} />
            <span className={`w-4 h-px ${styles.tick} hidden sm:block`} />
          </div>

          {/* Optional subtle section telemetry label */}
          {label && (
            <span
              onMouseEnter={handleMouseEnter}
              onMouseLeave={hideTooltip}
              className={`hidden md:inline-block absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono uppercase tracking-[0.2em] bg-[#05070B] pl-3 ${
                styles.label
              } ${targetSectionId ? 'cursor-help pointer-events-auto hover:text-white transition-colors' : 'pointer-events-none'}`}
            >
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Floating One-Sentence Section Summary Tooltip */}
      <SectionSummaryTooltip tooltipState={tooltipState} />
    </>
  );
};
