import React, { useState, useEffect } from 'react';
import { Currency, FeedbackComment } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { InvestorNewsTicker } from './components/InvestorNewsTicker';
import { DualEngineSection } from './components/DualEngineSection';
import { FusionStackSection } from './components/FusionStackSection';
import { RdRoadmapSection } from './components/RdRoadmapSection';
import { MarketShiftSection } from './components/MarketShiftSection';
import { CaseStudiesSection } from './components/CaseStudiesSection';
import { UnitEconomicsSection, FinancialScenario } from './components/UnitEconomicsSection';
import { DualShoreGlobeSection } from './components/DualShoreGlobeSection';
import { ExecutiveTeamSection } from './components/ExecutiveTeamSection';
import { PassiveIPSection } from './components/PassiveIPSection';
import { MoatAndBenchmarksSection } from './components/MoatAndBenchmarksSection';
import { InvestmentTermsSection } from './components/InvestmentTermsSection';
import { Footer } from './components/Footer';
import { PitchDeckModal } from './components/PitchDeckModal';
import { DataRoomModal } from './components/DataRoomModal';
import { ContactModal } from './components/ContactModal';
import { InvestorIntelligenceDashboard } from './components/InvestorIntelligenceDashboard';
import { OnboardingWizardModal, InvestorPersona } from './components/OnboardingWizardModal';
import { ActiveTrackIndicator } from './components/ActiveTrackIndicator';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { GlobalLoadingScreen } from './components/GlobalLoadingScreen';
import { BreadcrumbNav } from './components/BreadcrumbNav';
import { OmniSearchModal } from './components/OmniSearchModal';
import { MilestonesSection } from './components/MilestonesSection';
import { ValueExchangeSection } from './components/ValueExchangeSection';
import { ExecutiveFeedbackDrawer } from './components/ExecutiveFeedbackDrawer';
import { SectionMap } from './components/SectionMap';
import { SectionNavigator } from './components/SectionNavigator';
import { AnomalyWatchToast } from './components/AnomalyWatchToast';
import { VoiceNavigator } from './components/VoiceNavigator';
import { MessageSquare, Share2, Sparkles, X } from 'lucide-react';
import { SentimentProvider } from './context/SentimentContext';
import { ArPreviewProvider } from './context/ArPreviewContext';
import { StackProvider } from './context/StackProvider';
import { StorageManager } from './components/StorageManager';
import { ArPreviewModal } from './components/ArPreviewModal';
import { SectionDivider } from './components/SectionDivider';
import { SectionReveal } from './components/SectionReveal';
import { personas } from './components/OnboardingWizardModal';
import { useSectionSummaryTooltip } from './hooks/useSectionSummaryTooltip';
import { SectionSummaryTooltip } from './components/SectionSummaryTooltip';

export type GlobalViewMode = 'investor' | 'partner';

