import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ListTree,
  X,
  ArrowUpRight,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export interface TocSectionItem {
  num: string;
  id: string;
  title: string;
  category: string;
}

export const BRIEFING_SECTIONS: TocSectionItem[] = [
  { num: '01', id: 'hero', title: 'Executive Overview & Briefing', category: 'Vision & KPIs' },
  { num: '02', id: 'dual-engines', title: 'Dual-Engine Commercial Portfolios', category: 'Spatial XR + Physical AI' },
  { num: '03', id: 'fusion-stack', title: '6-Layer Neural Fusion Stack', category: 'Architecture & APIs' },
  { num: '04', id: 'rd-roadmap', title: 'Technology & R&D Gantt Roadmap', category: '2024–2027 Timeline' },
  { num: '05', id: 'milestones', title: 'Strategic Milestones & Sprints', category: '18-Mo Execution' },
  { num: '06', id: 'value-exchange', title: 'Ecosystem Value Exchange Model', category: 'D3 Network Flows' },
  { num: '07', id: 'market-shift', title: 'Macro Catalyst & Hardware Influx', category: '$667B TAM Trajectory' },
  { num: '08', id: 'case-studies', title: 'Verified Case Studies & ROI Calc', category: 'Enterprise Proof' },
  { num: '09', id: 'unit-economics', title: '9-Tier Unit Economics & Waterfall', category: 'Financials & AI Thesis' },
  { num: '10', id: 'dual-shore-globe', title: 'Dual-Shore Global Operations', category: 'San Jose ↔ Dhaka' },
  { num: '11', id: 'executive-team', title: 'Executive Leadership & Team', category: 'Founding Track Record' },
  { num: '12', id: 'passive-ip', title: 'Passive IP & Creator Commerce', category: 'High-Margin Streams' },
  { num: '13', id: 'moat-benchmarks', title: 'Competitive Moat & Benchmarks', category: '4-Way Matrix' },
  { num: '14', id: 'investment-terms', title: 'Seed SAFE Terms & Capital Plan', category: '$500k @ $4.5M Cap' },
];

export const GlobalTableOfContents: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');
  const containerRef = useRef<HTMLDivElement>(null);

  // Track currently visible section while scrolling
  useEffect(() => {
    const updateActiveSection = () => {
      const midViewport = window.innerHeight * 0.42;
      let currentId = 'hero';

      for (const section of BRIEFING_SECTIONS) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= midViewport && rect.bottom >= midViewport) {
          currentId = section.id;
          break;
        }
      }

      setActiveSectionId(currentId);
    };

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    updateActiveSection();
    return () => window.removeEventListener('scroll', updateActiveSection);
  }, []);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNavigate = (sectionId: string) => {
    setIsOpen(false);
    setActiveSectionId(sectionId);

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add(
        'ring-2',
        'ring-cyan-400',
        'ring-offset-4',
        'ring-offset-[#05070B]',
        'transition-all',
        'duration-1000'
      );
      setTimeout(() => {
        el.classList.remove(
          'ring-2',
          'ring-cyan-400',
          'ring-offset-4',
          'ring-offset-[#05070B]'
        );
      }, 3000);
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Top-Right Navbar Trigger Button */}
      <button
        id="nav-toc-btn"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Global Table of Contents"
        title="Global Table of Contents — Quick Jump to All 14 Sections"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-all border cursor-pointer ${
          isOpen
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.28)]'
            : 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border-slate-700 hover:border-cyan-500/50'
        }`}
      >
        {isOpen ? (
          <X className="w-3.5 h-3.5 text-cyan-400" />
        ) : (
          <ListTree className="w-3.5 h-3.5 text-cyan-400" />
        )}
        <span className="hidden md:inline text-[11px] font-semibold">Contents</span>
        <span className="hidden xl:inline-flex items-center justify-center px-1.5 py-0.2 rounded bg-slate-950/80 border border-slate-700/80 text-[9px] text-cyan-400 font-bold">
          14
        </span>
      </button>

      {/* Global Table of Contents Flyout Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            aria-label="Briefing Table of Contents"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2.5 w-[320px] sm:w-[370px] bg-[#070A10]/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-[90] hud-corner"
          >
            {/* Flyout Header */}
            <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white tracking-wide">
                    GLOBAL TABLE OF CONTENTS
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    14 Master Briefing Sections • Click to Navigate
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                aria-label="Close Table of Contents"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable List of All Major Section Titles */}
            <div className="max-h-[70vh] overflow-y-auto p-2 space-y-1">
              {BRIEFING_SECTIONS.map((section) => {
                const isActive = activeSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleNavigate(section.id)}
                    className={`w-full px-3 py-2 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                      isActive
                        ? 'bg-cyan-950/50 border-cyan-500/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950/40 border-transparent hover:bg-slate-900/90 hover:border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 transition-colors ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-900 text-cyan-400 border-slate-800 group-hover:border-cyan-500/40'
                        }`}
                      >
                        {section.num}
                      </span>

                      <div className="min-w-0">
                        <div
                          className={`text-xs font-heading font-semibold truncate transition-colors ${
                            isActive ? 'text-cyan-300' : 'text-slate-100 group-hover:text-white'
                          }`}
                        >
                          {section.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400 truncate">
                          {section.category}
                        </div>
                      </div>
                    </div>

                    {isActive ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Flyout Footer */}
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>KEYS 1–9 • CMD+K SEARCH</span>
              <span className="text-cyan-400">SPENTA SSOT v2.6</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
