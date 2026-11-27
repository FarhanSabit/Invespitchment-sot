import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  Link2,
  Check,
  HardDrive,
} from 'lucide-react';
import { InvestorSentimentWidget } from './InvestorSentimentWidget';
import { triggerBriefingPrint } from '../utils/printBriefing';
import { ShareBriefingModal } from './ShareBriefingModal';
import { Currency } from '../types';
import { InvestorPersona } from './OnboardingWizardModal';
import { FinancialScenario } from './UnitEconomicsSection';
import { GlobalViewMode } from '../App';
import { SECTION_SUMMARIES } from '../data/sectionSummaries';
import { useStack } from '../context/StackProvider';

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

interface CursorNodeTooltipState {
  title: string;
  detail?: string;
  x: number;
  y: number;
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
  const [cursorTooltip, setCursorTooltip] = useState<CursorNodeTooltipState | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const { openStorageManager } = useStack();

  const asideRef = useRef<HTMLElement>(null);
  const scrollCleanupRef = useRef<(() => void) | null>(null);
  const cursorTooltipTimerRef = useRef<number | null>(null);
  const copyLinkTimerRef = useRef<number | null>(null);

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollCleanupRef.current?.();
      if (cursorTooltipTimerRef.current !== null) {
        window.clearTimeout(cursorTooltipTimerRef.current);
      }
      if (copyLinkTimerRef.current !== null) {
        window.clearTimeout(copyLinkTimerRef.current);
      }
    };
  }, []);

  const triggerHeaderPulse = useCallback((sectionEl: HTMLElement) => {
    const headerEl = sectionEl.querySelector<HTMLElement>('h1, h2') || sectionEl;
    headerEl.classList.remove('animate-section-header-pulse');
    // Force reflow so rapid repeat clicks re-trigger the pulse smoothly
    void headerEl.offsetWidth;
    headerEl.classList.add('animate-section-header-pulse');

    const cleanupTimer = window.setTimeout(() => {
      headerEl.classList.remove('animate-section-header-pulse');
    }, 1250);

    const handleAnimEnd = () => {
      headerEl.classList.remove('animate-section-header-pulse');
      window.clearTimeout(cleanupTimer);
      headerEl.removeEventListener('animationend', handleAnimEnd);
    };
    headerEl.addEventListener('animationend', handleAnimEnd, { once: true });
  }, []);

  const scrollToSection = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (!el) return;

    scrollCleanupRef.current?.();

    const startY = window.scrollY;
    let pulsed = false;
    let idleTimer: number | null = null;
    let maxWaitTimer: number | null = null;

    const completeScrollPulse = () => {
      if (pulsed) return;
      pulsed = true;
      cleanupListeners();
      triggerHeaderPulse(el);
    };

    const handleScrollTick = () => {
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(completeScrollPulse, 140);
    };

    const handleScrollEnd = () => {
      completeScrollPulse();
    };

    const cleanupListeners = () => {
      window.removeEventListener('scroll', handleScrollTick);
      window.removeEventListener('scrollend', handleScrollEnd);
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      if (maxWaitTimer !== null) window.clearTimeout(maxWaitTimer);
    };

    scrollCleanupRef.current = cleanupListeners;
    window.addEventListener('scroll', handleScrollTick, { passive: true });
    window.addEventListener('scrollend', handleScrollEnd, { once: true });

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Handle the case where the target section is already aligned and no scroll event fires
    const targetTop = el.getBoundingClientRect().top;
    const isAlreadyInView = Math.abs(targetTop) < 72 || Math.abs(window.scrollY - startY) < 2;
    maxWaitTimer = window.setTimeout(completeScrollPulse, isAlreadyInView ? 180 : 900);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyDirectLink = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://spenta.ai';
    const pathname =
      typeof window !== 'undefined' && window.location.pathname
        ? window.location.pathname
        : '/';

    const params = new URLSearchParams();
    params.set('section', activeId);
    if (persona) {
      params.set('persona', persona);
    }
    params.set('scenario', scenario);
    params.set('currency', currency);
    params.set('view', globalViewMode);

    const viewUrl = `${origin}${pathname}?${params.toString()}#${activeId}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(viewUrl);
      }
    } catch {
      // Fallback temporary input copy if clipboard permission is restricted
      const input = document.createElement('input');
      input.value = viewUrl;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(input);
      }
    }

    setCopiedDirectLink(true);
    showFloatingTooltip(e, 'Link Copied!', {
      detail: `#${activeId} · ${persona ? persona.toUpperCase() : 'General'} · ${scenario.toUpperCase()}`,
      accent: 'emerald',
    });

    if (copyLinkTimerRef.current !== null) {
      window.clearTimeout(copyLinkTimerRef.current);
    }
    copyLinkTimerRef.current = window.setTimeout(() => {
      setCopiedDirectLink(false);
      copyLinkTimerRef.current = null;
    }, 2400);
  };

  // Helper function that displays a temporary floating tooltip near the cursor for section progress nodes
  const showCursorNodeTooltip = (
    e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
    sectionTitle: string,
    options?: {
      detail?: string;
      isActiveSection?: boolean;
    }
  ) => {
    if (cursorTooltipTimerRef.current !== null) {
      window.clearTimeout(cursorTooltipTimerRef.current);
    }

    let x: number;
    let y: number;

    if ('clientX' in e && (e.clientX !== 0 || e.clientY !== 0)) {
      x = e.clientX;
      y = e.clientY;
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      x = rect.left;
      y = rect.top + rect.height / 2;
    }

    const clampedY = Math.min(Math.max(y, 40), window.innerHeight - 40);
    const clampedX = Math.max(180, Math.min(x - 16, window.innerWidth - 72));

    setCursorTooltip({
      title: sectionTitle,
      detail: options?.detail,
      x: clampedX,
      y: clampedY,
      isActiveSection: options?.isActiveSection,
    });

    cursorTooltipTimerRef.current = window.setTimeout(() => {
      setCursorTooltip(null);
      cursorTooltipTimerRef.current = null;
    }, 2600);
  };

  const hideCursorNodeTooltip = () => {
    if (cursorTooltipTimerRef.current !== null) {
      window.clearTimeout(cursorTooltipTimerRef.current);
      cursorTooltipTimerRef.current = null;
    }
    setCursorTooltip(null);
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
    const rawTopPx = targetRect.top - asideRect.top + targetRect.height / 2;
    const topPx = Math.min(Math.max(rawTopPx, 20), Math.max(20, asideRect.height - 20));
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
        className="floating-sidebar section-navigator-rail fixed right-[max(0.5rem,env(safe-area-inset-right))] lg:right-3 xl:right-4 2xl:right-5 top-[max(4.75rem,calc(env(safe-area-inset-top)+4.5rem))] bottom-[max(8.25rem,calc(env(safe-area-inset-bottom)+8.25rem))] xl:bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] z-[75] hidden md:flex flex-col items-center justify-center pointer-events-none w-10 md:w-11 xl:w-12 2xl:w-[52px]"
        aria-label="Unified Section Navigator & Quick Tools Rail"
      >
        {/* Inner Scroll-Safe Fixed-Width Rail Bounded Strictly Inside Viewport Safe Insets */}
        <div className="pointer-events-auto w-full bg-slate-950/92 backdrop-blur-xl border border-slate-800/90 rounded-2xl py-2 xl:py-2.5 2xl:py-3 px-1 shadow-2xl flex flex-col items-center gap-1 xl:gap-1.5 max-h-full overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* Tabular Scroll Progress Readout */}
          <div
            className="w-full text-center text-[9px] font-mono tabular-nums font-bold leading-none text-cyan-400 select-none pb-0.5 shrink-0"
            title="Briefing Scroll Progress"
          >
            {Math.round(scrollProgress)}%
          </div>

          {/* 1. Section Progress Nodes (Uniform Dimensions & Spacing Across Active Transitions) */}
          <div className="relative flex flex-col items-center gap-1 xl:gap-1.5 shrink-0">
            {/* Vertical Progress Spine Track & Clamped Active Fill */}
            <div className="absolute top-2.5 bottom-2.5 left-1/2 -translate-x-1/2 w-0.5 bg-slate-800 rounded-full overflow-hidden pointer-events-none">
              <div
                className="w-full bg-gradient-to-b from-cyan-400 via-sky-500 to-teal-400 transition-[height] duration-150"
                style={{ height: `${scrollProgress}%` }}
              />
            </div>

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
                    showCursorNodeTooltip(e, section.name, {
                      detail: summaryText,
                      isActiveSection: isActive,
                    })
                  }
                  onMouseMove={(e) =>
                    showCursorNodeTooltip(e, section.name, {
                      detail: summaryText,
                      isActiveSection: isActive,
                    })
                  }
                  onMouseLeave={hideCursorNodeTooltip}
                  onFocus={(e) =>
                    showCursorNodeTooltip(e, section.name, {
                      detail: summaryText,
                      isActiveSection: isActive,
                    })
                  }
                  onBlur={hideCursorNodeTooltip}
                  aria-label={`Jump to ${section.name}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`relative z-10 w-[22px] h-[22px] xl:w-6 xl:h-6 2xl:w-[26px] 2xl:h-[26px] rounded-full flex items-center justify-center transition-[background-color,border-color,color,box-shadow] duration-150 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.55)]'
                      : 'bg-slate-900 border-slate-700/90 text-slate-400 hover:border-slate-500 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-2.5 h-2.5 xl:w-3 xl:h-3 shrink-0 ${isActive ? 'text-cyan-300' : ''}`} />
                </button>
              );
            })}
          </div>

          <div className="w-6 h-px bg-slate-800 my-0.5 shrink-0" />

          {/* 2. Core Utility Buttons (Unified from SidebarDock) */}
          <div className="flex flex-col items-center gap-1 xl:gap-1.5 shrink-0">
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
              id="rail-copy-link-btn"
              onClick={(e) => void handleCopyDirectLink(e)}
              onMouseEnter={(e) =>
                showFloatingTooltip(
                  e,
                  copiedDirectLink ? 'Link Copied!' : 'Copy Link',
                  {
                    detail: `Copies URL for #${activeId} (${persona ? persona.toUpperCase() : 'General'} · ${scenario.toUpperCase()})`,
                    accent: copiedDirectLink ? 'emerald' : 'cyan',
                  }
                )
              }
              onMouseLeave={hideFloatingTooltip}
              onFocus={(e) =>
                showFloatingTooltip(
                  e,
                  copiedDirectLink ? 'Link Copied!' : 'Copy Link',
                  {
                    detail: `Copies URL for #${activeId} (${persona ? persona.toUpperCase() : 'General'} · ${scenario.toUpperCase()})`,
                    accent: copiedDirectLink ? 'emerald' : 'cyan',
                  }
                )
              }
              onBlur={hideFloatingTooltip}
              className={`p-1.5 rounded-lg transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0 ${
                copiedDirectLink
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'text-cyan-300 hover:bg-slate-900 hover:text-cyan-200 border-transparent hover:border-cyan-500/30'
              }`}
              aria-label="Copy Link to Current Briefing View"
            >
              {copiedDirectLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Link2 className="w-3.5 h-3.5" />
              )}
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

            <button
              type="button"
              id="rail-storage-manager-btn"
              onClick={() => openStorageManager('vault')}
              onMouseEnter={(e) =>
                showFloatingTooltip(e, 'App Vault & Storage', {
                  detail: 'Saved scenarios, snapshots, storage breakdown & JSON export',
                  accent: 'indigo',
                })
              }
              onMouseLeave={hideFloatingTooltip}
              onFocus={(e) =>
                showFloatingTooltip(e, 'App Vault & Storage', {
                  detail: 'Saved scenarios, snapshots, storage breakdown & JSON export',
                  accent: 'indigo',
                })
              }
              onBlur={hideFloatingTooltip}
              className="p-1.5 rounded-lg text-indigo-300 hover:bg-slate-900 hover:text-indigo-200 transition-all border border-transparent hover:border-indigo-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shrink-0"
              aria-label="Open App Vault and Storage Manager"
            >
              <HardDrive className="w-3.5 h-3.5" />
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

      {/* Temporary Cursor-Following Floating Tooltip for Section Progress Nodes */}
      {typeof document !== 'undefined' &&
        cursorTooltip &&
        createPortal(
          <div
            role="tooltip"
            style={{
              top: `${cursorTooltip.y}px`,
              left: `${cursorTooltip.x}px`,
              transform: 'translate(-100%, -50%)',
            }}
            className={`fixed px-3 py-1.5 rounded-lg bg-slate-950/95 backdrop-blur-xl border shadow-2xl pointer-events-none z-[95] max-w-xs transition-opacity duration-150 ${
              cursorTooltip.isActiveSection
                ? 'border-cyan-500/60 text-cyan-300'
                : 'border-slate-700 text-slate-200'
            }`}
          >
            <div className="text-[11px] font-mono font-bold whitespace-nowrap">
              {cursorTooltip.title}
            </div>
            {cursorTooltip.detail && (
              <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5 line-clamp-2 whitespace-normal">
                {cursorTooltip.detail}
              </p>
            )}
          </div>,
          document.body
        )}

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
