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
  Legend,
  Cell
} from 'recharts';
import { Currency, FinancialTier, USD_TO_BDT_RATE } from '../types';
import { FINANCIAL_TIERS } from '../data/mockData';
import {
  GitCompare,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Percent,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Copy,
  Check,
  ArrowLeftRight,
  Layers,
  ChevronDown
} from 'lucide-react';

export type FinancialScenario = 'conservative' | 'base' | 'aggressive';

export interface RoiScenarioComparatorProps {
  currency: Currency;
  activeTier?: FinancialTier;
  initialLeftScenario?: FinancialScenario;
  initialRightScenario?: FinancialScenario;
}

export const SCENARIO_PRESETS: Record<
  FinancialScenario,
  {
    name: string;
    badge: string;
    tagline: string;
    revenueMult: number;
    cogsMult: number;
    cacPercent: number;
    overheadPercent: number;
    color: string;
    fillColor: string;
    bgTint: string;
    borderColor: string;
    salesCycle: string;
    runwayImpact: string;
    paybackMonths: number;
    projected3YrRoi: string;
    riskProfile: string;
  }
> = {
  conservative: {
    name: 'Conservative',
    badge: 'Downside Stress-Test',
    tagline: 'Lengthened procurement, +10% COGS safety buffer, cold outbound CAC',
    revenueMult: 1.0,
    cogsMult: 1.1, // 10% higher direct costs
    cacPercent: 16.0, // Cold outbound acquisition
    overheadPercent: 10.0, // High reserve allocation
    color: '#FB7185', // Rose
    fillColor: '#F43F5E',
    bgTint: 'bg-rose-950/20',
    borderColor: 'border-rose-500/40',
    salesCycle: '6–9 Months (Enterprise RFP)',
    runwayImpact: '18 Months Defensive Runway',
    paybackMonths: 8.6,
    projected3YrRoi: '2.1x Floor',
    riskProfile: 'Low Execution Risk / Capital Defensive'
  },
  base: {
    name: 'Base Model',
    badge: 'Audited Dual-Shore Baseline',
    tagline: 'Fully absorbed cross-functional Dhaka/US labor with 12–15% CAC',
    revenueMult: 1.0,
    cogsMult: 1.0,
    cacPercent: 14.0,
    overheadPercent: 8.5,
    color: '#38BDF8', // Cyan
    fillColor: '#0EA5E9',
    bgTint: 'bg-cyan-950/20',
    borderColor: 'border-cyan-500/40',
    salesCycle: '3–4 Months (Standard B2B Cycles)',
    runwayImpact: '15 Months Balanced Deployment',
    paybackMonths: 5.8,
    projected3YrRoi: '3.4x Target',
    riskProfile: 'Balanced Enterprise Growth'
  },
  aggressive: {
    name: 'Aggressive',
    badge: 'Scale Economies & Modular SDKs',
    tagline: 'Modular WebXR & IDP asset reusability (-22% COGS), partner referrals (9% CAC)',
    revenueMult: 1.15, // +15% revenue expansion
    cogsMult: 0.78, // 22% lower COGS
    cacPercent: 9.0, // High inbound referral conversion
    overheadPercent: 7.0, // Optimized lean overheads
    color: '#34D399', // Emerald
    fillColor: '#10B981',
    bgTint: 'bg-emerald-950/20',
    borderColor: 'border-emerald-500/40',
    salesCycle: '1–2 Months (Partner Inbound & Direct POC)',
    runwayImpact: 'Accelerated R&D Reinvestment ($60k MRR)',
    paybackMonths: 3.9,
    projected3YrRoi: '4.8x Outlier',
    riskProfile: 'High Operating Leverage / Scalable Flywheel'
  }
};

