import React, { useState, useEffect, useRef } from 'react';
import { Currency, USD_TO_BDT_RATE } from '../types';
import { generateBriefingPdf } from '../utils/pdfGenerator';
import { 
  FileText, 
  Presentation, 
  ShieldCheck, 
  Globe, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown,
  Layers, 
  TrendingUp, 
  Briefcase, 
  Cpu, 
  Sparkles, 
  DollarSign, 
  Mail, 
  Download, 
  CheckCircle2, 
  GitBranch, 
  Users,
  LineChart,
  Printer,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';

import { GlobalViewMode } from '../App';
import { SpentaLogo } from './SpentaLogo';
import { GlobalTableOfContents } from './GlobalTableOfContents';
import { triggerBriefingPrint } from '../utils/printBriefing';
import { ShareBriefingButton } from './ShareBriefingButton';
import { InvestorPersona } from './OnboardingWizardModal';
import { FinancialScenario } from './UnitEconomicsSection';

interface NavbarProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onOpenPitchDeck: () => void;
  onOpenDataRoom: () => void;
  onOpenContact: (interest?: string) => void;
  onOpenIntelligenceDashboard?: () => void;
  globalViewMode?: GlobalViewMode;
  onGlobalViewModeChange?: (mode: GlobalViewMode) => void;
  onOpenFeedback?: () => void;
  persona?: InvestorPersona | null;
  scenario?: FinancialScenario;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onCurrencyChange,
  onOpenPitchDeck,
  onOpenDataRoom,
  onOpenContact,
  onOpenIntelligenceDashboard,
  globalViewMode = 'investor',
  onGlobalViewModeChange,
  onOpenFeedback,
  persona,
  scenario = 'base'
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isToolsMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolsMenuOpen]);

  const handleDownloadPdf = () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        generateBriefingPdf(currency);
        setPdfSuccess(true);
        setTimeout(() => setPdfSuccess(false), 3000);
      } catch (err) {
        console.warn('[Spenta PDF Generator] Error:', err);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 400);
  };

  const navLinks = [
    { label: 'Dual Engines', href: '#dual-engines' },
    { label: '6-Layer Stack', href: '#fusion-stack' },
    { label: 'R&D Roadmap', href: '#rd-roadmap' },
    { label: 'Case Studies', href: '#case-studies' },
    { label: 'Unit Economics', href: '#unit-economics' },
    { label: 'Global Sync', href: '#dual-shore-globe' },
    { label: 'Executive Team', href: '#executive-team' },
    { label: 'Seed SAFE', href: '#investment-terms' },
  ];

  return (
    <header 
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#05070B]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/50 py-2.5' 
          : 'bg-transparent py-3.5'
      }`}
    >
      <div className="max-w-[1640px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between gap-2 lg:gap-3 min-w-0">
          
          {/* Official Brand Logo */}
          <a href="#" className="flex items-center gap-2 group focus:outline-none shrink-0 whitespace-nowrap">
            <SpentaLogo size="sm" />
            <span className="hidden xl:inline-block px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-[9px] font-mono font-bold text-cyan-300 tracking-wider whitespace-nowrap shrink-0">
              XR & AI
            </span>
          </a>

          {/* Primary Navigation Links (Single-line from 1024px / lg upward) */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-slate-900/60 p-1 rounded-lg border border-slate-800 backdrop-blur-md min-w-0">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-1.5 xl:px-2 py-1 text-[10.5px] xl:text-[11px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-all whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Top-Right Action & Navigation Controls */}
          <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 xl:gap-2">

              {/* Global View Mode Toggle (Inline >= 1360px, inside Tools < 1360px) */}
              {onGlobalViewModeChange && (
                <div className="hidden min-[1360px]:flex items-center bg-slate-900 border border-slate-700 rounded-md p-0.5 shrink-0">
                  <button
                    onClick={() => onGlobalViewModeChange('investor')}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-sm transition-all whitespace-nowrap shrink-0 ${
                      globalViewMode === 'investor' 
                        ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Investor
                  </button>
                  <button
                    onClick={() => onGlobalViewModeChange('partner')}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-sm transition-all whitespace-nowrap shrink-0 ${
                      globalViewMode === 'partner' 
                        ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Partner
                  </button>
                </div>
              )}

              {/* Leave Feedback Button (Inline >= 1680px, inside Tools < 1680px) */}
              {onOpenFeedback && (
                <button
                  onClick={onOpenFeedback}
                  className="hidden min-[1680px]:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="text-[11px]">Leave Feedback</span>
                </button>
              )}

              {/* Download Full Briefing Button */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                id="nav-download-briefing-btn"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-all border cursor-pointer whitespace-nowrap shrink-0 ${
                  pdfSuccess 
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/30 hover:border-cyan-400'
                }`}
                title="Download client-side high-fidelity PDF investor briefing"
              >
                {isGeneratingPdf ? (
                  <>
                    <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-[11px] hidden xl:inline">Compiling PDF...</span>
                  </>
                ) : pdfSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px] hidden xl:inline">Briefing Saved</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-[11px] font-semibold lg:hidden xl:inline">Download Briefing</span>
                    <span className="text-[11px] font-semibold hidden lg:inline xl:hidden">PDF</span>
                  </>
                )}
              </button>

              {/* Presentation Pitch Deck Button (Inline >= 1360px, inside Tools < 1360px) */}
              <button
                onClick={onOpenPitchDeck}
                id="nav-pitch-deck-btn"
                className="hidden min-[1360px]:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Presentation className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-[11px]">12-Slide Deck</span>
              </button>

              {/* D3 Intelligence Dashboard Overlay Button (Inline >= 1680px, inside Tools < 1680px) */}
              {onOpenIntelligenceDashboard && (
                <button
                  onClick={onOpenIntelligenceDashboard}
                  id="nav-d3-dashboard-btn"
                  className="hidden min-[1680px]:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400 transition-all cursor-pointer whitespace-nowrap shrink-0"
                  title="Launch D3.js 12-Quarter Growth Projections"
                >
                  <LineChart className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-[11px]">D3 Intel</span>
                </button>
              )}

              {/* Print Briefing Button (Inline >= 1680px, inside Tools < 1680px) */}
              <button
                type="button"
                onClick={triggerBriefingPrint}
                id="nav-print-briefing-btn"
                className="hidden min-[1680px]:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="Print Institutional Investor Briefing (Desktop Recommended)"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[11px]">Print</span>
              </button>

              {/* Share Briefing Button (Inline >= 1680px, inside Tools < 1680px) */}
              <div className="hidden min-[1680px]:block shrink-0">
                <ShareBriefingButton
                  currency={currency}
                  persona={persona}
                  scenario={scenario}
                  globalViewMode={globalViewMode}
                  variant="nav"
                />
              </div>

              {/* Secondary 'Tools' Overflow Menu (Constrained viewports including 1024px–1360px & up to 1679px) */}
              <div ref={toolsMenuRef} className="relative min-[1680px]:hidden shrink-0">
                <button
                  type="button"
                  id="nav-tools-overflow-btn"
                  onClick={() => setIsToolsMenuOpen((prev) => !prev)}
                  aria-expanded={isToolsMenuOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isToolsMenuOpen
                      ? 'bg-slate-800 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-[11px]">Tools</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isToolsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-xl p-3 shadow-2xl z-[60] space-y-2.5">
                    {onGlobalViewModeChange && (
                      <div className="space-y-1 min-[1360px]:hidden">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1">
                          Briefing Lens
                        </div>
                        <div className="grid grid-cols-2 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => onGlobalViewModeChange('investor')}
                            className={`px-2 py-1.5 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                              globalViewMode === 'investor'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Investor
                          </button>
                          <button
                            type="button"
                            onClick={() => onGlobalViewModeChange('partner')}
                            className={`px-2 py-1.5 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                              globalViewMode === 'partner'
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Partner
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-slate-800/80 min-[1360px]:border-t-0 pt-2 min-[1360px]:pt-0 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          onOpenPitchDeck();
                        }}
                        className="w-full flex min-[1360px]:hidden items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/25 transition-colors cursor-pointer"
                      >
                        <Presentation className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>12-Slide Pitch Deck</span>
                      </button>

                      {onOpenIntelligenceDashboard && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsToolsMenuOpen(false);
                            onOpenIntelligenceDashboard();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/25 transition-colors cursor-pointer"
                        >
                          <LineChart className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>D3 Intel Projections</span>
                        </button>
                      )}

                      {onOpenFeedback && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsToolsMenuOpen(false);
                            onOpenFeedback();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/25 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Leave Feedback</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          triggerBriefingPrint();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Print Briefing</span>
                      </button>

                      <div onClick={() => setIsToolsMenuOpen(false)} className="pt-0.5">
                        <ShareBriefingButton
                          currency={currency}
                          persona={persona}
                          scenario={scenario}
                          globalViewMode={globalViewMode}
                          variant="nav"
                          className="w-full justify-center py-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Room Button */}
              <button
                onClick={onOpenDataRoom}
                id="nav-data-room-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">Data Room</span>
              </button>
            </div>

            {/* Mobile Quick Actions */}
            <div className="flex sm:hidden items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-400 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                title="Download PDF"
                aria-label="Download Briefing PDF"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onCurrencyChange(currency === 'USD' ? 'BDT' : 'USD')}
                className="px-2 py-1 text-[11px] font-mono bg-slate-900 border border-slate-800 text-cyan-400 rounded-lg whitespace-nowrap shrink-0"
              >
                {currency}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 shrink-0"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Global Table of Contents Flyout Menu (Top-Right Corner) */}
            <GlobalTableOfContents />
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 p-4 bg-slate-950/95 border border-slate-800 rounded-2xl backdrop-blur-2xl space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 bg-slate-900/80 rounded-xl text-slate-300 hover:text-cyan-400"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDownloadPdf();
                }}
                disabled={isGeneratingPdf}
                className="w-full py-2.5 text-xs font-semibold bg-slate-900 text-cyan-300 border border-cyan-500/40 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Compiling PDF Briefing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Download Full Briefing (PDF)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerBriefingPrint();
                }}
                className="w-full py-2.5 text-xs font-semibold bg-slate-900 text-slate-200 border border-slate-700 rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                Print Briefing (Desktop Recommended)
              </button>
              <div onClick={() => setMobileMenuOpen(false)} className="w-full">
                <ShareBriefingButton
                  currency={currency}
                  persona={persona}
                  scenario={scenario}
                  globalViewMode={globalViewMode}
                  variant="nav"
                  className="w-full justify-center py-2.5 text-xs rounded-xl"
                />
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full py-2.5 text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-xl flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                Inquire & Contact Leadership
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPitchDeck();
                }}
                className="w-full py-2.5 text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 rounded-xl flex items-center justify-center gap-2"
              >
                <Presentation className="w-4 h-4" />
                Launch 12-Slide Pitch Deck (.pptx)
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDataRoom();
                }}
                className="w-full py-2.5 text-xs font-bold bg-cyan-500 text-slate-950 rounded-xl flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Access Investor Data Room & SSOT
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

