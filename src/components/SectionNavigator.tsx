import React, { useState, useEffect, useRef } from 'react';
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
  Printer,
  Share2,
  MessageSquarePlus,
} from 'lucide-react';
import { InvestorSentimentWidget } from './InvestorSentimentWidget';
import { triggerBriefingPrint } from '../utils/printBriefing';
import { ShareBriefingModal } from './ShareBriefingModal';
import { Currency } from '../types';
import { InvestorPersona } from './OnboardingWizardModal';
import { FinancialScenario } from './UnitEconomicsSection';
import { GlobalViewMode } from '../App';
import { SECTION_SUMMARIES } from '../data/sectionSummaries';

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
  currency?: Currency;
  persona?: InvestorPersona | null;
  scenario?: FinancialScenario;
  globalViewMode?: GlobalViewMode;
  onOpenPitchDeck?: () => void;
  onOpenDataRoom?: () => void;
  onOpenContact?: () => void;
  onOpenOnboarding?: () => void;
  onOpenIntelligenceDashboard?: () => void;
  onOpenFeedback?: () => void;
}

interface FloatingTooltipState {
  label: string;
  detail?: string;
  topPx: number;
  accent?: 'cyan' | 'amber' | 'indigo' | 'emerald' | 'purple';
  isActiveSection?: boolean;
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
  currency = 'USD',
  persona = null,
  scenario = 'base',
  globalViewMode = 'investor',
  onOpenPitchDeck,
  onOpenDataRoom,
  onOpenContact,
  onOpenOnboarding,
  onOpenIntelligenceDashboard,
  onOpenFeedback,
}) => {
  const [activeId, setActiveId] = useState<string>('hero');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [tooltip, setTooltip] = useState<FloatingTooltipState | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const asideRef = useRef<HTMLElement>(null);

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

  const showFloatingTooltip = (
    e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
    label: string,
    options?: {
      detail?: string;
      accent?: FloatingTooltipState['accent'];
      isActiveSection?: boolean;
    }
  ) => {
    if (!asideRef.current) return;
    const asideRect = asideRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const topPx = targetRect.top - asideRect.top + targetRect.height / 2;
    setTooltip({
      label,
      detail: options?.detail,
      topPx,
      accent: options?.accent || 'cyan',
      isActiveSection: options?.isActiveSection,
    });
  };

  const hideFloatingTooltip = () => setTooltip(null);

  const tooltipBorderClass =
    tooltip?.accent === 'amber'
      ? 'border-amber-500/50 text-amber-200'
      : tooltip?.accent === 'indigo'
      ? 'border-indigo-500/50 text-indigo-200'
      : tooltip?.accent === 'emerald'
      ? 'border-emerald-500/50 text-emerald-200'
      : tooltip?.accent === 'purple'
      ? 'border-purple-500/50 text-purple-200'
      : tooltip?.isActiveSection
      ? 'border-cyan-500/60 text-cyan-300'
      : 'border-slate-700 text-slate-200';

  return (
    <>
      <aside
        ref={asideRef}
        id="section-navigator-rail"
        className="floating-sidebar section-navigator-rail fixed right-2.5 xl:right-4 2xl:right-5 top-1/2 -translate-y-1/2 z-[75] hidden lg:flex flex-col items-center pointer-events-auto w-11 xl:w-12 2xl:w-[52px]"
        aria-label="Unified Section Navigator & Quick Tools Rail"
      >
        {/* Inner Scroll-Safe Fixed-Width Rail with Adaptive Spacing */}
        <div className="w-full bg-slate-950/92 backdrop-blur-xl border border-slate-800/90 rounded-2xl py-2 xl:py-2.5 2xl:py-3 px-1 shadow-2xl flex flex-col items-center gap-1 2xl:gap-1.5 max-h-[calc(100vh-8.5rem)] 2xl:max-h-[calc(100vh-7.5rem)] overflow-y-auto overflow-x-hidden">
          {/* Tabular Scroll Progress Readout */}
          <div
            className="text-[9px] font-mono tabular-nums font-bold text-cyan-400 select-none pb-0.5 shrink-0"
            title="Briefing Scroll Progress"
          >
            {Math.round(scrollProgress)}%
          </div>

          {/* 1. Section Progress Nodes */}
          <div className="relative flex flex-col items-center gap-0.5 xl:gap-1 2xl:gap-1.5 shrink-0">
            {/* Vertical Progress Spine Background */}
            <div className="absolute top-2 bottom-2 w-0.5 bg-slate-800 left-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Active Progress Fill Spine */}
            <div
              className="absolute top-2 w-0.5 bg-gradient-to-b from-cyan-400 via-sky-500 to-teal-400 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150"
              style={{ height: `calc(${scrollProgress}% * 0.92)` }}
            />

            {NAV_SECTIONS.map((section) => {
              const isActive = activeId === section.id;
              const Icon = section.icon;
              const summaryText = SECTION_SUMMARIES[section.id]?.summary;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  onMouseEnter={(e) =>
                    showFloatingTooltip(e, section.name, {
                      detail: summaryText,
                      isActiveSection: isActive,
                    })
                  }
                  onMouseLeave={hideFloatingTooltip}
                  onFocus={(e) =>
                    showFloatingTooltip(e, section.name, {
                      detail: summaryText,
                      isActiveSection: isActive,
                    })
                  }
                  onBlur={hideFloatingTooltip}
                  aria-label={`Jump to ${section.name}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`relative z-10 w-5 h-5 xl:w-6 xl:h-6 2xl:w-6.5 2xl:h-6.5 rounded-full flex items-center justify-center transition-all duration-150 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.65)] scale-110'
                      : 'bg-slate-900 border-slate-700/90 text-slate-400 hover:border-slate-500 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-2.5 h-2.5 xl:w-3 xl:h-3 ${isActive ? 'text-cyan-300' : ''}`} />
                </button>
              );
            })}
          </div>

          <div className="w-6 h-px bg-slate-800 my-0.5 shrink-0" />

          {/* 2. Core Utility Buttons (Unified from SidebarDock) */}
          <div className="flex flex-col items-center gap-0.5 xl:gap-1 2xl:gap-1.5 shrink-0">
            <InvestorSentimentWidget />

            {onOpenOnboarding && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                onMouseEnter={(e) => showFloatingTooltip(e, 'Briefing Track', { accent: 'amber' })}
                onMouseLeave={hideFloatingTooltip}
                onFocus={(e) => showFloatingTooltip(e, 'Briefing Track', { accent: 'amber' })}
                onBlur={hideFloatingTooltip}
                className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-900 hover:text-amber-200 transition-all border border-transparent hover:border-amber-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
                aria-label="Personalize Briefing Track"
              >
                <Target className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenPitchDeck && (
              <button
                type="button"
                onClick={onOpenPitchDeck}
                onMouseEnter={(e) => showFloatingTooltip(e, '12-Slide Pitch Deck', { accent: 'indigo' })}
                onMouseLeave={hideFloatingTooltip}
                onFocus={(e) => showFloatingTooltip(e, '12-Slide Pitch Deck', { accent: 'indigo' })}
                onBlur={hideFloatingTooltip}
                className="p-1.5 rounded-lg text-indigo-400 hover:bg-slate-900 hover:text-indigo-200 transition-all border border-transparent hover:border-indigo-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shrink-0"
                aria-label="Open 12-Slide Pitch Deck"
              >
                <Presentation className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenDataRoom && (
              <button
                type="button"
                onClick={onOpenDataRoom}
                onMouseEnter={(e) => showFloatingTooltip(e, 'Data Room Dossier', { accent: 'emerald' })}
                onMouseLeave={hideFloatingTooltip}
                onFocus={(e) => showFloatingTooltip(e, 'Data Room Dossier', { accent: 'emerald' })}
                onBlur={hideFloatingTooltip}
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-slate-900 hover:text-emerald-200 transition-all border border-transparent hover:border-emerald-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
                aria-label="Open Data Room"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                onMouseEnter={(e) => showFloatingTooltip(e, 'Inquire & Contact', { accent: 'cyan' })}
                onMouseLeave={hideFloatingTooltip}
                onFocus={(e) => showFloatingTooltip(e, 'Inquire & Contact', { accent: 'cyan' })}
                onBlur={hideFloatingTooltip}
                className="p-1.5 rounded-lg text-cyan-400 hover:bg-slate-900 hover:text-cyan-200 transition-all border border-transparent hover:border-cyan-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0"
                aria-label="Inquire & Contact Leadership"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-6 h-px bg-slate-800 my-0.5 shrink-0" />

          {/* 3. Quick-Action Tools (D3 Intel, Print, Share, Feedback, Top) */}
          <div className="flex flex-col items-center gap-0.5 xl:gap-1 2xl:gap-1.5 shrink-0">
            {onOpenIntelligenceDashboard && (
              <button
                type="button"
                onClick={onOpenIntelligenceDashboard}
                onMouseEnter={(e) => showFloatingTooltip(e, 'D3 Intel Projections', { accent: 'indigo' })}
                onMouseLeave={hideFloatingTooltip}
                onFocus={(e) => showFloatingTooltip(e, 'D3 Intel Projections', { accent: 'indigo' })}
                onBlur={hideFloatingTooltip}
                className="p-1.5 rounded-lg text-indigo-300 hover:bg-slate-900 hover:text-indigo-200 transition-all border border-transparent hover:border-indigo-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shrink-0"
                aria-label="Open D3 Intel Projections"
              >
                <LineChart className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={triggerBriefingPrint}
              onMouseEnter={(e) => showFloatingTooltip(e, 'Print Briefing', { accent: 'cyan' })}
              onMouseLeave={hideFloatingTooltip}
              onFocus={(e) => showFloatingTooltip(e, 'Print Briefing', { accent: 'cyan' })}
              onBlur={hideFloatingTooltip}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-300 transition-all border border-transparent hover:border-cyan-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0"
              aria-label="Print Institutional Briefing"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              onMouseEnter={(e) => showFloatingTooltip(e, 'Share Briefing Link', { accent: 'purple' })}
              onMouseLeave={hideFloatingTooltip}
              onFocus={(e) => showFloatingTooltip(e, 'Share Briefing Link', { accent: 'purple' })}
              onBlur={hideFloatingTooltip}
              className="p-1.5 rounded-lg text-purple-300 hover:bg-slate-900 hover:text-purple-200 transition-all border border-transparent hover:border-purple-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 shrink-0"
              aria-label="Share Briefing Session"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {onOpenFeedback && (
              <button
                type="button"
                onClick={onOpenFeedback}
                onMouseEnter={(e) => showFloatingTooltip(e, 'Leave Feedback', { accent: 'emerald' })}
                onMouseLeave={hideFloatingTooltip}
                onFocus={(e) => showFloatingTooltip(e, 'Leave Feedback', { accent: 'emerald' })}
                onBlur={hideFloatingTooltip}
                className="p-1.5 rounded-lg text-emerald-300 hover:bg-slate-900 hover:text-emerald-200 transition-all border border-transparent hover:border-emerald-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
                aria-label="Leave Executive Feedback"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={scrollToTop}
              onMouseEnter={(e) => showFloatingTooltip(e, 'Back to Top', { accent: 'cyan' })}
              onMouseLeave={hideFloatingTooltip}
              onFocus={(e) => showFloatingTooltip(e, 'Back to Top', { accent: 'cyan' })}
              onBlur={hideFloatingTooltip}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-all mt-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0"
              aria-label="Scroll To Top"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Non-Clipped Hover/Focus-Only Tooltip Rendered Outside Scroll Container */}
        {tooltip && (
          <div
            style={{ top: `${tooltip.topPx}px` }}
            className={`absolute right-full mr-3 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-slate-950/95 backdrop-blur-xl border shadow-2xl pointer-events-none z-50 max-w-xs ${tooltipBorderClass}`}
          >
            <div className="text-[11px] font-mono font-bold whitespace-nowrap">
              {tooltip.label}
            </div>
            {tooltip.detail && (
              <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5 line-clamp-2 whitespace-normal">
                {tooltip.detail}
              </p>
            )}
          </div>
        )}
      </aside>

      <ShareBriefingModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currency={currency}
        persona={persona}
        scenario={scenario}
        globalViewMode={globalViewMode}
        currentSectionId={activeId}
      />
    </>
  );
};
