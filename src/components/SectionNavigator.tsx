import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Settings, Cpu, Route, Target, ArrowRightLeft, LineChart, BarChart3, Globe, Users, Shield, FileSignature } from 'lucide-react';

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

export const SectionNavigator: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('hero');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  return (
    <aside 
      className="fixed right-6 top-1/2 -translate-y-1/2 z-[80] hidden lg:flex flex-col items-center pointer-events-auto"
      aria-label="Section Navigator"
    >
      <div className="relative bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 rounded-full py-4 px-2 shadow-2xl flex flex-col items-center gap-3">
        {/* Vertical Progress Spine Background */}
        <div className="absolute top-4 bottom-4 w-0.5 bg-slate-800 left-1/2 -translate-x-1/2 -z-10" />
        
        {/* Active Progress Fill Spine */}
        <div 
          className="absolute top-4 w-0.5 bg-gradient-to-b from-cyan-400 via-sky-500 to-teal-400 left-1/2 -translate-x-1/2 -z-10 transition-all duration-150"
          style={{ height: `calc(${scrollProgress}% - 2rem)` }}
        />

        {NAV_SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          const isHovered = hoveredId === section.id;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className="relative group flex items-center justify-center cursor-pointer"
              onClick={() => scrollToSection(section.id)}
              onMouseEnter={() => setHoveredId(section.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Node Button */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 border ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_12px_#22d3ee] scale-125 z-20'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : ''}`} />
              </div>

              {/* Hover Tooltip Label */}
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-full mr-3 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap shadow-xl pointer-events-none z-50 ${
                      isActive 
                        ? 'bg-slate-900 text-cyan-400 border border-cyan-500/40 font-bold' 
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700'
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
    </aside>
  );
};
