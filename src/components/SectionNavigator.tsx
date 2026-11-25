import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Settings,
  Cpu,
  Route,
  Target,
  ArrowRightLeft,
  LineChart,
  BarChart3,
  Globe,
  Users,
  Shield,
  FileSignature,
  Presentation,
  ShieldCheck,
  Mail,
  ChevronUp,
} from 'lucide-react';
import { InvestorSentimentWidget } from './InvestorSentimentWidget';

interface SectionNode {
  id: string;
  name: string;
  icon: React.ElementType;
}

const NAV_SECTIONS: SectionNode[] = [
  { id: 'hero', name: 'Executive Briefing', icon: FileText },
  { id: 'dual-engines', name: 'Dual Engines', icon: Settings },
  { id: 'fusion-stack', name: 'Architecture', icon: Cpu },
  { id: 'rd-roadmap', name: 'R&D Roadmap', icon: Route },
  { id: 'milestones', name: 'Milestones', icon: Target },
  { id: 'value-exchange', name: 'Value Exchange', icon: ArrowRightLeft },
  { id: 'market-shift', name: 'Market Shift', icon: LineChart },
  { id: 'case-studies', name: 'Case Studies', icon: BarChart3 },
  { id: 'unit-economics', name: 'Unit Economics', icon: LineChart },
  { id: 'dual-shore-globe', name: 'Global Ops', icon: Globe },
  { id: 'executive-team', name: 'Leadership', icon: Users },
  { id: 'passive-ip', name: 'Passive IP', icon: Shield },
  { id: 'moat-benchmarks', name: 'Moats', icon: BarChart3 },
  { id: 'investment-terms', name: 'Seed SAFE Terms', icon: FileSignature },
];

export interface SectionNavigatorProps {
  onOpenPitchDeck?: () => void;
  onOpenDataRoom?: () => void;
  onOpenContact?: () => void;
  onOpenOnboarding?: () => void;
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
  onOpenPitchDeck,
  onOpenDataRoom,
  onOpenContact,
  onOpenOnboarding,
}) => {
  const [activeId, setActiveId] = useState<string>('hero');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }

      let current = 'hero';
      for (const section of NAV_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3 && rect.bottom >= window.innerHeight / 3) {
            current = section.id;
          }
        }
      }
      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]', 'transition-all', 'duration-1000');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]');
      }, 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside
      id="section-navigator-rail"
      className="floating-sidebar section-navigator-rail fixed right-3 xl:right-5 top-1/2 -translate-y-1/2 z-[75] hidden lg:flex flex-col items-center pointer-events-auto"
      aria-label="Section Navigator & Quick Utilities"
    >
      <div className="relative bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl py-2.5 px-1.5 shadow-2xl flex flex-col items-center gap-1.5 max-h-[calc(100vh-10rem)]">
        {/* Compact Scroll Readout */}
        <div
          className="text-[9px] font-mono tabular-nums font-bold text-cyan-400 select-none pb-0.5 shrink-0"
          title="Briefing Scroll Progress"
        >
          {Math.round(scrollProgress)}%
        </div>

        {/* Section Progress Track */}
        <div className="relative flex flex-col items-center gap-1">
          {/* Vertical Progress Spine Background */}
          <div className="absolute top-2 bottom-2 w-0.5 bg-slate-800 left-1/2 -translate-x-1/2 -z-10" />

          {/* Active Progress Fill Spine */}
          <div
            className="absolute top-2 w-0.5 bg-gradient-to-b from-cyan-400 via-sky-500 to-teal-400 left-1/2 -translate-x-1/2 -z-10 transition-all duration-150"
            style={{ height: `calc(${scrollProgress}% * 0.92)` }}
          />

          {NAV_SECTIONS.map((section) => {
            const isActive = activeId === section.id;
            const isTooltipVisible = hoveredId === section.id || focusedId === section.id;
            const Icon = section.icon;

            return (
              <div
                key={section.id}
                className="relative flex items-center justify-center"
              >
                <button
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  onMouseEnter={() => setHoveredId(section.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setFocusedId(section.id)}
                  onBlur={() => setFocusedId(null)}
                  aria-label={`Jump to ${section.name}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isActive
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.65)] scale-110 z-20'
                      : 'bg-slate-900 border-slate-700/90 text-slate-400 hover:border-slate-500 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${isActive ? 'text-cyan-300' : ''}`} />
                </button>

                {/* Hover & Focus-Only Tooltip Label (Never permanently pinned over content) */}
                <AnimatePresence>
                  {isTooltipVisible && (
                    <motion.div
                      initial={{ opacity: 0, x: 8, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 8, scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      className={`absolute right-full mr-3 px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap shadow-xl pointer-events-none z-50 ${
                        isActive
                          ? 'bg-slate-900 text-cyan-300 border border-cyan-500/50 font-bold'
                          : 'bg-slate-900/95 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {section.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Hairline Separator between Section Nodes & Unified Quick Utilities */}
        <div className="w-5 h-px bg-slate-800 my-0.5 shrink-0" />

        {/* Unified Utility Triggers (Consolidated from SidebarDock) */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <InvestorSentimentWidget />

          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-900 hover:text-amber-200 transition-all group relative border border-transparent hover:border-amber-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Personalize Briefing Track"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 border border-amber-500/40 text-amber-200 text-[11px] font-mono rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-xl z-50">
                Briefing Track
              </span>
            </button>
          )}

          {onOpenPitchDeck && (
            <button
              type="button"
              onClick={onOpenPitchDeck}
              className="p-1.5 rounded-lg text-indigo-400 hover:bg-slate-900 hover:text-indigo-200 transition-all group relative border border-transparent hover:border-indigo-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              aria-label="Open 12-Slide Pitch Deck"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 border border-indigo-500/40 text-indigo-200 text-[11px] font-mono rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-xl z-50">
                12-Slide Deck
              </span>
            </button>
          )}

          {onOpenDataRoom && (
            <button
              type="button"
              onClick={onOpenDataRoom}
              className="p-1.5 rounded-lg text-emerald-400 hover:bg-slate-900 hover:text-emerald-200 transition-all group relative border border-transparent hover:border-emerald-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Open Data Room"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 border border-emerald-500/40 text-emerald-200 text-[11px] font-mono rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-xl z-50">
                Data Room Dossier
              </span>
            </button>
          )}

          {onOpenContact && (
            <button
              type="button"
              onClick={onOpenContact}
              className="p-1.5 rounded-lg text-cyan-400 hover:bg-slate-900 hover:text-cyan-200 transition-all group relative border border-transparent hover:border-cyan-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Inquire & Contact Leadership"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 border border-cyan-500/40 text-cyan-200 text-[11px] font-mono rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-xl z-50">
                Inquire / Contact
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={scrollToTop}
            className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-900 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Scroll To Top"
            title="Scroll To Top"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
