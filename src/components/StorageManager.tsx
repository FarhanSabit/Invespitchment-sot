import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HardDrive,
  Database,
  Download,
  Search,
  X,
  Plus,
  Trash2,
  Play,
  Layers,
  CheckCircle2,
  RefreshCw,
  WifiOff,
  Camera,
  PieChart,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { useStack } from '../context/StackProvider';
import { SavedScenarioRecord, StorageTypeBreakdown } from '../services/LocalPersistenceService';
import { FINANCIAL_TIERS } from '../data/mockData';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const StorageManager: React.FC = () => {
  const {
    isStorageManagerOpen,
    closeStorageManager,
    storageInitialTab,
    connectionState,
    storageEngine,
    savedScenarios,
    workspaceSnapshots,
    storageBreakdown,
    currentWorkspace,
    forceSync,
    saveScenario,
    deleteScenario,
    saveCurrentWorkspaceSnapshot,
    deleteWorkspaceSnapshot,
    exportVaultData,
    resetVault,
    applySavedScenario,
    restoreWorkspaceSnapshot,
  } = useStack();

  const [activeTab, setActiveTab] = useState<'vault' | 'breakdown'>('vault');
  const [scenarioSearchQuery, setScenarioSearchQuery] = useState<string>('');
  const [newScenarioName, setNewScenarioName] = useState<string>('');
  const [newSnapshotName, setNewSnapshotName] = useState<string>('');
  const [selectedTierCode, setSelectedTierCode] = useState<string>('T4');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isStorageManagerOpen) {
      setActiveTab(storageInitialTab);
      setActionMessage(null);
    }
  }, [isStorageManagerOpen, storageInitialTab]);

  const filteredScenarios = useMemo(() => {
    const query = scenarioSearchQuery.trim().toLowerCase();
    if (!query) return savedScenarios;
    return savedScenarios.filter((item) => item.name.toLowerCase().includes(query));
  }, [savedScenarios, scenarioSearchQuery]);

  if (!isStorageManagerOpen) return null;

  const showToastMessage = (msg: string) => {
    setActionMessage(msg);
    window.setTimeout(() => setActionMessage(null), 3200);
  };

  const handleExportData = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportVaultData();
      showToastMessage('JSON backup exported with all saved scenarios and workspace snapshots.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveCurrentScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    const tier = FINANCIAL_TIERS.find((t) => t.code === selectedTierCode) || FINANCIAL_TIERS[3] || FINANCIAL_TIERS[0];
    const scenarioLabel =
      newScenarioName.trim() ||
      `${currentWorkspace.scenario.toUpperCase()} · ${tier.code} (${currentWorkspace.currency})`;

    await saveScenario({
      name: scenarioLabel,
      scenario: currentWorkspace.scenario,
      tierCode: tier.code,
      tierName: tier.name,
      currency: currentWorkspace.currency,
      baselineUsd: tier.baselineUsd,
      grossMarginPercent: tier.grossMarginPercent,
      netMarginPercent: tier.netMarginPercent,
      projectedFiveYearRoiPercent:
        currentWorkspace.scenario === 'aggressive'
          ? 615
          : currentWorkspace.scenario === 'conservative'
          ? 295
          : 450,
      notes: `Captured from live ${currentWorkspace.globalViewMode} session.`,
    });
    setNewScenarioName('');
    showToastMessage(`Saved scenario "${scenarioLabel}" to IndexedDB.`);
  };

  const handleCaptureSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await saveCurrentWorkspaceSnapshot(newSnapshotName);
    setNewSnapshotName('');
    showToastMessage(`Captured snapshot "${created.name}".`);
  };

  const getAccentClasses = (accent: StorageTypeBreakdown['accent']) => {
    switch (accent) {
      case 'cyan':
        return {
          bar: 'bg-cyan-400',
          badge: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300',
          border: 'border-cyan-500/30',
        };
      case 'indigo':
        return {
          bar: 'bg-indigo-400',
          badge: 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300',
          border: 'border-indigo-500/30',
        };
      case 'emerald':
        return {
          bar: 'bg-emerald-400',
          badge: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
          border: 'border-emerald-500/30',
        };
      case 'amber':
        return {
          bar: 'bg-amber-400',
          badge: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
          border: 'border-amber-500/30',
        };
    }
  };

  const scenarioBadgeClass = (scenario: SavedScenarioRecord['scenario']) => {
    if (scenario === 'aggressive') return 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
    if (scenario === 'conservative') return 'bg-amber-950/70 border-amber-500/40 text-amber-300';
    return 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300';
  };

  return (
    <AnimatePresence>
      <div
        id="storage-manager-backdrop"
        className="fixed inset-0 z-[92] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md no-print"
        onClick={closeStorageManager}
      >
        <motion.div
          id="storage-manager-modal"
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="storage-manager-title"
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#05070B] border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 text-slate-100 overflow-hidden"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/10 blur-[120px] pointer-events-none" />

          {/* Modal Header */}
          <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800/80 bg-[#070A10]/90">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                  <span>Offline Persistence & App Vault</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{storageEngine === 'indexeddb' ? 'IndexedDB Active' : 'LocalStorage Fallback'}</span>
                </div>
                <h2 id="storage-manager-title" className="text-lg sm:text-xl font-bold text-white font-display">
                  Storage Manager & Scenario Vault
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Force Sync Quick Trigger */}
              <button
                type="button"
                onClick={() => void forceSync()}
                disabled={connectionState === 'syncing'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                {connectionState === 'offline' ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-cyan-400 ${
                      connectionState === 'syncing' ? 'animate-spin' : ''
                    }`}
                  />
                )}
                <span>{connectionState === 'syncing' ? 'Syncing...' : 'Force Sync'}</span>
              </button>

              {/* Export Data JSON Backup Button */}
              <button
                type="button"
                id="storage-export-data-btn"
                onClick={() => void handleExportData()}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
                <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
              </button>

              <button
                type="button"
                onClick={closeStorageManager}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                aria-label="Close Storage Manager"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-navigation & Telemetry Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/80 bg-slate-950/60">
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                id="storage-tab-vault-btn"
                onClick={() => setActiveTab('vault')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'vault'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>App Vault ({savedScenarios.length + workspaceSnapshots.length})</span>
              </button>
              <button
                type="button"
                id="storage-tab-breakdown-btn"
                onClick={() => setActiveTab('breakdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'breakdown'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Storage Breakdown ({formatBytes(storageBreakdown.totalBytes)})</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>
                Total Cached:{' '}
                <strong className="text-white tabular-nums">
                  {formatBytes(storageBreakdown.totalBytes)}
                </strong>
              </span>
              {storageBreakdown.largestConsumerLabel && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300">
                  <span>Top Consumer:</span>
                  <strong>{storageBreakdown.largestConsumerLabel}</strong>
                </span>
              )}
            </div>
          </div>

          {actionMessage && (
            <div className="mx-5 mt-3 px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === 'vault' ? (
              <>
                {/* Search Input & Quick Capture Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Scenario Search Input */}
                  <div className="lg:col-span-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <label
                      htmlFor="app-vault-search-input"
                      className="flex items-center justify-between text-xs font-mono text-slate-300 uppercase tracking-wider"
                    >
                      <span>Search Saved Scenarios</span>
                      <span className="text-[11px] text-cyan-400 tabular-nums">
                        {filteredScenarios.length} of {savedScenarios.length} matching
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        id="app-vault-search-input"
                        type="text"
                        value={scenarioSearchQuery}
                        onChange={(e) => setScenarioSearchQuery(e.target.value)}
                        placeholder="Find scenarios by name (e.g. Aggressive, T4, Base)..."
                        className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500/60 text-xs font-mono text-white placeholder:text-slate-500 outline-none transition-colors"
                      />
                      {scenarioSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setScenarioSearchQuery('')}
                          className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer"
                          aria-label="Clear scenario search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Save Current Scenario Form */}
                  <form
                    onSubmit={(e) => void handleSaveCurrentScenario(e)}
                    className="lg:col-span-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300 uppercase tracking-wider">
                      <span>Save Active Scenario</span>
                      <span className="text-[10px] text-emerald-400">
                        {currentWorkspace.scenario.toUpperCase()} · {currentWorkspace.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTierCode}
                        onChange={(e) => setSelectedTierCode(e.target.value)}
                        aria-label="Select Tier for Scenario"
                        className="px-2 py-2 rounded-lg bg-slate-950 border border-slate-700/80 text-xs font-mono text-cyan-300 outline-none shrink-0"
                      >
                        {FINANCIAL_TIERS.map((tier) => (
                          <option key={tier.id} value={tier.code}>
                            {tier.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newScenarioName}
                        onChange={(e) => setNewScenarioName(e.target.value)}
                        placeholder="Custom scenario name..."
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500/60 text-xs font-mono text-white placeholder:text-slate-500 outline-none"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Saved Scenarios List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Saved Financial Scenarios</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      Click Apply to load scenario & currency into Unit Economics
                    </span>
                  </div>

                  {filteredScenarios.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs font-mono text-slate-400">
                      {scenarioSearchQuery
                        ? `No saved scenarios match "${scenarioSearchQuery}".`
                        : 'No scenarios stored yet. Use "Save Active Scenario" above to persist one offline.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredScenarios.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold text-sm text-white leading-snug">
                                {item.name}
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase shrink-0 ${scenarioBadgeClass(
                                  item.scenario
                                )}`}
                              >
                                {item.scenario}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 tabular-nums">
                              <span className="text-cyan-300">{item.tierCode}</span>
                              <span>·</span>
                              <span>{item.currency}</span>
                              <span>·</span>
                              <span className="text-emerald-300">
                                {item.projectedFiveYearRoiPercent}% 5Y ROI
                              </span>
                              <span>·</span>
                              <span>Net {item.netMarginPercent}%</span>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-slate-400 line-clamp-2">{item.notes}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                              {new Date(item.updatedAt).toLocaleDateString()} ·{' '}
                              {item.synced ? 'Synced' : 'Queued Offline'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => applySavedScenario(item)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3" />
                                <span>Apply</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteScenario(item.id)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                aria-label={`Delete scenario ${item.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Workspace Snapshots Section */}
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                      <Camera className="w-4 h-4 text-indigo-400" />
                      <span>Workspace Snapshots ({workspaceSnapshots.length})</span>
                    </h3>

                    <form
                      onSubmit={(e) => void handleCaptureSnapshot(e)}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <input
                        type="text"
                        value={newSnapshotName}
                        onChange={(e) => setNewSnapshotName(e.target.value)}
                        placeholder="Snapshot label (optional)..."
                        className="flex-1 sm:w-52 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-indigo-500/60 text-xs font-mono text-white placeholder:text-slate-500 outline-none"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Capture Snapshot</span>
                      </button>
                    </form>
                  </div>

                  {workspaceSnapshots.length === 0 ? (
                    <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs font-mono text-slate-400">
                      No workspace snapshots captured yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {workspaceSnapshots.map((snap) => (
                        <div
                          key={snap.id}
                          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="font-semibold text-sm text-white truncate">
                              {snap.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                              <span className="text-indigo-300">
                                Track: {snap.persona ? snap.persona.toUpperCase() : 'GENERAL'}
                              </span>
                              <span>·</span>
                              <span>Section: #{snap.activeSectionId}</span>
                              <span>·</span>
                              <span className="capitalize">{snap.scenario}</span>
                              <span>·</span>
                              <span>{snap.currency}</span>
                              <span>·</span>
                              <span>{snap.quickNotesCount} Notes</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => restoreWorkspaceSnapshot(snap)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteWorkspaceSnapshot(snap.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              aria-label={`Delete snapshot ${snap.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Storage Breakdown View */
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        IndexedDB Storage Allocation by Item Type
                      </div>
                      <div className="text-base font-bold text-white font-heading mt-0.5">
                        Total App Vault Footprint: {formatBytes(storageBreakdown.totalBytes)} across{' '}
                        {storageBreakdown.totalItems} stored records
                      </div>
                    </div>
                    {storageBreakdown.quotaBytes && (
                      <div className="text-right font-mono text-xs text-slate-400 tabular-nums">
                        <div>Browser Origin Usage</div>
                        <div className="text-cyan-300 font-semibold">
                          {formatBytes(storageBreakdown.browserUsageBytes || 0)} /{' '}
                          {formatBytes(storageBreakdown.quotaBytes)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Segment Visual Bar */}
                  <div className="w-full h-3.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex">
                    {storageBreakdown.breakdown.map((segment) => {
                      const colors = getAccentClasses(segment.accent);
                      if (segment.sharePercent <= 0) return null;
                      return (
                        <div
                          key={segment.type}
                          className={`${colors.bar} h-full transition-all duration-300`}
                          style={{ width: `${Math.max(segment.sharePercent, 3)}%` }}
                          title={`${segment.label}: ${formatBytes(segment.bytes)} (${segment.sharePercent}%)`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Per-Type Detailed Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {storageBreakdown.breakdown.map((item) => {
                    const colors = getAccentClasses(item.accent);
                    return (
                      <div
                        key={item.type}
                        className={`p-4 rounded-xl bg-slate-900/70 border ${
                          item.isLargest ? colors.border : 'border-slate-800'
                        } space-y-2.5`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${colors.bar}`} />
                              <h4 className="font-bold text-sm text-white font-heading">
                                {item.label}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                          </div>

                          {item.isLargest && (
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase whitespace-nowrap shrink-0 ${colors.badge}`}
                            >
                              Largest Consumer
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono tabular-nums">
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase">Items</div>
                            <div className="font-bold text-white">{item.itemCount}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase">Size</div>
                            <div className="font-bold text-cyan-300">{formatBytes(item.bytes)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase">Share</div>
                            <div className="font-bold text-slate-200">{item.sharePercent}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>
                      All scenarios, workspace snapshots, and briefing state are persisted offline in IndexedDB.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void resetVault().then(() =>
                        showToastMessage('Vault reset to default institutional seed state.')
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                  >
                    Reset Vault Defaults
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
