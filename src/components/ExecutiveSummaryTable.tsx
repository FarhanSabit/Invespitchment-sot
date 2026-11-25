import React, { useMemo, useState } from 'react';
import { motion, Variants } from 'motion/react';
import {
  ArrowUpDown,
  ArrowUpRight,
  Cpu,
  Database,
  Glasses,
  Layers,
  Layout,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { FUSION_LAYERS } from '../data/mockData';
import { FusionLayer } from '../types';

export interface ParsedLayerSummaryRow {
  level: number;
  code: string;
  id: string;
  shortTitle: string;
  fullTitle: string;
  domainGroup: 'cloud-app' | 'core-ai-xr' | 'edge-physical';
  primaryStack: string[];
  extraStackCount: number;
  latencyKpi: string;
  throughputKpi: string;
  uptimeSla: string;
  errorTolerance: string;
  protocolSummary: string;
  enterpriseImpact: string;
  endpointCount: number;
  complianceCount: number;
  color: string;
  iconName: string;
}

const iconMap: Record<string, React.ElementType> = {
  Layout,
  Database,
  Layers,
  Cpu,
  Zap,
  Glasses,
};

type TierFilter = 'all' | 'cloud-app' | 'core-ai-xr' | 'edge-physical';

/**
 * Pure SSOT parser transforming FUSION_LAYERS into condensed executive summary KPI rows.
 */
export function parseSsotSixLayerSummary(layers: FusionLayer[]): ParsedLayerSummaryRow[] {
  return layers.map((layer) => {
    const cleanTitle = layer.title.replace(/\s+Contracts$/i, '').trim();
    const domainGroup: ParsedLayerSummaryRow['domainGroup'] =
      layer.level >= 5 ? 'cloud-app' : layer.level >= 3 ? 'core-ai-xr' : 'edge-physical';

    return {
      level: layer.level,
      code: `L${layer.level}`,
      id: layer.id,
      shortTitle: cleanTitle,
      fullTitle: layer.title,
      domainGroup,
      primaryStack: layer.techStack.slice(0, 3),
      extraStackCount: Math.max(0, layer.techStack.length - 3),
      latencyKpi: layer.specs?.latency ?? 'N/A',
      throughputKpi: layer.specs?.throughput ?? 'N/A',
      uptimeSla: layer.specs?.uptimeSLA ?? '99.9% SLA',
      errorTolerance: layer.specs?.errorTolerance ?? 'Audited',
      protocolSummary: layer.specs?.protocol ?? 'Encrypted Bus',
      enterpriseImpact: layer.enterpriseImpact,
      endpointCount: layer.techDocs?.endpoints.length ?? 0,
      complianceCount: layer.techDocs?.complianceMapping.length ?? 0,
      color: layer.color,
      iconName: layer.iconName,
    };
  });
}

const tableContainerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const ExecutiveSummaryTable: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [domainFilter, setDomainFilter] = useState<TierFilter>('all');

  const parsedRows = useMemo(() => parseSsotSixLayerSummary(FUSION_LAYERS), []);

  const aggregateStats = useMemo(() => {
    const totalContracts = parsedRows.reduce((acc, r) => acc + r.endpointCount, 0);
    const totalComplianceControls = parsedRows.reduce((acc, r) => acc + r.complianceCount, 0);
    const totalTechnologies = FUSION_LAYERS.reduce((acc, l) => acc + l.techStack.length, 0);
    return {
      layerCount: parsedRows.length,
      totalContracts,
      totalComplianceControls,
      totalTechnologies,
    };
  }, [parsedRows]);

  const visibleRows = useMemo(() => {
    const filtered =
      domainFilter === 'all'
        ? parsedRows
        : parsedRows.filter((row) => row.domainGroup === domainFilter);

    return [...filtered].sort((a, b) =>
      sortOrder === 'desc' ? b.level - a.level : a.level - b.level
    );
  }, [parsedRows, domainFilter, sortOrder]);

  const handleInspectLayer = (level: number) => {
    window.dispatchEvent(
      new CustomEvent('spenta:select-fusion-layer', { detail: { level } })
    );

    const target = document.getElementById('fusion-stack');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.add(
        'ring-2',
        'ring-cyan-400',
        'ring-offset-4',
        'ring-offset-[#05070B]',
        'transition-all',
        'duration-700'
      );
      setTimeout(() => {
        target.classList.remove(
          'ring-2',
          'ring-cyan-400',
          'ring-offset-4',
          'ring-offset-[#05070B]'
        );
      }, 3000);
    }
  };

  return (
    <motion.div
      id="hero-executive-summary-table"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={tableContainerVariants}
      className="mt-12 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-2xl overflow-hidden"
    >
      {/* Top Executive Header & Aggregate SSOT Strip */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/50">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-cyan-400">Executive Summary Table</span>
            <span aria-hidden="true">·</span>
            <span>Six-Layer Architecture SSOT</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-300">
              {aggregateStats.layerCount} Layers · {aggregateStats.totalContracts} Contracts ·{' '}
              {aggregateStats.totalTechnologies} Core Technologies ·{' '}
              {aggregateStats.totalComplianceControls} Compliance Controls
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-display tracking-tight">
            Six-Layer Fusion Architecture KPI Overview
          </h2>
        </div>

        {/* Interactive Domain Filters & Stack Order Toggle */}
        <div className="flex flex-wrap items-center gap-2" data-print-hide="true">
          <div
            role="tablist"
            aria-label="Filter architecture layers"
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800"
          >
            {(
              [
                { id: 'all', label: 'All (6)' },
                { id: 'cloud-app', label: 'Delivery & Vector (L5–L6)' },
                { id: 'core-ai-xr', label: 'AI & Spatial (L3–L4)' },
                { id: 'edge-physical', label: 'Edge & Ingest (L1–L2)' },
              ] as const
            ).map((tab) => {
              const active = domainFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setDomainFilter(tab.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Toggle stack inspection order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sortOrder === 'desc' ? 'L6 → L1' : 'L1 → L6'}</span>
          </button>
        </div>
      </div>

      {/* Desktop Grid Header */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-2.5 border-b border-slate-800/70 bg-slate-900/30 text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
        <div className="col-span-3">Layer & Domain</div>
        <div className="col-span-3">Core Stack</div>
        <div className="col-span-2">Latency KPI</div>
        <div className="col-span-2">Throughput & SLA</div>
        <div className="col-span-2 text-right">Enterprise Outcome</div>
      </div>

      {/* Condensed Grid Rows */}
      <div className="divide-y divide-slate-800/70">
        {visibleRows.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            No architecture layers match the selected filter.
            <button
              type="button"
              onClick={() => setDomainFilter('all')}
              className="ml-2 text-cyan-400 underline hover:text-cyan-300 cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          visibleRows.map((row) => {
            const Icon = iconMap[row.iconName] || Layers;

            return (
              <motion.button
                key={row.id}
                type="button"
                variants={rowVariants}
                onClick={() => handleInspectLayer(row.level)}
                className="w-full text-left px-5 py-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center hover:bg-slate-900/60 transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                {/* Col 1: Layer Code + Architecture Domain */}
                <div className="lg:col-span-3 flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 font-mono text-xs font-bold"
                    style={{
                      color: row.color,
                      backgroundColor: `${row.color}14`,
                      borderColor: `${row.color}40`,
                    }}
                  >
                    {row.code}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className="w-3.5 h-3.5 shrink-0 hidden sm:inline"
                        style={{ color: row.color }}
                      />
                      <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {row.shortTitle}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      {row.protocolSummary}
                    </div>
                  </div>
                </div>

                {/* Col 2: Core Stack (Unboxed typographic list) */}
                <div className="lg:col-span-3 min-w-0">
                  <div className="text-xs text-slate-200 font-medium truncate">
                    {row.primaryStack.join(' · ')}
                    {row.extraStackCount > 0 && (
                      <span className="text-slate-400 font-mono">
                        {' '}
                        +{row.extraStackCount}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                    {row.endpointCount} API Contracts · {row.complianceCount} Compliance Standards
                  </div>
                </div>

                {/* Col 3: Latency KPI */}
                <div className="lg:col-span-2 flex lg:block items-baseline justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400 lg:hidden">Latency:</span>
                  <div>
                    <div className="text-sm font-mono font-bold text-cyan-300 tabular-nums">
                      {row.latencyKpi}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 tabular-nums truncate">
                      Tol: {row.errorTolerance}
                    </div>
                  </div>
                </div>

                {/* Col 4: Throughput & Uptime SLA */}
                <div className="lg:col-span-2 flex lg:block items-baseline justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400 lg:hidden">Throughput:</span>
                  <div>
                    <div className="text-xs font-mono font-semibold text-slate-100 tabular-nums truncate">
                      {row.throughputKpi}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 tabular-nums flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      <span className="truncate">{row.uptimeSla}</span>
                    </div>
                  </div>
                </div>

                {/* Col 5: Enterprise Impact & Jump Affordance */}
                <div className="lg:col-span-2 flex items-center justify-between lg:justify-end gap-2 min-w-0">
                  <span className="text-xs text-slate-300 lg:text-right line-clamp-2 leading-snug">
                    {row.enterpriseImpact}
                  </span>
                  <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Footer Strip Linking to Full Technical Deep-Dive */}
      <div className="px-5 py-3 bg-slate-900/40 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <span>
          Source: Live Single Source of Truth (<span className="font-mono text-slate-300">FUSION_LAYERS</span>)
        </span>
        <button
          type="button"
          onClick={() => handleInspectLayer(3)}
          className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <span>Inspect Full API Contracts &amp; SDK Schemas</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
