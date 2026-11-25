import React, { createContext, useContext, useState, useEffect } from 'react';

export type InvestorSentiment = 'cautious' | 'bullish' | 'neutral' | 'defensive';

export interface SentimentConfig {
  id: InvestorSentiment;
  name: string;
  tagline: string;
  emoji: string;
  badgeColor: string;
  accentColor: string;
  accentGlow: string;
  saturationFilter: string;
  focusSummary: string;
}

export const SENTIMENT_CONFIGS: Record<InvestorSentiment, SentimentConfig> = {
  bullish: {
    id: 'bullish',
    name: 'Bullish Growth',
    tagline: 'Aggressive Upside & 450% ROI Multiplier',
    emoji: '🚀',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.35)',
    saturationFilter: 'saturate(1.25) contrast(1.04)',
    focusSummary: 'Prioritizing exponential TAM capture, inbound partner referrals, and rapid enterprise scaling.',
  },
  cautious: {
    id: 'cautious',
    name: 'Cautiously Optimistic',
    tagline: 'Calibrated Growth & Dual-Engine Synergy',
    emoji: '✨',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentColor: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.3)',
    saturationFilter: 'saturate(1.0) contrast(1.0)',
    focusSummary: 'Balanced 32.5%–45% gross margin governance with disciplined R&D and 18-month runway safety.',
  },
  neutral: {
    id: 'neutral',
    name: 'Neutral / Due Diligence',
    tagline: 'Institutional Audits & Unit Economics',
    emoji: '⚖️',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    accentColor: '#6366f1',
    accentGlow: 'rgba(99, 102, 241, 0.3)',
    saturationFilter: 'saturate(0.88) contrast(1.02)',
    focusSummary: 'Focused on audited USD & BDT waterfall reconciliation, Delaware C-Corp governance, and DCF defensibility.',
  },
  defensive: {
    id: 'defensive',
    name: 'Risk-Averse / Defensive',
    tagline: 'Downside Stress-Testing & Moat Security',
    emoji: '🛡️',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentColor: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.35)',
    saturationFilter: 'saturate(0.92) contrast(1.0)',
    focusSummary: 'Stress-testing extended sales cycles, air-gapped zero cloud egress, and SAFE valuation cap protection.',
  },
};

interface SentimentContextType {
  sentiment: InvestorSentiment;
  setSentiment: (sentiment: InvestorSentiment) => void;
  config: SentimentConfig;
}

const SentimentContext = createContext<SentimentContextType>({
  sentiment: 'cautious',
  setSentiment: () => {},
  config: SENTIMENT_CONFIGS.cautious,
});

export const SentimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sentiment, setSentimentState] = useState<InvestorSentiment>(() => {
    try {
      const stored = localStorage.getItem('spenta-investor-sentiment');
      if (stored && stored in SENTIMENT_CONFIGS) {
        return stored as InvestorSentiment;
      }
    } catch {
      // ignore
    }
    return 'cautious';
  });

  const config = SENTIMENT_CONFIGS[sentiment];

  const setSentiment = (newSentiment: InvestorSentiment) => {
    setSentimentState(newSentiment);
    try {
      localStorage.setItem('spenta-investor-sentiment', newSentiment);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-sentiment', sentiment);
    root.style.setProperty('--sentiment-accent', config.accentColor);
    root.style.setProperty('--sentiment-glow', config.accentGlow);
    
    // Apply background saturation & contrast dynamically to main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.style.filter = config.saturationFilter;
      mainContent.style.transition = 'filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    }
  }, [sentiment, config]);

  return (
    <SentimentContext.Provider value={{ sentiment, setSentiment, config }}>
      {children}
    </SentimentContext.Provider>
  );
};

export const useInvestorSentiment = () => useContext(SentimentContext);
