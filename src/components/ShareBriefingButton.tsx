import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Currency } from '../types';
import { InvestorPersona } from './OnboardingWizardModal';
import { FinancialScenario } from './UnitEconomicsSection';
import { GlobalViewMode } from '../App';
import { ShareBriefingModal } from './ShareBriefingModal';

interface ShareBriefingButtonProps {
  currency: Currency;
  persona?: InvestorPersona | null;
  scenario?: FinancialScenario;
  globalViewMode?: GlobalViewMode;
  currentSectionId?: string;
  variant?: 'nav' | 'hero' | 'pill' | 'icon';
  className?: string;
}

export const ShareBriefingButton: React.FC<ShareBriefingButtonProps> = ({
  currency,
  persona,
  scenario = 'base' as FinancialScenario,
  globalViewMode = 'investor' as GlobalViewMode,
  currentSectionId,
  variant = 'nav',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  let buttonClasses = '';
  if (variant === 'nav') {
    buttonClasses =
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm';
  } else if (variant === 'hero') {
    buttonClasses =
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold transition-all border cursor-pointer shadow-lg bg-slate-900/90 hover:bg-slate-800 text-purple-300 hover:text-purple-200 border-purple-500/40 hover:border-purple-400 shadow-purple-950/30';
  } else if (variant === 'pill') {
    buttonClasses =
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900 transition-colors cursor-pointer';
  } else {
    buttonClasses =
      'p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors cursor-pointer';
  }

  return (
    <>
      <button
        type="button"
        id={`share-briefing-btn-${variant}`}
        onClick={() => setIsModalOpen(true)}
        className={`${buttonClasses} ${className}`}
        title="Share tailored briefing link with preserved investor session state"
        aria-label="Share tailored briefing session"
      >
        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
        {variant !== 'icon' && <span>Share Briefing</span>}
      </button>

      <ShareBriefingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currency={currency}
        persona={persona}
        scenario={scenario}
        globalViewMode={globalViewMode}
        currentSectionId={currentSectionId}
      />
    </>
  );
};
