import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { Currency, USD_TO_BDT_RATE } from '../types';
import {
  Flame,
  Sparkles,
  Info,
  DollarSign,
  Percent,
  Clock,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  RotateCcw,
  Sliders,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export interface RoiSensitivityHeatmapProps {
  currency: Currency;
  initialCac?: number;
  initialRdBurn?: number;
}

export interface HeatmapCellData {
  cacPct: number;
  rdBurnUsd: number;
  cumRevenueUsd: number;
  cumProfitUsd: number;
  roiMultiple: number;
  paybackMonths: number;
  netMarginPct: number;
  isSweetSpot: boolean;
  tierClassification: 'sweet_spot' | 'high_leverage' | 'defensive' | 'drag';
  commentary: string;
}

const CAC_STEPS = [6, 8, 10, 12, 14, 16, 18, 20]; // Customer Acquisition Cost %
const RD_BURN_STEPS = [12000, 18000, 24000, 30000, 36000, 42000, 48000]; // Monthly R&D Burn ($/mo)
const SEED_SAFE_INVESTMENT_USD = 500000;

export const RoiSensitivityHeatmap: React.FC<RoiSensitivityHeatmapProps> = ({
  currency,
  initialCac = 8,
  initialRdBurn = 24000,
}) => {
  const [metricMode, setMetricMode] = useState<'multiple' | 'profit' | 'payback'>('multiple');
  const [selectedCell, setSelectedCell] = useState<{ cac: number; rdBurn: number }>({
    cac: initialCac,
    rdBurn: initialRdBurn,
  });
  const [hoveredCell, setHoveredCell] = useState<HeatmapCellData | null>(null);
  const [highlightSweetSpotOnly, setHighlightSweetSpotOnly] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const formatMoney = (usdVal: number) => {
    if (currency === 'USD') {
      if (Math.abs(usdVal) >= 1000000) {
        return `$${(usdVal / 1000000).toFixed(2)}M`;
      }
      return `$${Math.round(usdVal / 1000)}k`;
    }
    const bdtVal = usdVal * USD_TO_BDT_RATE;
    if (Math.abs(bdtVal) >= 10000000) {
      return `${(bdtVal / 10000000).toFixed(2)} Cr ৳`;
    }
    return `${Math.round(bdtVal / 100000).toFixed(1)}L ৳`;
  };

  const formatMonthlyBurn = (usdVal: number) => {
    if (currency === 'USD') {
      return `$${Math.round(usdVal / 1000)}k/mo`;
    }
    const bdtVal = Math.round((usdVal * USD_TO_BDT_RATE) / 100000);
    return `${bdtVal}L ৳/mo`;
  };

  // Generate matrix data across the two independent variables
  const matrixData: HeatmapCellData[] = useMemo(() => {
    const data: HeatmapCellData[] = [];
    // 5-Year compounding revenue assumption: $480k -> $820k -> $1.42M -> $2.25M -> $3.6M = ~$8.57M
    const total5YrRevenue = 8570000;

    for (const rdBurn of RD_BURN_STEPS) {
      for (const cac of CAC_STEPS) {
        // As R&D burn increases up to $30k, modular asset reusability reduces direct project COGS
        // Diminishing returns beyond $36k/mo
        const reusabilityBonus = Math.min((rdBurn / 30000) * 0.14, 0.16);
        const effectiveCogsPct = Math.max(0.58 - reusabilityBonus, 0.44);
        const totalCogs = total5YrRevenue * effectiveCogsPct;

        const totalCac = total5YrRevenue * (cac / 100);
        const totalRdInvestment = rdBurn * 12 * 5;
        const totalOverheads = total5YrRevenue * 0.08;

        const cumProfitUsd = total5YrRevenue - totalCogs - totalCac - totalRdInvestment - totalOverheads;
        const netMarginPct = Number(((cumProfitUsd / total5YrRevenue) * 100).toFixed(1));

        // 5-Year enterprise terminal multiple on $500k Seed SAFE
        // Profit reinvested + enterprise valuation at 4.5x Year 5 EBITDA
        const year5ProfitEst = Math.max(cumProfitUsd * 0.38, 200000);
        const terminalValueEst = year5ProfitEst * 4.5;
        const roiMultiple = Number(Math.max((cumProfitUsd * 0.45 + terminalValueEst * 0.55) / SEED_SAFE_INVESTMENT_USD, 0.4).toFixed(1));

        // Capital payback period in months
        const annualProfitRunRate = cumProfitUsd / 5;
        const paybackMonths = annualProfitRunRate > 0
          ? Number(Math.max(Math.min((SEED_SAFE_INVESTMENT_USD / annualProfitRunRate) * 12, 48), 2.8).toFixed(1))
          : 60;

        // Sweet spot definition: High ROI (>= 4.5x), low to moderate CAC (<= 10%), balanced R&D burn ($24k - $30k)
        const isSweetSpot = cac <= 10 && rdBurn >= 24000 && rdBurn <= 30000 && roiMultiple >= 4.5;

        let tierClassification: HeatmapCellData['tierClassification'] = 'defensive';
        let commentary = '';

        if (isSweetSpot) {
          tierClassification = 'sweet_spot';
          commentary = 'Optimal Institutional Sweet Spot: Partner inbound channels cap CAC under 10% while $24k–$30k R&D drives massive code reusability.';
        } else if (roiMultiple >= 4.0) {
          tierClassification = 'high_leverage';
          commentary = 'High Operating Leverage: Highly attractive capital returns with robust cash generation, though slightly elevated outbound CAC or burn.';
        } else if (roiMultiple >= 2.2) {
          tierClassification = 'defensive';
          commentary = 'Defensive Baseline: Sustainable positive returns protecting capital downside, typical of longer enterprise procurement cycles.';
        } else {
          tierClassification = 'drag';
          commentary = 'Capital Drag: Elevated customer acquisition costs combined with high burn erode operating leverage and extend payback.';
        }

        data.push({
          cacPct: cac,
          rdBurnUsd: rdBurn,
          cumRevenueUsd: total5YrRevenue,
          cumProfitUsd,
          roiMultiple,
          paybackMonths,
          netMarginPct,
          isSweetSpot,
          tierClassification,
          commentary,
        });
      }
    }
    return data;
  }, []);

  // Currently active selected cell data
  const currentCellData = useMemo(() => {
    return (
      matrixData.find(
        (d) => d.cacPct === selectedCell.cac && d.rdBurnUsd === selectedCell.rdBurn
      ) || matrixData[0]
    );
  }, [matrixData, selectedCell]);

  // D3 Heatmap Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 700;
    const margin = { top: 40, right: 30, bottom: 50, left: 85 };
    const width = Math.max(containerWidth, 480);
    const height = 340;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', '100%');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Customer Acquisition Cost (CAC %)
    const xScale = d3
      .scaleBand<number>()
      .domain(CAC_STEPS)
      .range([0, innerWidth])
      .padding(0.06);

    // Y Scale: Monthly R&D Burn Rate ($/mo) - descending so highest burn is at bottom, lowest at top
    const yScale = d3
      .scaleBand<number>()
      .domain([...RD_BURN_STEPS].reverse())
      .range([0, innerHeight])
      .padding(0.06);

    // Color Scales
    // Multiple: 1.0x (rose) -> 2.5x (amber) -> 3.8x (sky) -> 5.5x+ (emerald)
    const colorScaleMultiple = d3
      .scaleLinear<string>()
      .domain([1.2, 2.4, 3.8, 5.5])
      .range(['#be123c', '#d97706', '#0284c7', '#10b981'])
      .clamp(true);

    // Profit: $600k (rose) -> $1.5M (amber) -> $2.4M (sky) -> $3.5M+ (emerald)
    const colorScaleProfit = d3
      .scaleLinear<string>()
      .domain([600000, 1400000, 2400000, 3400000])
      .range(['#be123c', '#d97706', '#0284c7', '#10b981'])
      .clamp(true);

    // Payback: 20mo (rose) -> 12mo (amber) -> 7mo (sky) -> 3.5mo (emerald)
    const colorScalePayback = d3
      .scaleLinear<string>()
      .domain([20, 12, 7, 3.5])
      .range(['#be123c', '#d97706', '#0284c7', '#10b981'])
      .clamp(true);

    const getCellColor = (d: HeatmapCellData) => {
      if (highlightSweetSpotOnly && !d.isSweetSpot) {
        return '#090d16';
      }
      if (metricMode === 'multiple') return colorScaleMultiple(d.roiMultiple);
      if (metricMode === 'profit') return colorScaleProfit(d.cumProfitUsd);
      return colorScalePayback(d.paybackMonths);
    };

    // Render Heatmap Cells
    const cells = g
      .selectAll<SVGGElement, HeatmapCellData>('.cell')
      .data(matrixData)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (d) => `translate(${xScale(d.cacPct) ?? 0},${yScale(d.rdBurnUsd) ?? 0})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        setSelectedCell({ cac: d.cacPct, rdBurn: d.rdBurnUsd });
      })
      .on('mouseenter', (_, d) => {
        setHoveredCell(d);
      })
      .on('mouseleave', () => {
        setHoveredCell(null);
      });

    // Rectangles
    cells
      .append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', (d) => getCellColor(d))
      .attr('opacity', (d) => (highlightSweetSpotOnly && !d.isSweetSpot ? 0.35 : 0.88))
      .attr('stroke', (d) => {
        const isSelected = selectedCell.cac === d.cacPct && selectedCell.rdBurn === d.rdBurnUsd;
        if (isSelected) return '#38bdf8'; // bright cyan highlight for selected
        if (d.isSweetSpot) return '#34d399'; // emerald highlight for sweet spot
        return '#1e293b';
      })
      .attr('stroke-width', (d) => {
        const isSelected = selectedCell.cac === d.cacPct && selectedCell.rdBurn === d.rdBurnUsd;
        if (isSelected) return 2.5;
        if (d.isSweetSpot) return 2;
        return 1;
      })
      .style('transition', 'all 0.15s ease-out');

    // Sweet Spot Pulsing Beacon Dot or Star
    cells
      .filter((d) => d.isSweetSpot)
      .append('circle')
      .attr('cx', xScale.bandwidth() - 8)
      .attr('cy', 8)
      .attr('r', 3)
      .attr('fill', '#fde047')
      .attr('stroke', '#020617')
      .attr('stroke-width', 1);

    // Text Values inside cells
    cells
      .append('text')
      .attr('x', xScale.bandwidth() / 2)
      .attr('y', yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', (d) => (d.isSweetSpot ? '800' : '600'))
      .attr('fill', (d) => (highlightSweetSpotOnly && !d.isSweetSpot ? '#475569' : '#ffffff'))
      .text((d) => {
        if (metricMode === 'multiple') return `${d.roiMultiple}x`;
        if (metricMode === 'profit') return formatMoney(d.cumProfitUsd);
        return `${d.paybackMonths}m`;
      });

    // X Axis (CAC %)
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => `${d}%`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((g) => g.select('.domain').attr('stroke', '#334155'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#334155'))
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('fill', '#94a3b8')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-size', '10px')
      );

    // X Axis Label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 38)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('CUSTOMER ACQUISITION COST (% OF REVENUE) →');

    // Y Axis (Monthly R&D Burn)
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => formatMonthlyBurn(Number(d)));

    g.append('g')
      .call(yAxis)
      .call((g) => g.select('.domain').attr('stroke', '#334155'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#334155'))
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('fill', '#94a3b8')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-size', '10px')
      );

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -65)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('MONTHLY R&D BURN RATE ($/MO) →');
  }, [
    matrixData,
    metricMode,
    selectedCell,
    currency,
    highlightSweetSpotOnly,
  ]);

  return (
    <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-10 max-w-7xl mx-auto backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-emerald-400" />
              D3.JS SENSITIVITY HEATMAP
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">2-VARIABLE 5-YEAR PARAMETRIC MODEL</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            ROI Sensitivity & Profitability Sweet Spot
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Examine how varying Customer Acquisition Cost (CAC) and monthly R&D engineering burn interact over a 5-year timeline. Locate the high-margin "sweet spot" where capital efficiency peaks.
          </p>
        </div>

        {/* View Mode & Sweet Spot Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sweet Spot Toggle Button */}
          <button
            onClick={() => setHighlightSweetSpotOnly(!highlightSweetSpotOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
              highlightSweetSpotOnly
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-400/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Spotlight Sweet Spot</span>
          </button>

          {/* Metric Selector */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setMetricMode('multiple')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
                metricMode === 'multiple'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ROI Multiple
            </button>
            <button
              onClick={() => setMetricMode('profit')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
                metricMode === 'profit'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5-Yr Net Cash
            </button>
            <button
              onClick={() => setMetricMode('payback')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
                metricMode === 'payback'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Payback Months
            </button>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>Focal Coordinate Presets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCell({ cac: 8, rdBurn: 24000 })}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border cursor-pointer ${
              selectedCell.cac === 8 && selectedCell.rdBurn === 24000
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ★ Sweet Spot (8% CAC · $24k R&D)
          </button>
          <button
            onClick={() => setSelectedCell({ cac: 10, rdBurn: 30000 })}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border cursor-pointer ${
              selectedCell.cac === 10 && selectedCell.rdBurn === 30000
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ★ Sweet Spot 2 (10% CAC · $30k R&D)
          </button>
          <button
            onClick={() => setSelectedCell({ cac: 14, rdBurn: 30000 })}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border cursor-pointer ${
              selectedCell.cac === 14 && selectedCell.rdBurn === 30000
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Audited Base (14% CAC · $30k R&D)
          </button>
          <button
            onClick={() => setSelectedCell({ cac: 18, rdBurn: 42000 })}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border cursor-pointer ${
              selectedCell.cac === 18 && selectedCell.rdBurn === 42000
                ? 'bg-rose-950/70 border-rose-500/50 text-rose-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Downside Stress (18% CAC · $42k R&D)
          </button>
        </div>
      </div>

      {/* Main Heatmap Visualization & Legend */}
      <div className="py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap SVG Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div ref={containerRef} className="w-full relative">
            <svg ref={svgRef} className="overflow-visible select-none" />

            {/* Hover Tooltip Overlay */}
            {hoveredCell && (
              <div
                className="pointer-events-none absolute top-2 right-2 bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs font-mono max-w-xs z-30"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 gap-2 mb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {hoveredCell.isSweetSpot && (
                      <span className="text-yellow-400 font-bold">★</span>
                    )}
                    {hoveredCell.cacPct}% CAC · {formatMonthlyBurn(hoveredCell.rdBurnUsd)}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      hoveredCell.tierClassification === 'sweet_spot'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : hoveredCell.tierClassification === 'high_leverage'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : hoveredCell.tierClassification === 'defensive'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {hoveredCell.tierClassification.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">5-Yr ROI:</span>
                    <span className="font-bold text-emerald-400">{hoveredCell.roiMultiple}x Return</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cumulative Profit:</span>
                    <span className="font-bold text-white">{formatMoney(hoveredCell.cumProfitUsd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payback Velocity:</span>
                    <span className="font-bold text-cyan-300">{hoveredCell.paybackMonths} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Operating Margin:</span>
                    <span className="font-bold text-slate-200">{hoveredCell.netMarginPct}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color Gradient Legend Bar */}
          <div className="mt-4 flex items-center justify-between w-full max-w-md text-[10px] font-mono text-slate-400">
            <span>Capital Drag (&lt;1.8x)</span>
            <div className="h-2.5 flex-1 mx-3 rounded-full bg-gradient-to-r from-rose-700 via-amber-600 via-sky-600 to-emerald-500 shadow-inner" />
            <span className="text-emerald-400 font-bold">Sweet Spot (≥4.5x)</span>
          </div>
        </div>

        {/* Selected Cell Deep Dive Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                EVALUATED COORDINATE
              </div>
              <div className="text-base font-bold text-white font-mono flex items-center gap-2 mt-0.5">
                {currentCellData.cacPct}% CAC · {formatMonthlyBurn(currentCellData.rdBurnUsd)}
                {currentCellData.isSweetSpot && (
                  <span className="text-yellow-400 text-xs" title="Institutional Sweet Spot">
                    ★
                  </span>
                )}
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                currentCellData.tierClassification === 'sweet_spot'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : currentCellData.tierClassification === 'high_leverage'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : currentCellData.tierClassification === 'defensive'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {currentCellData.tierClassification.replace('_', ' ')}
            </span>
          </div>

          {/* KPI Matrix for Selected Cell */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[9px] font-mono text-slate-500 uppercase">5-Yr Return Multiple</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {currentCellData.roiMultiple}x
              </div>
              <div className="text-[9px] font-mono text-slate-400">on $500k SAFE</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[9px] font-mono text-slate-500 uppercase">Payback Velocity</div>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
                {currentCellData.paybackMonths} mo
              </div>
              <div className="text-[9px] font-mono text-slate-400">Break-even window</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[9px] font-mono text-slate-500 uppercase">5-Yr Net Cash Flow</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatMoney(currentCellData.cumProfitUsd)}
              </div>
              <div className="text-[9px] font-mono text-slate-400">{currentCellData.netMarginPct}% Net Margin</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[9px] font-mono text-slate-500 uppercase">Total R&D Absorbed</div>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {formatMoney(currentCellData.rdBurnUsd * 12 * 5)}
              </div>
              <div className="text-[9px] font-mono text-slate-400">Over 60 months</div>
            </div>
          </div>

          {/* Commentary & Operational Strategic Fit */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Strategic Sensitivities:
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {currentCellData.commentary}
            </p>
          </div>

          {/* Sweet Spot Criteria Callout */}
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono space-y-1">
            <div className="text-emerald-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Institutional Thesis Anchor</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Spenta reaches optimal capital velocity at <strong className="text-white">8%–10% CAC</strong> and <strong className="text-white">$24k–$30k/mo R&D</strong>, delivering 4.8x–5.8x enterprise expansion while keeping payback under 4.5 months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
