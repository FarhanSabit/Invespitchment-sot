import React from 'react';

interface SectionDividerProps {
  accent?: 'cyan' | 'emerald' | 'indigo' | 'purple';
  label?: string;
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
}) => {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className="section-divider relative w-full py-2 sm:py-3 px-4 sm:px-8 overflow-hidden select-none pointer-events-none"
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
            className={`absolute inset-y-0 w-1/3 bg-gradient-to-r ${styles.beam} animate-divider-sweep`}
          />
        </div>

        {/* Center Glowing Node Assembly */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
          {/* Left micro-tick */}
          <span className={`w-4 h-px ${styles.tick} hidden sm:block`} />
          <span className={`w-1 h-1 rounded-full ${styles.tick}`} />

          {/* Glowing center core */}
          <div className="relative flex items-center justify-center w-6 h-6">
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
            className={`hidden md:inline-block absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono uppercase tracking-[0.2em] bg-[#05070B] pl-3 ${styles.label}`}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