export default function App() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState<boolean>(false);
  const [isDataRoomOpen, setIsDataRoomOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isOmniSearchOpen, setIsOmniSearchOpen] = useState<boolean>(false);
  const [isFeedbackDrawerOpen, setIsFeedbackDrawerOpen] = useState<boolean>(false);
  const [globalViewMode, setGlobalViewMode] = useState<GlobalViewMode>('investor');
  const [activePersona, setActivePersona] = useState<InvestorPersona | null>(null);
  const [activeScenario, setActiveScenario] = useState<FinancialScenario>('base');
  const [contactInterestArea, setContactInterestArea] = useState<string>('Seed Round SAFE Allocation ($500k @ $4.5M Cap)');
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [restoredSessionNotice, setRestoredSessionNotice] = useState<{
    sessionId: string;
    personaTitle?: string;
    scenario?: string;
    currency?: string;
  } | null>(null);

  // Deep linking: Detect ?section=xxx, shared session state (?persona, ?currency, ?scenario, ?sid), or #xxx
  useEffect(() => {
    const handleDeepLink = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sectionQuery = urlParams.get('section');
      const hashQuery = window.location.hash.replace('#', '');
      const targetId = sectionQuery || hashQuery;

      // Parse shared session parameters if present
      const personaParam = urlParams.get('persona') as InvestorPersona | null;
      const currencyParam = urlParams.get('currency') as Currency | null;
      const scenarioParam = urlParams.get('scenario') as FinancialScenario | null;
      const viewParam = urlParams.get('view') as GlobalViewMode | null;
      const sidParam = urlParams.get('sid');

      if (currencyParam === 'USD' || currencyParam === 'BDT') {
        setCurrency(currencyParam);
      }
      if (viewParam === 'investor' || viewParam === 'partner') {
        setGlobalViewMode(viewParam);
      }
      if (scenarioParam) {
        const normalizedScenario =
          (scenarioParam as string) === 'bull'
            ? 'aggressive'
            : (scenarioParam as string) === 'bear'
            ? 'conservative'
            : scenarioParam;
        if (['conservative', 'base', 'aggressive'].includes(normalizedScenario)) {
          setActiveScenario(normalizedScenario as FinancialScenario);
        }
      }
      if (personaParam && ['vc', 'angel', 'strategic', 'sovereign'].includes(personaParam)) {
        setActivePersona(personaParam);
      }
      if (sidParam) {
        const personaTitle = personaParam && personas[personaParam] ? personas[personaParam].title : undefined;
        setRestoredSessionNotice({
          sessionId: sidParam,
          personaTitle,
          scenario: scenarioParam ? `${scenarioParam.toUpperCase()} Scenario` : undefined,
          currency: currencyParam || undefined,
        });
        setTimeout(() => setRestoredSessionNotice(null), 8000);
      }

      if (targetId) {
        // Small delay to allow component rendering and loading screen transition
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Add temporary glowing ring animation
            el.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]', 'transition-all', 'duration-1000');
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]');
            }, 3000);
          }
        }, 600);
      }
    };

    handleDeepLink();
    window.addEventListener('popstate', handleDeepLink);

    const handleOpenOmniSearch = () => setIsOmniSearchOpen(true);
    document.addEventListener('open-omni-search', handleOpenOmniSearch);

    return () => {
      window.removeEventListener('popstate', handleDeepLink);
      document.removeEventListener('open-omni-search', handleOpenOmniSearch);
    };
  }, []);

  const getCommentCount = (sectionName: string) => comments.filter(c => c.section === sectionName).length;

  const SectionMarker = ({ count, onClick, sectionId }: { count: number; onClick: () => void; sectionId?: string }) => {
    const { tooltipState, bindTrigger } = useSectionSummaryTooltip({ delay: 100 });
    if (count === 0) return null;
    return (
      <>
        <div 
          data-print-hide="true"
          className="section-marker absolute top-10 right-10 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer hover:scale-110 hover:bg-slate-800 transition-all no-print"
          onClick={onClick}
          {...bindTrigger(sectionId)}
          title="View Feedback & Section Summary"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-slate-900 shadow-md">
            {count}
          </span>
        </div>
        <SectionSummaryTooltip tooltipState={tooltipState} />
      </>
    );
  };

  // Global Keyboard Shortcuts for Section Navigation
  useEffect(() => {
    const sectionMap: Record<string, string> = {
      '1': 'hero',
      '2': 'dual-engines',
      '3': 'fusion-stack',
      '4': 'rd-roadmap',
      '5': 'case-studies',
      '6': 'unit-economics',
      '7': 'dual-shore-globe',
      '8': 'executive-team',
      '9': 'investment-terms',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const targetId = sectionMap[e.key];
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]', 'transition-all', 'duration-1000');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]');
          }, 3000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenContact = (interestArea?: string) => {
    if (interestArea) {
      setContactInterestArea(interestArea);
    }
    setIsContactOpen(true);
  };

  const handleOpenIntelligence = (scenario?: FinancialScenario) => {
    if (scenario) {
      setActiveScenario(scenario);
    }
    setIsIntelligenceOpen(true);
  };

  const scrollToAndHighlightSection = (sectionId: string) => {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]', 'transition-all');
        setTimeout(() => el.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]'), 3000);
      }
    }, 150);
  };

  return (
    <SentimentProvider>
      <ArPreviewProvider>
        <StackProvider
          workspaceState={{
            currency,
            persona: activePersona,
            scenario: activeScenario,
            globalViewMode,
            activeSectionId: 'hero',
            comments,
          }}
          onApplyScenario={(nextScenario, nextCurrency) => {
            setActiveScenario(nextScenario);
            setCurrency(nextCurrency);
            scrollToAndHighlightSection('unit-economics');
          }}
          onRestoreSnapshot={(snapshot) => {
            setCurrency(snapshot.currency);
            setActivePersona(snapshot.persona);
            setActiveScenario(snapshot.scenario);
            setGlobalViewMode(snapshot.globalViewMode);
            if (snapshot.activeSectionId) {
              scrollToAndHighlightSection(snapshot.activeSectionId);
            }
          }}
        >
        <div className="min-h-screen bg-[#05070B] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
          
          {/* Global Scroll Progress Bar at very top */}
          <ScrollProgressBar />

      {/* Global Loading Screen Sequence on initial load */}
      <GlobalLoadingScreen />

      {/* Sticky Breadcrumb Navigation */}
      <BreadcrumbNav />

      {/* Top Navbar */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        onOpenDataRoom={() => setIsDataRoomOpen(true)}
        onOpenContact={handleOpenContact}
        onOpenIntelligenceDashboard={() => handleOpenIntelligence('base')}
        globalViewMode={globalViewMode}
        onGlobalViewModeChange={setGlobalViewMode}
        onOpenFeedback={() => setIsFeedbackDrawerOpen(true)}
        persona={activePersona}
        scenario={activeScenario}
      />

      {/* Main Single-Page Scroll Content */}
      <main id="main-content">
        
        {/* 1. Hero & Executive Briefing */}
        <HeroSection
          currency={currency}
          onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
          onOpenDataRoom={() => setIsDataRoomOpen(true)}
          onOpenContact={handleOpenContact}
          globalViewMode={globalViewMode}
          persona={activePersona}
          scenario={activeScenario}
        />

        {/* Real-Time Investor News Ticker */}
        <InvestorNewsTicker />

        <SectionDivider accent="cyan" label="01 // Dual-Engine Model" sectionId="dual-engines" />

        {/* 2. Synergistic Commercial Portfolios: The Dual Engines */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <div className="relative">
            <SectionMarker count={getCommentCount('Dual-Engine Model')} onClick={() => setIsFeedbackDrawerOpen(true)} sectionId="dual-engines" />
            <DualEngineSection />
          </div>
        </SectionReveal>

        <SectionDivider accent="indigo" label="02 // 6-Layer Fusion Stack" sectionId="fusion-stack" />

        {/* 3. 6-Layer Fusion Architecture Deep Dive */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <div className="relative">
            <SectionMarker count={getCommentCount('Technical Architecture')} onClick={() => setIsFeedbackDrawerOpen(true)} sectionId="fusion-stack" />
            <FusionStackSection />
          </div>
        </SectionReveal>

        <SectionDivider accent="purple" label="03 // R&D Roadmap" sectionId="rd-roadmap" />

        {/* 4. R&D Technology Development Timeline & Gantt Roadmap */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <RdRoadmapSection />
        </SectionReveal>

        <SectionDivider accent="cyan" label="04 // Execution Sprints" sectionId="milestones" />

        {/* Major Milestones & Strategic Sprints */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <div className="relative">
            <SectionMarker count={getCommentCount('Milestones & Roadmap')} onClick={() => setIsFeedbackDrawerOpen(true)} sectionId="milestones" />
            <MilestonesSection />
          </div>
        </SectionReveal>

        <SectionDivider accent="emerald" label="05 // Value Exchange" sectionId="value-exchange" />

        {/* Value Exchange Model */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <ValueExchangeSection />
        </SectionReveal>

        <SectionDivider accent="cyan" label="06 // Macro Hardware Shift" sectionId="market-shift" />

        {/* 5. Macro Catalyst: Big Tech Hardware Influx */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <MarketShiftSection />
        </SectionReveal>

        <SectionDivider accent="indigo" label="07 // Verified Deployments" sectionId="case-studies" />

        {/* 6. Verified Case Studies & Interactive ROI Calculator */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <CaseStudiesSection currency={currency} />
        </SectionReveal>

        <SectionDivider accent="emerald" label="08 // Unit Economics" sectionId="unit-economics" />

        {/* 7. Recalibrated 9-Tier Unit Economics (USD & BDT Waterfall) with Financial Scenarios */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <div className="relative">
            <SectionMarker count={getCommentCount('Financials & Valuation')} onClick={() => setIsFeedbackDrawerOpen(true)} sectionId="unit-economics" />
            <UnitEconomicsSection 
              currency={currency} 
              onOpenIntelligenceDashboard={handleOpenIntelligence}
            />
          </div>
        </SectionReveal>

        <SectionDivider accent="cyan" label="09 // Dual-Shore Sync" sectionId="dual-shore-globe" />

        {/* 8. Interactive Holographic Dual-Shore Globe (San Jose ↔ Dhaka) */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <DualShoreGlobeSection onOpenContact={handleOpenContact} />
        </SectionReveal>

        <SectionDivider accent="indigo" label="10 // Executive Leadership" sectionId="executive-team" />

        {/* 9. Executive Leadership & Founding Team */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <ExecutiveTeamSection onOpenContact={handleOpenContact} />
        </SectionReveal>

        <SectionDivider accent="purple" label="11 // Passive IP Streams" sectionId="passive-ip" />

        {/* 10. Non-Client, Passive & Creator Commerce Streams */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <PassiveIPSection currency={currency} />
        </SectionReveal>

        <SectionDivider accent="cyan" label="12 // Competitive Moat" sectionId="moat-benchmarks" />

        {/* 11. Real-World Benchmarks & Competitive Moat Matrix */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <MoatAndBenchmarksSection />
        </SectionReveal>

        <SectionDivider accent="emerald" label="13 // Seed SAFE Terms" sectionId="investment-terms" />

        {/* 12. Seed Round SAFE Terms, Capital Allocation & Milestones */}
        <SectionReveal delay={0.05} stagger={0.08}>
          <InvestmentTermsSection
            currency={currency}
            onOpenDataRoom={() => setIsDataRoomOpen(true)}
            onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
            onOpenContact={handleOpenContact}
          />
        </SectionReveal>

      </main>

      {/* Floating Active Investor Persona Track Indicator */}
      <ActiveTrackIndicator
        activePersona={activePersona}
        onOpenWizard={() => setIsOnboardingOpen(true)}
      />

      {/* Footer */}
      <Footer
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        onOpenDataRoom={() => setIsDataRoomOpen(true)}
        onOpenContact={(topic) => handleOpenContact(topic || 'General Enterprise & Investor Inquiry')}
      />

      {/* Fullscreen 12-Slide Pitch Deck Modal */}
      <PitchDeckModal
        isOpen={isPitchDeckOpen}
        onClose={() => setIsPitchDeckOpen(false)}
      />

      {/* Investor Due Diligence Data Room Modal with Keyword Search & Deep Links */}
      <DataRoomModal
        isOpen={isDataRoomOpen}
        onClose={() => setIsDataRoomOpen(false)}
        onNavigateToSection={(sectionId) => {
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              el.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]', 'transition-all');
              setTimeout(() => el.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-[#05070B]'), 3000);
            }
          }, 200);
        }}
      />

      {/* Direct Investor & Partner Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        defaultInterestArea={contactInterestArea}
      />

      {/* Interactive D3.js Investor Intelligence Dashboard Modal */}
      <InvestorIntelligenceDashboard
        isOpen={isIntelligenceOpen}
        onClose={() => setIsIntelligenceOpen(false)}
        currency={currency}
        initialScenario={activeScenario}
      />

      {/* Interactive Onboarding Wizard Modal for Investor Personas */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSelectPersona={(persona) => setActivePersona(persona)}
      />

      {/* Global Omni-Search Modal */}
      <OmniSearchModal
        isOpen={isOmniSearchOpen}
        onClose={() => setIsOmniSearchOpen(false)}
      />

      {/* Executive Feedback Drawer */}
      <ExecutiveFeedbackDrawer
        isOpen={isFeedbackDrawerOpen}
        onClose={() => setIsFeedbackDrawerOpen(false)}
        comments={comments}
        setComments={setComments}
      />
      
      <SectionMap comments={comments} />
      <SectionNavigator
        currency={currency}
        persona={activePersona}
        scenario={activeScenario}
        globalViewMode={globalViewMode}
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        onOpenDataRoom={() => setIsDataRoomOpen(true)}
        onOpenContact={() => handleOpenContact('Direct Leadership Inquiry')}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenIntelligenceDashboard={() => handleOpenIntelligence('base')}
        onOpenFeedback={() => setIsFeedbackDrawerOpen(true)}
      />
      <AnomalyWatchToast />
      <VoiceNavigator />

      {/* Floating Augmented Reality 3D Spatial Viewer Modal */}
      <ArPreviewModal />

      {/* Restored Shared Briefing Session Notification Toast */}
      {restoredSessionNotice && (
        <div 
          data-print-hide="true"
          className="fixed bottom-20 right-4 z-[85] max-w-sm sm:max-w-md p-4 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-xl text-slate-100 flex items-start gap-3 no-print"
        >
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 shrink-0 mt-0.5 border border-cyan-500/30">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 text-xs font-sans">
            <div className="font-bold text-cyan-300 font-mono flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SHARED BRIEFING SESSION RESTORED</span>
            </div>
            <p className="text-slate-300 mt-1 leading-snug">
              {restoredSessionNotice.personaTitle && <span>Track: <strong className="text-white">{restoredSessionNotice.personaTitle}</strong> · </span>}
              {restoredSessionNotice.scenario && <span>{restoredSessionNotice.scenario} · </span>}
              {restoredSessionNotice.currency && <span className="font-mono">{restoredSessionNotice.currency}</span>}
            </p>
            <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
              Token: {restoredSessionNotice.sessionId}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRestoredSessionNotice(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Dismiss restored session alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Storage Manager & App Vault Modal */}
      <StorageManager />
    </div>
    </StackProvider>
    </ArPreviewProvider>
  </SentimentProvider>
  );
}

