import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Currency, USD_TO_BDT_RATE } from '../types';
import { Sliders, TrendingUp, Cpu, Megaphone, RotateCcw, Sparkles, DollarSign, Percent } from 'lucide-react';

interface RoiSensitivitySliderProps {
  scenario: 'conservative' | 'base' | 'aggressive';
  baselineRevenueUsd: number;
  baseCogsPercent: number;
  baseCacPercent: number;
  baseOverheadPercent: number;
  currency: Currency;
  tierName: string;
}

interface YearProjection {
  year: number;
  label: string;
  baselineRoi: number;
  adjustedRoi: number;
  cumulativeProfitUsd: number;
  annualRevenueUsd: number;
}

export const RoiSensitivitySlider: React.FC<RoiSensitivitySliderProps> = ({
  scenario,
  baselineRevenueUsd,
  baseCogsPercent,
  baseCacPercent,
  baseOverheadPercent,
  currency,
  tierName,
}) => {
  // Sliders represent percentage delta or allocation adjustment:
  // marketingSpendDelta: -30% to +50% relative change in Marketing/CAC spend
  // rdCostDelta: -25% to +40% relative change in R&D / Engineering spend
  const [marketingDelta, setMarketingDelta] = useState<number>(0);
  const [rdDelta, setRdDelta] = useState<number>(0);
  const [activeFocus, setActiveFocus] = useState<'both' | 'marketing' | 'rd'>('both');
  const [hoveredYear, setHoveredYear] = useState<YearProjection | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const formatMoney = (usdVal: number) => {
    if (currency === 'USD') {
      return `$${Math.round(usdVal).toLocaleString()}`;
    } else {
      return `${Math.round(usdVal * USD_TO_BDT_RATE).toLocaleString()} ৳`;
    }
  };

  // Compute 5-year projections for both Baseline and Adjusted parameters
  const projectionData: YearProjection[] = useMemo(() => {
    const scenarioGrowthRate =
      scenario === 'aggressive' ? 0.58 : scenario === 'base' ? 0.42 : 0.26;
    const annualDealsMultiplier =
      baselineRevenueUsd < 5000 ? 36 : baselineRevenueUsd < 35000 ? 14 : 6;
    const seedInvestmentAnchor = Math.max(baselineRevenueUsd * annualDealsMultiplier * 0.45, 50000);

    // Marketing efficiency curve: moderate increase in marketing accelerates top-line deal velocity,
    // while excessive spend experiences diminishing marginal returns.
    const mktVelocityBoost =
      marketingDelta >= 0
        ? Math.pow(marketingDelta / 50, 0.75) * 0.28
        : (marketingDelta / 30) * 0.22;

    // R&D efficiency curve: increased R&D raises year 1-2 costs slightly,
    // but compounds modular code reusability and reduces direct COGS in years 2-5.
    const rdReusabilityFactor = (rdDelta / 40) * 0.18;

    const years: YearProjection[] = [];
    let cumBaseProfit = 0;
    let cumAdjProfit = 0;

    for (let yr = 1; yr <= 5; yr++) {
      const timeCompound = Math.pow(1 + scenarioGrowthRate, yr - 1);
      const baseAnnualRev = baselineRevenueUsd * annualDealsMultiplier * timeCompound;

      // Baseline profit
      const baseNetMargin = Math.max(
        0.08,
        (100 - baseCogsPercent - baseCacPercent - baseOverheadPercent) / 100
      );
      const baseAnnualProfit = baseAnnualRev * baseNetMargin + yr * 0.015 * baseAnnualRev;
      cumBaseProfit += baseAnnualProfit;

      // Adjusted revenue with marketing velocity & R&D product-market expansion
      const adjGrowthCompound = Math.pow(
        1 + scenarioGrowthRate + mktVelocityBoost * 0.35 + (yr >= 2 ? rdReusabilityFactor * 0.3 : 0),
        yr - 1
      );
      const adjAnnualRev =
        baselineRevenueUsd *
        annualDealsMultiplier *
        (1 + mktVelocityBoost * 0.45) *
        adjGrowthCompound;

      // Adjusted CAC % & R&D / COGS %
      const effectiveCacPct = Math.max(4, baseCacPercent * (1 + marketingDelta / 100));
      // In Y1 R&D spend adds to cost, by Y3-Y5 higher R&D lowers COGS via reusable WebXR & AI SDKs
      const rdCogsImpact =
        yr === 1
          ? (rdDelta / 100) * 8
          : (rdDelta / 100) * (6 - yr * 4.2);
      const effectiveCogsPct = Math.min(72, Math.max(35, baseCogsPercent + rdCogsImpact));

      const adjNetMargin = Math.max(
        0.05,
        (100 - effectiveCogsPct - effectiveCacPct - baseOverheadPercent) / 100
      );
      const adjAnnualProfit = adjAnnualRev * adjNetMargin;
      cumAdjProfit += adjAnnualProfit;

      const baselineRoi = Number(((cumBaseProfit / seedInvestmentAnchor) * 100).toFixed(1));
      const adjustedRoi = Number(((cumAdjProfit / seedInvestmentAnchor) * 100).toFixed(1));

      years.push({
        year: yr,
        label: `Year ${yr}`,
        baselineRoi,
        adjustedRoi,
        cumulativeProfitUsd: cumAdjProfit,
        annualRevenueUsd: adjAnnualRev,
      });
    }

    return years;
  }, [
    scenario,
    baselineRevenueUsd,
    baseCogsPercent,
    baseCacPercent,
    baseOverheadPercent,
    marketingDelta,
    rdDelta,
  ]);

  const year5Data = projectionData[projectionData.length - 1];
  const roiDelta = Number((year5Data.adjustedRoi - year5Data.baselineRoi).toFixed(1));

  // Render D3 Area Chart whenever projectionData changes
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 640;
    const height = 270;
    const margin = { top: 24, right: 28, bottom: 34, left: 54 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Definitions for gradients
    const defs = svg.append('defs');

    // Adjusted ROI Gradient (Cyan/Emerald)
    const adjGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-adj-roi-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    adjGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', roiDelta >= 0 ? '#10b981' : '#f43f5e')
      .attr('stop-opacity', 0.45);
    adjGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', roiDelta >= 0 ? '#06b6d4' : '#f43f5e')
      .attr('stop-opacity', 0.02);

    // Baseline ROI Gradient (Slate/Indigo)
    const baseGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-base-roi-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    baseGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#6366f1')
      .attr('stop-opacity', 0.25);
    baseGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#6366f1')
      .attr('stop-opacity', 0.0);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([1, 5])
      .range([0, innerWidth]);

    const maxRoi = Math.max(
      d3.max(projectionData, (d) => Math.max(d.baselineRoi, d.adjustedRoi)) || 500,
      300
    );

    const yScale = d3
      .scaleLinear()
      .domain([0, maxRoi * 1.12])
      .range([innerHeight, 0]);

    // Horizontal Grid Lines
    const yTicks = yScale.ticks(5);
    g.selectAll('.grid-line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat((d) => `YR ${d}`);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '10px');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}%`);
    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '10px');

    // Area generators
    const baselineArea = d3
      .area<YearProjection>()
      .x((d) => xScale(d.year))
      .y0(innerHeight)
      .y1((d) => yScale(d.baselineRoi))
      .curve(d3.curveMonotoneX);

    const adjustedArea = d3
      .area<YearProjection>()
      .x((d) => xScale(d.year))
      .y0(innerHeight)
      .y1((d) => yScale(d.adjustedRoi))
      .curve(d3.curveMonotoneX);

    // Line generators
    const baselineLine = d3
      .line<YearProjection>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.baselineRoi))
      .curve(d3.curveMonotoneX);

    const adjustedLine = d3
      .line<YearProjection>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.adjustedRoi))
      .curve(d3.curveMonotoneX);

    // Draw Baseline Area & Dashed Line
    g.append('path')
      .datum(projectionData)
      .attr('fill', 'url(#d3-base-roi-gradient)')
      .attr('d', baselineArea);

    g.append('path')
      .datum(projectionData)
      .attr('fill', 'none')
      .attr('stroke', '#818cf8')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,4')
      .attr('d', baselineLine);

    // Draw Adjusted Area & Solid Line
    g.append('path')
      .datum(projectionData)
      .attr('fill', 'url(#d3-adj-roi-gradient)')
      .attr('d', adjustedArea);

    const activeStrokeColor = roiDelta >= 0 ? '#22d3ee' : '#fb7185';

    g.append('path')
      .datum(projectionData)
      .attr('fill', 'none')
      .attr('stroke', activeStrokeColor)
      .attr('stroke-width', 3)
      .attr('d', adjustedLine);

    // Data nodes & interactive hover targets
    projectionData.forEach((d) => {
      const cx = xScale(d.year);
      const cyBase = yScale(d.baselineRoi);
      const cyAdj = yScale(d.adjustedRoi);

      // Vertical connector line between baseline and adjusted
      g.append('line')
        .attr('x1', cx)
        .attr('x2', cx)
        .attr('y1', cyBase)
        .attr('y2', cyAdj)
        .attr('stroke', d.adjustedRoi >= d.baselineRoi ? '#34d399' : '#f43f5e')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.7);

      // Baseline node
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cyBase)
        .attr('r', 3.5)
        .attr('fill', '#0f172a')
        .attr('stroke', '#818cf8')
        .attr('stroke-width', 2);

      // Adjusted node
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cyAdj)
        .attr('r', 5.5)
        .attr('fill', '#020617')
        .attr('stroke', activeStrokeColor)
        .attr('stroke-width', 2.5)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setHoveredYear(d))
        .on('mouseleave', () => setHoveredYear(null));

      // Value label above each year node
      g.append('text')
        .attr('x', cx)
        .attr('y', cyAdj - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e2e8f0')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '10px')
        .style('font-weight', '700')
        .text(`${d.adjustedRoi}%`);
    });
  }, [projectionData, roiDelta]);

  const handleReset = () => {
    setMarketingDelta(0);
    setRdDelta(0);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 mb-10 backdrop-blur-md relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>D3.JS INTERACTIVE SENSITIVITY ENGINE // 5-YEAR ROI IMPACT</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-heading mt-1">
            ROI Sensitivity Slider (Marketing Spend & R&D Costs)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamically stress-test customer acquisition velocity and modular R&D code reusability for{' '}
            <strong className="text-slate-200">{tierName}</strong> under the{' '}
            <strong className="text-cyan-300 uppercase">{scenario}</strong> scenario.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setActiveFocus('both')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeFocus === 'both'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => {
                setActiveFocus('marketing');
                setRdDelta(0);
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeFocus === 'marketing'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Marketing Focus
            </button>
            <button
              onClick={() => {
                setActiveFocus('rd');
                setMarketingDelta(0);
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeFocus === 'rd'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              R&D Focus
            </button>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[10px] font-mono font-bold transition-all cursor-pointer"
            title="Reset Sliders to Audited Baseline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Left Sliders (5 cols) + Right D3 Area Chart (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Marketing Spend Slider */}
          <div
            className={`p-4 rounded-xl bg-slate-950/90 border transition-all space-y-3 ${
              activeFocus === 'rd'
                ? 'border-slate-800/60 opacity-60'
                : 'border-amber-500/30 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white">
                    Marketing & GTM Spend Delta
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Effective CAC:{' '}
                    <span className="text-amber-300 font-bold">
                      {Math.max(4, baseCacPercent * (1 + marketingDelta / 100)).toFixed(1)}%
                    </span>{' '}
                    (Base: {baseCacPercent}%)
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                  marketingDelta > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : marketingDelta < 0
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {marketingDelta > 0 ? `+${marketingDelta}%` : `${marketingDelta}%`}
              </span>
            </div>

            <input
              type="range"
              min={-30}
              max={50}
              step={5}
              value={marketingDelta}
              onChange={(e) => {
                setActiveFocus('both');
                setMarketingDelta(Number(e.target.value));
              }}
              aria-label="Marketing Spend Sensitivity Slider"
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-30% (Organic Inbound)</span>
              <span>0% Baseline</span>
              <span>+50% (Blitzscale GTM)</span>
            </div>
          </div>

          {/* R&D Cost Slider */}
          <div
            className={`p-4 rounded-xl bg-slate-950/90 border transition-all space-y-3 ${
              activeFocus === 'marketing'
                ? 'border-slate-800/60 opacity-60'
                : 'border-purple-500/30 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white">
                    R&D & Neural Stack Allocation
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    5-Yr SDK Reusability Impact:{' '}
                    <span className="text-purple-300 font-bold">
                      {rdDelta >= 0 ? `-${((rdDelta / 40) * 18).toFixed(1)}% COGS` : `+${Math.abs((rdDelta / 40) * 12).toFixed(1)}% COGS`}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                  rdDelta > 0
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : rdDelta < 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {rdDelta > 0 ? `+${rdDelta}%` : `${rdDelta}%`}
              </span>
            </div>

            <input
              type="range"
              min={-25}
              max={40}
              step={5}
              value={rdDelta}
              onChange={(e) => {
                setActiveFocus('both');
                setRdDelta(Number(e.target.value));
              }}
              aria-label="R&D Cost Sensitivity Slider"
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-25% (Maintenance)</span>
              <span>0% Baseline</span>
              <span>+40% (Deep IP Automation)</span>
            </div>
          </div>

          {/* 5-Year ROI Readout KPI Strip */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase">5-Yr Base ROI</div>
              <div className="text-lg font-black font-mono text-indigo-300 mt-0.5">
                {year5Data.baselineRoi}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40">
              <div className="text-[10px] font-mono text-cyan-300 uppercase">5-Yr Adjusted ROI</div>
              <div className="text-lg font-black font-mono text-white mt-0.5">
                {year5Data.adjustedRoi}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Net ROI Delta</div>
              <div
                className={`text-lg font-black font-mono mt-0.5 ${
                  roiDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {roiDelta >= 0 ? `+${roiDelta}%` : `${roiDelta}%`}
              </div>
            </div>
          </div>
        </div>

        {/* Right D3.js Area Chart */}
        <div className="lg:col-span-7">
          <div
            ref={containerRef}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[10px] font-mono">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                D3.JS 5-YEAR CUMULATIVE ROI TRAJECTORY (AREA CHART)
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-0.5 bg-indigo-400 inline-block border-b border-dashed border-indigo-400" />
                  Baseline Trajectory
                </span>
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <span
                    className={`w-3 h-2 rounded-xs inline-block ${
                      roiDelta >= 0 ? 'bg-cyan-400' : 'bg-rose-400'
                    }`}
                  />
                  Sensitivity Adjusted
                </span>
              </div>
            </div>

            <svg ref={svgRef} className="w-full h-[270px] overflow-visible" />

            {/* Interactive Year Details Footer */}
            <div className="mt-2 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              {hoveredYear ? (
                <>
                  <span className="text-cyan-300 font-bold">
                    {hoveredYear.label} Snapshot: Adjusted ROI {hoveredYear.adjustedRoi}% (vs{' '}
                    {hoveredYear.baselineRoi}% Base)
                  </span>
                  <span className="text-emerald-400 font-bold">
                    5-Yr Cumulative Operating Profit: {formatMoney(hoveredYear.cumulativeProfitUsd)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-400">
                    Hover any year node to inspect cumulative net profit & sensitivity spread
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Yr 5 Cumulative Profit: {formatMoney(year5Data.cumulativeProfitUsd)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
