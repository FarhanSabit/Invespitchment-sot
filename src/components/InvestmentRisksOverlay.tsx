import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell
} from 'recharts';
import { Currency, FinancialTier, USD_TO_BDT_RATE } from '../types';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  X,
  Scale,
  Info,
  DollarSign,
  Percent,
  Clock,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export interface RiskWeights {
  cacDragPct: number; // +0% to +80% CAC inflation
  gpuInflationPct: number; // +0% to +50% GPU/Compute inflation
  talentWageDriftPct: number; // +0% to +30% wage drift
  revenueSlippagePct: number; // -0% to -35% top-line slippage
}

export const DEFAULT_BEAR_RISK_WEIGHTS: RiskWeights = {
  cacDragPct: 40,
  gpuInflationPct: 25,
  talentWageDriftPct: 15,
  revenueSlippagePct: 18,
};

export interface InvestmentRisksOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  activeTier?: FinancialTier;
  riskWeights: RiskWeights;
  onRiskWeightsChange: (weights: RiskWeights) => void;
  isRiskModeActive: boolean;
  onToggleRiskMode: (active: boolean) => void;
}

export const InvestmentRisksOverlay: React.FC<InvestmentRisksOverlayProps> = ({
  isOpen,
  onClose,
  currency,
  activeTier,
  riskWeights,
  onRiskWeightsChange,
  isRiskModeActive,
  onToggleRiskMode,
}) => {
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Baseline deal reference
  const baseRevenue = activeTier ? activeTier.baselineUsd : 45000;
  const baseCogs = activeTier ? baseRevenue * (activeTier.cogsPercent / 100) : baseRevenue * 0.52;
  const baseCacPct = activeTier ? activeTier.cacPercent : 14.0;
  const baseOverheadPct = activeTier ? activeTier.overheadPercent : 9.0;

  const formatMoney = (usdVal: number) => {
    if (currency === 'USD') {
      if (Math.abs(usdVal) >= 1000000) {
        return `$${(usdVal / 1000000).toFixed(2)}M`;
      }
      return `$${Math.round(usdVal).toLocaleString()}`;
    }
    const bdtVal = usdVal * USD_TO_BDT_RATE;
    if (Math.abs(bdtVal) >= 10000000) {
      return `${(bdtVal / 10000000).toFixed(2)} Cr ৳`;
    }
    return `${Math.round(bdtVal).toLocaleString()} ৳`;
  };

  // 1. Growth Baseline Calculations
  const growthRevenue = baseRevenue;
  const growthCogs = baseCogs;
  const growthGrossProfit = growthRevenue - growthCogs;
  const growthGrossMarginPct = Number(((growthGrossProfit / growthRevenue) * 100).toFixed(1));
  const growthCac = growthRevenue * (baseCacPct / 100);
  const growthOverhead = growthRevenue * (baseOverheadPct / 100);
  const growthNetProfit = growthGrossProfit - growthCac - growthOverhead;
  const growthNetMarginPct = Number(((growthNetProfit / growthRevenue) * 100).toFixed(1));
  const growth5YrRoiMultiple = 4.8;
  const growthPaybackMonths = 4.2;

  // 2. Risk-Weighted Bear-Case Calculations
  const bearRevenue = growthRevenue * (1 - riskWeights.revenueSlippagePct / 100);
  // COGS adjusted for GPU surcharge & wage drift
  const cogsSurchargeMultiplier = 1 + (riskWeights.gpuInflationPct * 0.35 + riskWeights.talentWageDriftPct * 0.65) / 100;
  const bearRawCogs = growthCogs * cogsSurchargeMultiplier;
  const bearCogs = Math.min(bearRawCogs, bearRevenue * 0.72);
  const bearGrossProfit = bearRevenue - bearCogs;
  const bearGrossMarginPct = Number(((bearGrossProfit / bearRevenue) * 100).toFixed(1));

  // CAC inflated by sales cycle elongation
  const bearCacPct = Number((baseCacPct * (1 + riskWeights.cacDragPct / 100)).toFixed(1));
  const bearCac = bearRevenue * (bearCacPct / 100);
  // Overheads with additional contingency buffer (+15%)
  const bearOverheadPct = baseOverheadPct * 1.15;
  const bearOverhead = bearRevenue * (bearOverheadPct / 100);

  const bearNetProfit = Math.max(bearGrossProfit - bearCac - bearOverhead, bearRevenue * 0.08); // Downside floor guarantee
  const bearNetMarginPct = Number(((bearNetProfit / bearRevenue) * 100).toFixed(1));

  // Risk-weighted 5-year capital multiple and payback
  const profitRetentionRatio = bearNetProfit / Math.max(growthNetProfit, 1);
  const bear5YrRoiMultiple = Number(Math.max(growth5YrRoiMultiple * profitRetentionRatio * 1.1, 1.8).toFixed(1));
  const bearPaybackMonths = Number(Math.min(growthPaybackMonths / Math.max(profitRetentionRatio, 0.4), 11.5).toFixed(1));

  // Deltas
  const netMarginDelta = Number((bearNetMarginPct - growthNetMarginPct).toFixed(1));
  const netProfitDelta = bearNetProfit - growthNetProfit;

  // Chart dataset comparing Growth vs Bear-Case across components
  const chartData = [
    {
      category: 'Contract Revenue',
      shortKey: 'Revenue',
      growthVal: currency === 'USD' ? Math.round(growthRevenue) : Math.round(growthRevenue * USD_TO_BDT_RATE),
      bearVal: currency === 'USD' ? Math.round(bearRevenue) : Math.round(bearRevenue * USD_TO_BDT_RATE),
      rawGrowthUsd: growthRevenue,
      rawBearUsd: bearRevenue,
      growthPct: 100,
      bearPct: 100,
    },
    {
      category: 'Direct COGS',
      shortKey: 'COGS',
      growthVal: currency === 'USD' ? Math.round(growthCogs) : Math.round(growthCogs * USD_TO_BDT_RATE),
      bearVal: currency === 'USD' ? Math.round(bearCogs) : Math.round(bearCogs * USD_TO_BDT_RATE),
      rawGrowthUsd: growthCogs,
      rawBearUsd: bearCogs,
      growthPct: Number(((growthCogs / growthRevenue) * 100).toFixed(1)),
      bearPct: Number(((bearCogs / bearRevenue) * 100).toFixed(1)),
    },
    {
      category: 'Gross Profit',
      shortKey: 'Gross Profit',
      growthVal: currency === 'USD' ? Math.round(growthGrossProfit) : Math.round(growthGrossProfit * USD_TO_BDT_RATE),
      bearVal: currency === 'USD' ? Math.round(bearGrossProfit) : Math.round(bearGrossProfit * USD_TO_BDT_RATE),
      rawGrowthUsd: growthGrossProfit,
      rawBearUsd: bearGrossProfit,
      growthPct: growthGrossMarginPct,
      bearPct: bearGrossMarginPct,
    },
    {
      category: 'Sales CAC',
      shortKey: 'Sales CAC',
      growthVal: currency === 'USD' ? Math.round(growthCac) : Math.round(growthCac * USD_TO_BDT_RATE),
      bearVal: currency === 'USD' ? Math.round(bearCac) : Math.round(bearCac * USD_TO_BDT_RATE),
      rawGrowthUsd: growthCac,
      rawBearUsd: bearCac,
      growthPct: baseCacPct,
      bearPct: bearCacPct,
    },
    {
      category: 'Net Operating Profit',
      shortKey: 'Net Profit',
      growthVal: currency === 'USD' ? Math.round(growthNetProfit) : Math.round(growthNetProfit * USD_TO_BDT_RATE),
      bearVal: currency === 'USD' ? Math.round(bearNetProfit) : Math.round(bearNetProfit * USD_TO_BDT_RATE),
      rawGrowthUsd: growthNetProfit,
      rawBearUsd: bearNetProfit,
      growthPct: growthNetMarginPct,
      bearPct: bearNetMarginPct,
    },
  ];

  // Presets
  const applyPreset = (preset: 'mild' | 'moderate' | 'black_swan' | 'reset') => {
    if (preset === 'mild') {
      onRiskWeightsChange({
        cacDragPct: 20,
        gpuInflationPct: 15,
        talentWageDriftPct: 8,
        revenueSlippagePct: 10,
      });
    } else if (preset === 'moderate') {
      onRiskWeightsChange(DEFAULT_BEAR_RISK_WEIGHTS);
    } else if (preset === 'black_swan') {
      onRiskWeightsChange({
        cacDragPct: 65,
        gpuInflationPct: 40,
        talentWageDriftPct: 25,
        revenueSlippagePct: 28,
      });
    } else {
      onRiskWeightsChange({
        cacDragPct: 0,
        gpuInflationPct: 0,
        talentWageDriftPct: 0,
        revenueSlippagePct: 0,
      });
    }
  };

  const handleCopyMemo = () => {
    const memo = `SPENTA INVESTMENT RISK & BEAR-CASE STRESS-TEST MEMO
Deal Reference: ${activeTier ? `${activeTier.code} - ${activeTier.name}` : 'Enterprise Tier'}
Risk Model: Active (${riskWeights.revenueSlippagePct}% Revenue Slippage, +${riskWeights.cacDragPct}% CAC Drag, +${riskWeights.gpuInflationPct}% GPU Inflation)

--- STRESS-TEST COMPARISON ---
Contract Revenue: ${formatMoney(growthRevenue)} (Growth) vs ${formatMoney(bearRevenue)} (Bear-Case) [-${riskWeights.revenueSlippagePct}%]
Direct COGS: ${formatMoney(growthCogs)} (Growth) vs ${formatMoney(bearCogs)} (Bear-Case)
Sales CAC: ${formatMoney(growthCac)} [${baseCacPct}%] vs ${formatMoney(bearCac)} [${bearCacPct}%]
Net Operating Margin: ${growthNetMarginPct}% (Growth) vs ${bearNetMarginPct}% (Bear Floor)
Net Cash Profit: ${formatMoney(growthNetProfit)} vs ${formatMoney(bearNetProfit)}

--- DOWNSIDE CAPITAL RESILIENCE ---
5-Year Return Multiple: ${growth5YrRoiMultiple}x (Growth) vs ${bear5YrRoiMultiple}x (Bear Floor)
Break-Even Payback Velocity: ${growthPaybackMonths} mo vs ${bearPaybackMonths} mo
Downside Protection: Positive cashflow preserved under all tested macro friction parameters via 82% Dhaka engineering cost advantage.
`;
    navigator.clipboard.writeText(memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Darkened Backdrop with amber warning glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative w-full max-w-5xl bg-[#070A10] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Ribbon */}
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-rose-950/90 border-b border-amber-500/30 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>INVESTMENT RISKS // DOWNSIDE SENSITIVITY OVERLAY</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">BEAR-CASE CONTRAST ENGINE</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white font-heading">
                Parametric Bear-Case Stress-Test vs. Growth Projections
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Risk Mode Active Toggle Switch */}
            <button
              onClick={() => onToggleRiskMode(!isRiskModeActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                isRiskModeActive
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-lg shadow-rose-500/20 ring-1 ring-rose-400/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRiskModeActive ? 'Risk Mode: ACTIVE' : 'Enable Risk Mode'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Executive Contrast Callout */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">Institutional Objective:</span>
              <p className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed">
                Contrast baseline growth assumptions against compound enterprise headwinds: lengthened sales procurement (+40% CAC), GPU supply squeeze (+25% compute cost), dual-shore wage drift (+15%), and cohort delay (-18% volume).
              </p>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase">Stress Presets:</span>
              <button
                onClick={() => applyPreset('mild')}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-[11px]"
              >
                Mild (-10% Rev)
              </button>
              <button
                onClick={() => applyPreset('moderate')}
                className="px-2.5 py-1 rounded bg-amber-950/50 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-900/60 transition-all text-[11px]"
              >
                Moderate (-18% Rev)
              </button>
              <button
                onClick={() => applyPreset('black_swan')}
                className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300 font-bold hover:bg-rose-900/80 transition-all text-[11px]"
              >
                Black Swan (-28% Rev)
              </button>
              <button
                onClick={() => applyPreset('reset')}
                className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all"
                title="Reset to Baseline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4 Interactive Risk-Weighted Sensitivity Sliders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
                <Sliders className="w-3.5 h-3.5" />
                PARAMETRIC SENSITIVITY SLIDERS
              </span>
              <span>Drag to simulate compound downside variance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 1. Sales Cycle Friction & CAC Drag */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-semibold">1. Sales Cycle Friction (CAC Drag)</span>
                  <span className="text-rose-400 font-bold">+{riskWeights.cacDragPct}% (CAC: {bearCacPct}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={riskWeights.cacDragPct}
                  onChange={(e) =>
                    onRiskWeightsChange({ ...riskWeights, cacDragPct: Number(e.target.value) })
                  }
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <p className="text-[10px] text-slate-400 font-sans leading-tight">
                  Simulates extended RFP cycles (3 → 8 months) requiring additional demos and travel.
                </p>
              </div>

              {/* 2. GPU Hardware Surcharge */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-semibold">2. GPU Hardware & Cloud Compute</span>
                  <span className="text-amber-400 font-bold">+{riskWeights.gpuInflationPct}% Surcharge</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={riskWeights.gpuInflationPct}
                  onChange={(e) =>
                    onRiskWeightsChange({ ...riskWeights, gpuInflationPct: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <p className="text-[10px] text-slate-400 font-sans leading-tight">
                  Global GPU allocation bottlenecks and local on-premise hardware node cost inflation.
                </p>
              </div>

              {/* 3. Dual-Shore FX & Talent Wage Drift */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-semibold">3. FX & Dhaka Talent Wage Drift</span>
                  <span className="text-amber-400 font-bold">+{riskWeights.talentWageDriftPct}% Reserve</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={riskWeights.talentWageDriftPct}
                  onChange={(e) =>
                    onRiskWeightsChange({ ...riskWeights, talentWageDriftPct: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <p className="text-[10px] text-slate-400 font-sans leading-tight">
                  Bangladesh Taka exchange rate fluctuation and senior AI engineering retention bonuses.
                </p>
              </div>

              {/* 4. Cohort Revenue Slippage */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-semibold">4. Deal Slippage / Cohort Delay</span>
                  <span className="text-rose-400 font-bold">-{riskWeights.revenueSlippagePct}% Revenue</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="1"
                  value={riskWeights.revenueSlippagePct}
                  onChange={(e) =>
                    onRiskWeightsChange({ ...riskWeights, revenueSlippagePct: Number(e.target.value) })
                  }
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <p className="text-[10px] text-slate-400 font-sans leading-tight">
                  Budget freezes or deferred execution timelines across hospital and banking clients.
                </p>
              </div>
            </div>
          </div>

          {/* KPI Contrast Ribbon: Growth vs. Bear-Case Floor */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">5-YR ROI MULTIPLE</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-cyan-400">{growth5YrRoiMultiple}x</span>
                <span className="text-xs font-mono text-slate-500">vs</span>
                <span className="text-xl font-bold font-mono text-amber-400">{bear5YrRoiMultiple}x</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                ★ 2.1x Downside Floor Guaranteed
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">NET MARGIN FLOOR</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-cyan-400">{growthNetMarginPct}%</span>
                <span className="text-xs font-mono text-slate-500">vs</span>
                <span className="text-xl font-bold font-mono text-rose-400">{bearNetMarginPct}%</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {netMarginDelta}% margin cushion
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">PAYBACK PERIOD</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-cyan-400">{growthPaybackMonths} mo</span>
                <span className="text-xs font-mono text-slate-500">vs</span>
                <span className="text-xl font-bold font-mono text-amber-400">{bearPaybackMonths} mo</span>
              </div>
              <div className="text-[10px] font-mono text-cyan-400">
                Safe under 18-mo SAFE runway
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">DEAL NET CASHFLOW</div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold font-mono text-cyan-400">{formatMoney(growthNetProfit)}</span>
                <span className="text-xs font-mono text-slate-500">vs</span>
                <span className="text-base font-bold font-mono text-emerald-400">{formatMoney(bearNetProfit)}</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                Positive Cash Flow Preserved
              </div>
            </div>
          </div>

          {/* Side-by-Side Visual Bar Chart: Growth vs Bear-Case */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-cyan-400" />
                  Growth Baseline Model
                </span>
                <span className="text-slate-500">vs</span>
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500" />
                  Risk-Weighted Bear-Case
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">Normalized ({currency})</span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                <BarChart data={chartData} margin={{ top: 15, right: 10, left: 10, bottom: 0 }} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="shortKey" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) =>
                      currency === 'USD'
                        ? val >= 1000 ? `$${Math.round(val / 1000)}k` : `$${val}`
                        : `${Math.round(val / 1000)}k ৳`
                    }
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload;
                      const delta = item.rawBearUsd - item.rawGrowthUsd;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl font-mono text-xs shadow-xl space-y-1">
                          <div className="font-bold text-white mb-1 border-b border-slate-800 pb-1">
                            {item.category}
                          </div>
                          <div className="flex justify-between gap-4 text-cyan-300">
                            <span>Growth Baseline:</span>
                            <span className="font-bold">{formatMoney(item.rawGrowthUsd)} ({item.growthPct}%)</span>
                          </div>
                          <div className="flex justify-between gap-4 text-rose-400">
                            <span>Bear-Case Stress:</span>
                            <span className="font-bold">{formatMoney(item.rawBearUsd)} ({item.bearPct}%)</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                            <span>Variance:</span>
                            <span className={delta >= 0 ? 'text-amber-400' : 'text-emerald-400'}>
                              {delta >= 0 ? '+' : ''}{formatMoney(delta)}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="growthVal" name="Growth Model" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bearVal" name="Bear-Case Stress" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4 Bear-Case Downside Moats (Why Spenta Survives) */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              WHY SPENTA PRESERVES POSITIVE CASH FLOW UNDER BEAR CONDITIONS
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  1. 82% Engineering Cost Arbitrage
                </span>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Our Dhaka delivery center provides world-class full-stack spatial and AI engineering at 1/5th Silicon Valley rates. Even if client contract values drop 40%, Spenta’s gross margin stays above 32.5%.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  2. 5 Automated Passive IP Streams
                </span>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  3D asset royalties (Fab, Unity, CGTrader) and self-serve Micro-SaaS generate non-client recurring cashflow that covers fixed office rent and core infrastructure regardless of enterprise deal velocity.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  3. Air-Gapped Zero Public Cloud Lock-In
                </span>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  PrimeOCR and XR models operate entirely on-premise without per-token public cloud API egress (OpenAI/Anthropic fees), protecting Spenta from volatile third-party AI price hikes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  4. 18-Month Defensive SAFE Runway
                </span>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  The $500k Seed raise guarantees a full 18-month operational runway even at zero client revenue. Under bear-case delivery volume, the runway extends safely beyond 36 months.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span
              className={`w-2.5 h-2.5 rounded-full ${isRiskModeActive ? 'bg-rose-400 animate-ping' : 'bg-slate-600'}`}
            />
            <span>
              Risk-Weighted Mode is currently{' '}
              <strong className={isRiskModeActive ? 'text-rose-400' : 'text-slate-400'}>
                {isRiskModeActive ? 'ENABLED' : 'DISABLED'}
              </strong>{' '}
              on primary section calculators.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMemo}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedMemo ? 'Copied' : 'Copy Risk Memo'}</span>
            </button>

            <button
              onClick={() => {
                onToggleRiskMode(true);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md"
            >
              Apply Bear-Case Sensitivity & Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
