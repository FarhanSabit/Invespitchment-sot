import React, { useState, useEffect, useCallback } from 'react';
import { Currency, USD_TO_BDT_RATE } from '../types';
import { Sparkles, RefreshCw, Copy, Check, AlertCircle, FileText, ShieldCheck } from 'lucide-react';

interface FinancialSummaryGeneratorProps {
  scenario: 'conservative' | 'base' | 'aggressive';
  onScenarioChange?: (s: 'conservative' | 'base' | 'aggressive') => void;
  tierName: string;
  tierCode: string;
  effectiveRevenueUsd: number;
  effectiveGrossMarginPercent: number;
  effectiveNetMarginPercent: number;
  effectiveNetProfitUsd: number;
  cacPercent: number;
  overheadPercent: number;
  currency: Currency;
}

const SCENARIO_DISPLAY_LABELS: Record<'conservative' | 'base' | 'aggressive', { label: string; tag: string }> = {
  base: {
    label: 'Base Model',
    tag: 'Audited Dual-Shore Baseline',
  },
  aggressive: {
    label: 'Aggressive Growth',
    tag: 'Scale Economies & Modular SDKs',
  },
  conservative: {
    label: 'Market-Fit / Conservative',
    tag: 'Downside Stress-Tested Market-Fit',
  },
};

export const FinancialSummaryGenerator: React.FC<FinancialSummaryGeneratorProps> = ({
  scenario,
  onScenarioChange,
  tierName,
  tierCode,
  effectiveRevenueUsd,
  effectiveGrossMarginPercent,
  effectiveNetMarginPercent,
  effectiveNetProfitUsd,
  cacPercent,
  overheadPercent,
  currency,
}) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const formatMoney = useCallback(
    (usdVal: number) => {
      if (currency === 'USD') {
        return `$${Math.round(usdVal).toLocaleString()}`;
      } else {
        return `${Math.round(usdVal * USD_TO_BDT_RATE).toLocaleString()} ৳`;
      }
    },
    [currency]
  );

  const generateThesisSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const scenarioLabel = SCENARIO_DISPLAY_LABELS[scenario].label;
      const response = await fetch('/api/financial-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scenarioLabel,
          tierName,
          tierCode,
          revenue: formatMoney(effectiveRevenueUsd),
          grossMargin: effectiveGrossMarginPercent,
          netMargin: effectiveNetMarginPercent,
          netProfit: formatMoney(effectiveNetProfitUsd),
          cacPercent,
          overheadPercent,
          currency,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      setSummary(data.summary || '');
    } catch (err: any) {
      setError(err.message || 'Unable to generate AI investment thesis summary.');
    } finally {
      setIsLoading(false);
    }
  }, [
    scenario,
    tierName,
    tierCode,
    effectiveRevenueUsd,
    effectiveGrossMarginPercent,
    effectiveNetMarginPercent,
    effectiveNetProfitUsd,
    cacPercent,
    overheadPercent,
    currency,
    formatMoney,
  ]);

  // Automatically regenerate whenever scenario or active tier changes
  useEffect(() => {
    generateThesisSummary();
  }, [generateThesisSummary]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-slate-950 via-cyan-950/20 to-indigo-950/20 border border-cyan-500/30 rounded-xl p-5 mb-8 max-w-4xl mx-auto backdrop-blur-md shadow-xl relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                AI FINANCIAL SUMMARY // INVESTMENT THESIS GENERATOR
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {SCENARIO_DISPLAY_LABELS[scenario].label}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Live one-paragraph institutional thesis calibrated to active scenario & tier parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Quick Scenario Pills (Base / Aggressive / Market-Fit) */}
          {onScenarioChange && (
            <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
              <button
                onClick={() => onScenarioChange('base')}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  scenario === 'base'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Base
              </button>
              <button
                onClick={() => onScenarioChange('aggressive')}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  scenario === 'aggressive'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Aggressive
              </button>
              <button
                onClick={() => onScenarioChange('conservative')}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  scenario === 'conservative'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Market-Fit
              </button>
            </div>
          )}

          <button
            onClick={generateThesisSummary}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Regenerate AI Thesis Summary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>

          {summary && !isLoading && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition-all cursor-pointer"
              title="Copy Investment Thesis Paragraph"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Body Area */}
      <div className="pt-4">
        {isLoading ? (
          <div className="space-y-2.5 py-2 animate-pulse">
            <div className="h-3.5 bg-slate-800/90 rounded w-11/12" />
            <div className="h-3.5 bg-slate-800/90 rounded w-full" />
            <div className="h-3.5 bg-slate-800/90 rounded w-4/5" />
          </div>
        ) : error ? (
          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs font-mono text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-rose-300">AI Thesis Synthesis Error</div>
              <div>{error}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 shadow-inner">
            {summary}
          </p>
        )}

        {/* Bottom Metadata Pill Row */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400">
              <FileText className="w-3 h-3" />
              <span>Tier: {tierCode} ({tierName})</span>
            </span>
            <span>•</span>
            <span>Gross Margin: <strong className="text-white">{effectiveGrossMarginPercent}%</strong></span>
            <span>•</span>
            <span>Net Margin: <strong className="text-emerald-400">{effectiveNetMarginPercent}%</strong></span>
          </div>
          <span className="flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Auto-updates on Scenario Switch</span>
          </span>
        </div>
      </div>
    </div>
  );
};