export const RoiScenarioComparator: React.FC<RoiScenarioComparatorProps> = ({
  currency,
  activeTier: defaultActiveTier,
  initialLeftScenario = 'aggressive',
  initialRightScenario = 'conservative'
}) => {
  const [scenarioA, setScenarioA] = useState<FinancialScenario>(initialLeftScenario);
  const [scenarioB, setScenarioB] = useState<FinancialScenario>(initialRightScenario);
  const [selectedTierId, setSelectedTierId] = useState<string>(
    defaultActiveTier?.id || 'tier-a2'
  );
  const [metricMode, setMetricMode] = useState<'monetary' | 'percentage'>('monetary');
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  // Selected tier resolution
  const tier = useMemo(() => {
    return FINANCIAL_TIERS.find((t) => t.id === selectedTierId) || FINANCIAL_TIERS[1];
  }, [selectedTierId]);

  const configA = SCENARIO_PRESETS[scenarioA];
  const configB = SCENARIO_PRESETS[scenarioB];

  // Helper for money formatting
  const formatMoney = (usdVal: number) => {
    if (currency === 'USD') {
      return `$${Math.round(usdVal).toLocaleString()}`;
    }
    const bdtVal = Math.round(usdVal * USD_TO_BDT_RATE);
    return `${bdtVal.toLocaleString()} ৳`;
  };

  // Economics computation for Scenario A
  const revA = tier.baselineUsd * configA.revenueMult;
  const rawCogsA = tier.baselineUsd * (tier.cogsPercent / 100) * configA.cogsMult;
  const cogsA = Math.min(rawCogsA, revA * 0.75);
  const cogsPctA = Number(((cogsA / revA) * 100).toFixed(1));
  const grossProfitA = revA - cogsA;
  const grossMarginA = Number(((grossProfitA / revA) * 100).toFixed(1));
  const cacA = revA * (configA.cacPercent / 100);
  const overheadA = revA * (configA.overheadPercent / 100);
  const netProfitA = grossProfitA - cacA - overheadA;
  const netMarginA = Number(((netProfitA / revA) * 100).toFixed(1));

  // Economics computation for Scenario B
  const revB = tier.baselineUsd * configB.revenueMult;
  const rawCogsB = tier.baselineUsd * (tier.cogsPercent / 100) * configB.cogsMult;
  const cogsB = Math.min(rawCogsB, revB * 0.75);
  const cogsPctB = Number(((cogsB / revB) * 100).toFixed(1));
  const grossProfitB = revB - cogsB;
  const grossMarginB = Number(((grossProfitB / revB) * 100).toFixed(1));
  const cacB = revB * (configB.cacPercent / 100);
  const overheadB = revB * (configB.overheadPercent / 100);
  const netProfitB = grossProfitB - cacB - overheadB;
  const netMarginB = Number(((netProfitB / revB) * 100).toFixed(1));

  // Quick preset handler
  const setPreset = (a: FinancialScenario, b: FinancialScenario) => {
    setScenarioA(a);
    setScenarioB(b);
  };

  const swapScenarios = () => {
    setScenarioA(scenarioB);
    setScenarioB(scenarioA);
  };

  // Bar chart dataset: Grouped categories for side-by-side comparison
  const chartData = useMemo(() => {
    return [
      {
        category: 'Contract Revenue',
        shortKey: 'Revenue',
        valA: metricMode === 'monetary' ? Math.round(currency === 'USD' ? revA : revA * USD_TO_BDT_RATE) : 100,
        valB: metricMode === 'monetary' ? Math.round(currency === 'USD' ? revB : revB * USD_TO_BDT_RATE) : 100,
        rawUsdA: revA,
        rawUsdB: revB,
        pctA: 100,
        pctB: 100,
      },
      {
        category: 'Direct COGS',
        shortKey: 'Direct COGS',
        valA: metricMode === 'monetary' ? Math.round(currency === 'USD' ? cogsA : cogsA * USD_TO_BDT_RATE) : cogsPctA,
        valB: metricMode === 'monetary' ? Math.round(currency === 'USD' ? cogsB : cogsB * USD_TO_BDT_RATE) : cogsPctB,
        rawUsdA: cogsA,
        rawUsdB: cogsB,
        pctA: cogsPctA,
        pctB: cogsPctB,
      },
      {
        category: 'Gross Profit',
        shortKey: 'Gross Profit',
        valA: metricMode === 'monetary' ? Math.round(currency === 'USD' ? grossProfitA : grossProfitA * USD_TO_BDT_RATE) : grossMarginA,
        valB: metricMode === 'monetary' ? Math.round(currency === 'USD' ? grossProfitB : grossProfitB * USD_TO_BDT_RATE) : grossMarginB,
        rawUsdA: grossProfitA,
        rawUsdB: grossProfitB,
        pctA: grossMarginA,
        pctB: grossMarginB,
      },
      {
        category: 'Sales CAC',
        shortKey: 'Sales CAC',
        valA: metricMode === 'monetary' ? Math.round(currency === 'USD' ? cacA : cacA * USD_TO_BDT_RATE) : configA.cacPercent,
        valB: metricMode === 'monetary' ? Math.round(currency === 'USD' ? cacB : cacB * USD_TO_BDT_RATE) : configB.cacPercent,
        rawUsdA: cacA,
        rawUsdB: cacB,
        pctA: configA.cacPercent,
        pctB: configB.cacPercent,
      },
      {
        category: 'G&A Overheads',
        shortKey: 'Overheads',
        valA: metricMode === 'monetary' ? Math.round(currency === 'USD' ? overheadA : overheadA * USD_TO_BDT_RATE) : configA.overheadPercent,
        valB: metricMode === 'monetary' ? Math.round(currency === 'USD' ? overheadB : overheadB * USD_TO_BDT_RATE) : configB.overheadPercent,
        rawUsdA: overheadA,
        rawUsdB: overheadB,
        pctA: configA.overheadPercent,
        pctB: configB.overheadPercent,
      },
      {
        category: 'Net Operating Profit',
        shortKey: 'Net Profit',
        valA: metricMode === 'monetary' ? Math.round(currency === 'USD' ? netProfitA : netProfitA * USD_TO_BDT_RATE) : netMarginA,
        valB: metricMode === 'monetary' ? Math.round(currency === 'USD' ? netProfitB : netProfitB * USD_TO_BDT_RATE) : netMarginB,
        rawUsdA: netProfitA,
        rawUsdB: netProfitB,
        pctA: netMarginA,
        pctB: netMarginB,
      },
    ];
  }, [
    revA,
    revB,
    cogsA,
    cogsB,
    cogsPctA,
    cogsPctB,
    grossProfitA,
    grossProfitB,
    grossMarginA,
    grossMarginB,
    cacA,
    cacB,
    overheadA,
    overheadB,
    netProfitA,
    netProfitB,
    netMarginA,
    netMarginB,
    configA,
    configB,
    metricMode,
    currency,
  ]);

  // Delta computations
  const netMarginDelta = Number((netMarginA - netMarginB).toFixed(1));
  const netProfitDeltaUsd = netProfitA - netProfitB;
  const grossMarginDelta = Number((grossMarginA - grossMarginB).toFixed(1));
  const cacDiffPct = Number((configA.cacPercent - configB.cacPercent).toFixed(1));

  // Copy Investor Memo to clipboard
  const handleCopyMemo = () => {
    const memo = `SPENTA FINANCIAL SCENARIO COMPARISON MEMO
Tier: ${tier.code} - ${tier.name}
Model A: ${configA.name} (${configA.badge})
Model B: ${configB.name} (${configB.badge})

--- KEY FINANCIAL METRICS ---
Contract Revenue: ${formatMoney(revA)} (A) vs ${formatMoney(revB)} (B)
Direct COGS: ${formatMoney(cogsA)} [${cogsPctA}%] (A) vs ${formatMoney(cogsB)} [${cogsPctB}%] (B)
Gross Profit: ${formatMoney(grossProfitA)} [${grossMarginA}%] (A) vs ${formatMoney(grossProfitB)} [${grossMarginB}%] (B)
Sales CAC: ${formatMoney(cacA)} [${configA.cacPercent}%] (A) vs ${formatMoney(cacB)} [${configB.cacPercent}%] (B)
Net Operating Profit: ${formatMoney(netProfitA)} [${netMarginA}%] (A) vs ${formatMoney(netProfitB)} [${netMarginB}%] (B)

--- VARIANCE SUMMARY ---
Net Margin Spread: ${netMarginDelta > 0 ? '+' : ''}${netMarginDelta}%
Net Profit Delta: ${netProfitDeltaUsd > 0 ? '+' : ''}${formatMoney(netProfitDeltaUsd)}
Capital Payback Velocity: ${configA.paybackMonths} mo (A) vs ${configB.paybackMonths} mo (B)
3-Year Return Multiple: ${configA.projected3YrRoi} (A) vs ${configB.projected3YrRoi} (B)
`;
    navigator.clipboard.writeText(memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-10 max-w-7xl mx-auto backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: configA.color }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: configB.color }}
      />

      {/* Header & Controls Bar */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
              <GitCompare className="w-4 h-4 text-cyan-400" />
              ROI SCENARIO COMPARATOR
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">SIDE-BY-SIDE PARAMETRIC ANALYSIS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Model Trade-Off Visualizer
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Compare upside scalability vs. downside resilience side-by-side. Inspect how modular code reusability and partner acquisition channels impact margins relative to defensive enterprise buffers.
          </p>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Presets:</span>
          <button
            onClick={() => setPreset('aggressive', 'conservative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
              scenarioA === 'aggressive' && scenarioB === 'conservative'
                ? 'bg-gradient-to-r from-emerald-950/80 to-rose-950/80 text-white border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            Aggressive vs. Conservative
          </button>
          <button
            onClick={() => setPreset('aggressive', 'base')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
              scenarioA === 'aggressive' && scenarioB === 'base'
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            Aggressive vs. Base
          </button>
          <button
            onClick={() => setPreset('base', 'conservative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
              scenarioA === 'base' && scenarioB === 'conservative'
                ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            Base vs. Conservative
          </button>
        </div>
      </div>

      {/* Model Selection Toolbar */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 py-5 border-b border-slate-800/80 items-center">
        {/* Model A Selector (Left) */}
        <div className="md:col-span-4 p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: configA.color, boxShadow: `0 0 10px ${configA.color}` }}
            />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                MODEL A (LEFT)
              </div>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                {configA.name}
                <span className="text-[10px] font-normal text-slate-400">[{configA.badge}]</span>
              </div>
            </div>
          </div>
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            {(['aggressive', 'base', 'conservative'] as FinancialScenario[]).map((s) => (
              <button
                key={s}
                onClick={() => setScenarioA(s)}
                className={`px-2 py-1 text-[11px] font-mono font-bold rounded transition-all cursor-pointer ${
                  scenarioA === s
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s === 'aggressive' ? 'Aggr' : s === 'base' ? 'Base' : 'Cons'}
              </button>
            ))}
          </div>
        </div>

        {/* Center Swap & Tier Controls */}
        <div className="md:col-span-4 flex items-center justify-center gap-3">
          <button
            onClick={swapScenarios}
            title="Swap Model A and Model B"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Tier Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedTierId}
              onChange={(e) => setSelectedTierId(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono font-semibold py-2 pl-3 pr-8 rounded-lg cursor-pointer hover:border-slate-700 focus:outline-none focus:border-cyan-500"
            >
              {FINANCIAL_TIERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code}: {t.name} ({currency === 'USD' ? t.rangeUsd : t.rangeBdt})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mode Switcher ($ vs %) */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setMetricMode('monetary')}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded transition-all flex items-center gap-1 cursor-pointer ${
                metricMode === 'monetary'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              <span>{currency}</span>
            </button>
            <button
              onClick={() => setMetricMode('percentage')}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded transition-all flex items-center gap-1 cursor-pointer ${
                metricMode === 'percentage'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Percent className="w-3 h-3" />
              <span>% Rev</span>
            </button>
          </div>
        </div>

        {/* Model B Selector (Right) */}
        <div className="md:col-span-4 p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: configB.color, boxShadow: `0 0 10px ${configB.color}` }}
            />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                MODEL B (RIGHT)
              </div>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                {configB.name}
                <span className="text-[10px] font-normal text-slate-400">[{configB.badge}]</span>
              </div>
            </div>
          </div>
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            {(['aggressive', 'base', 'conservative'] as FinancialScenario[]).map((s) => (
              <button
                key={s}
                onClick={() => setScenarioB(s)}
                className={`px-2 py-1 text-[11px] font-mono font-bold rounded transition-all cursor-pointer ${
                  scenarioB === s
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s === 'aggressive' ? 'Aggr' : s === 'base' ? 'Base' : 'Cons'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Grouped Bar Chart */}
      <div className="relative z-10 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: configA.fillColor }} />
              <span>
                {configA.name} ({metricMode === 'monetary' ? formatMoney(revA) : '100%'} Base)
              </span>
            </div>
            <span className="text-slate-600 font-mono">vs</span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: configB.fillColor }} />
              <span>
                {configB.name} ({metricMode === 'monetary' ? formatMoney(revB) : '100%'} Base)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Evaluated Deal:</span>
            <span className="text-cyan-400 font-bold">
              {tier.code} · {tier.name}
            </span>
          </div>
        </div>

        {/* Responsive Recharts Container */}
        <div className="h-72 sm:h-80 w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800/90">
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={240}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 15, left: 10, bottom: 10 }}
              barGap={4}
              barCategoryGap="22%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="shortKey"
                stroke="#64748b"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  metricMode === 'monetary'
                    ? currency === 'USD'
                      ? val >= 1000
                        ? `$${Math.round(val / 1000)}k`
                        : `$${val}`
                      : val >= 1000000
                      ? `${(val / 1000000).toFixed(1)}M`
                      : `${Math.round(val / 1000)}k`
                    : `${val}%`
                }
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  const deltaMonetary = item.rawUsdA - item.rawUsdB;
                  const deltaPct = item.pctA - item.pctB;

                  return (
                    <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl font-mono text-xs max-w-xs z-50">
                      <div className="font-bold text-white mb-2 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                        <span>{item.category}</span>
                        <span className="text-[10px] text-slate-400">{tier.code}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: configA.fillColor }}
                            />
                            {configA.name}:
                          </span>
                          <span className="font-bold" style={{ color: configA.color }}>
                            {formatMoney(item.rawUsdA)} ({item.pctA}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: configB.fillColor }}
                            />
                            {configB.name}:
                          </span>
                          <span className="font-bold" style={{ color: configB.color }}>
                            {formatMoney(item.rawUsdB)} ({item.pctB}%)
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4 text-[11px]">
                          <span className="text-slate-400">Variance (A - B):</span>
                          <span
                            className={`font-bold ${
                              deltaMonetary >= 0
                                ? item.shortKey === 'Direct COGS' || item.shortKey === 'Sales CAC'
                                  ? 'text-rose-400'
                                  : 'text-emerald-400'
                                : item.shortKey === 'Direct COGS' || item.shortKey === 'Sales CAC'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {deltaMonetary >= 0 ? '+' : ''}
                            {formatMoney(deltaMonetary)} ({deltaPct >= 0 ? '+' : ''}
                            {deltaPct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="valA"
                name={configA.name}
                fill={configA.fillColor}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="valB"
                name={configB.name}
                fill={configB.fillColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Variance KPI Ribbon */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 py-4 border-t border-b border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            NET MARGIN SPREAD
          </div>
          <div
            className={`text-xl font-bold font-mono mt-0.5 ${
              netMarginDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netMarginDelta >= 0 ? '+' : ''}
            {netMarginDelta}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {netMarginA}% vs {netMarginB}% of Revenue
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            NET OPERATING PROFIT DELTA
          </div>
          <div
            className={`text-xl font-bold font-mono mt-0.5 ${
              netProfitDeltaUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netProfitDeltaUsd >= 0 ? '+' : ''}
            {formatMoney(netProfitDeltaUsd)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Per deal cashflow variance
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            SALES CAC EFFICIENCY
          </div>
          <div
            className={`text-xl font-bold font-mono mt-0.5 ${
              cacDiffPct <= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {cacDiffPct > 0 ? '+' : ''}
            {cacDiffPct}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {configA.cacPercent}% (A) vs {configB.cacPercent}% (B)
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            CAPITAL PAYBACK VELOCITY
          </div>
          <div className="text-xl font-bold font-mono mt-0.5 text-cyan-300">
            {configA.paybackMonths} mo vs {configB.paybackMonths} mo
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Break-even cycle delta
          </div>
        </div>
      </div>

      {/* 4 Trade-Off Deep Dive Analysis Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        {/* Card 1: Reusability & Delivery Margin */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              1. Modular Reusability vs. Custom Buffer
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Gross Margin: {grossMarginA}% vs {grossMarginB}%
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Aggressive Model</strong> reflects Spenta’s library of 4,000+ proprietary WebXR asset shaders, turnkey WebRTC streaming, and PrimeOCR pipelines, cutting direct engineering hours by 22%. In contrast, the <strong className="text-white">Conservative Model</strong> builds a +10% engineering buffer to absorb bespoke enterprise legacy integrations.
          </p>
        </div>

        {/* Card 2: CAC & Procurement Cycles */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              2. Sales Cycle Drag vs. Partner Inbound
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              CAC: {formatMoney(cacA)} vs {formatMoney(cacB)}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Aggressive</strong> factors warm partner inbound channels (e.g. global digital marketing agencies and SI subcontracting) capping CAC at 9.0%. <strong className="text-white">Conservative</strong> models prolonged 6–9 month RFP sales cycles requiring cold demos and executive travel (16.0% CAC).
          </p>
        </div>

        {/* Card 3: Cash Runway & GPU Reinvestment */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              3. Cash Flow Velocity & GPU Infra
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Net Cash: {formatMoney(netProfitA)} vs {formatMoney(netProfitB)}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Under <strong className="text-white">Aggressive</strong> volume, higher cash flow accelerates procurement of dedicated on-premise GPU clusters (NVIDIA L40S) to unlock high-margin SaaS MRR. <strong className="text-white">Conservative</strong> enforces strict 18-month cash preservation by pausing non-essential GPU hardware and auxiliary contractor spend.
          </p>
        </div>

        {/* Card 4: Investor Multiple & Downside Floor */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              4. Valuation Multiple & Downside Floor
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              3-Yr ROI: {configA.projected3YrRoi} vs {configB.projected3YrRoi}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Conservative</strong> provides an institutional safety floor—even under lengthened procurement and inflated costs, Spenta achieves positive net margins ({netMarginB}%). <strong className="text-white">Aggressive</strong> demonstrates software-like operating leverage, delivering a 4.8x projected 3-year return multiple for Seed SAFE investors.
          </p>
        </div>
      </div>

      {/* Footer Memo Action Bar */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Comparing <strong className="text-white">{configA.name}</strong> vs.{' '}
            <strong className="text-white">{configB.name}</strong> for Seed Financing Memo
          </span>
        </div>

        <button
          onClick={handleCopyMemo}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-sm text-xs font-mono"
        >
          {copiedMemo ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Comparison Memo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
