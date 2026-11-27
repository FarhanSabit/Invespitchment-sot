import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  WifiOff,
  HardDrive,
  Database,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useStack } from '../context/StackProvider';

interface SyncStatusIndicatorProps {
  variant?: 'navbar' | 'menu';
  onActionComplete?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  variant = 'navbar',
  onActionComplete,
}) => {
  const {
    connectionState,
    lastSyncedAt,
    pendingCount,
    storageEngine,
    storageBreakdown,
    forceSync,
    openStorageManager,
  } = useStack();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPopoverOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isPopoverOpen]);

  const handleForceSync = async () => {
    await forceSync();
  };

  const formattedLastSync = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Pending';

  const statusMeta =
    connectionState === 'syncing'
      ? {
          label: 'Syncing',
          pillClass:
            'bg-cyan-950/70 border-cyan-500/40 text-cyan-300 hover:border-cyan-400',
          dotClass: 'bg-cyan-400 animate-pulse',
          icon: <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin shrink-0" />,
        }
      : connectionState === 'offline'
      ? {
          label: 'Offline',
          pillClass:
            'bg-amber-950/70 border-amber-500/40 text-amber-300 hover:border-amber-400',
          dotClass: 'bg-amber-400',
          icon: <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />,
        }
      : {
          label: 'Synced',
          pillClass:
            'bg-emerald-950/50 border-emerald-500/30 text-emerald-300 hover:border-emerald-400',
          dotClass: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />,
        };

  if (variant === 'menu') {
    return (
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            {statusMeta.icon}
            <span className="font-semibold text-slate-100">{statusMeta.label}</span>
            <span className="text-[10px] text-slate-400 tabular-nums">({formattedLastSync})</span>
          </div>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono tabular-nums">
              {pendingCount} queued
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => void handleForceSync()}
            disabled={connectionState === 'syncing'}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          >
            <RefreshCw
              className={`w-3 h-3 ${connectionState === 'syncing' ? 'animate-spin' : ''}`}
            />
            <span>Force Sync</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onActionComplete?.();
              openStorageManager('vault');
            }}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <HardDrive className="w-3 h-3" />
            <span>App Vault</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        id="nav-sync-status-btn"
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        aria-expanded={isPopoverOpen}
        aria-haspopup="true"
        title={`LocalPersistenceService: ${statusMeta.label} (${formattedLastSync}) — Click for Force Sync & Storage Manager`}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-mono border transition-all cursor-pointer whitespace-nowrap shrink-0 ${statusMeta.pillClass}`}
      >
        {statusMeta.icon}
        <span className="text-[11px] font-semibold hidden min-[1360px]:inline">
          {statusMeta.label}
        </span>
        {pendingCount > 0 && (
          <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-200 text-[9px] font-mono tabular-nums">
            {pendingCount}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 opacity-70 transition-transform ${
            isPopoverOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isPopoverOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-xl p-3.5 shadow-2xl z-[80] space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                LocalPersistenceService
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 font-mono font-bold text-white">
                <span className={`w-2 h-2 rounded-full ${statusMeta.dotClass}`} />
                <span>Status: {statusMeta.label}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300 uppercase">
              {storageEngine === 'indexeddb' ? 'IndexedDB' : 'LocalFallback'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Last Validated</span>
              </div>
              <div className="text-slate-100 font-semibold mt-0.5 tabular-nums">
                {formattedLastSync}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Database className="w-3 h-3 text-indigo-400" />
                <span>Vault Items</span>
              </div>
              <div className="text-slate-100 font-semibold mt-0.5 tabular-nums">
                {storageBreakdown.totalItems} ({(storageBreakdown.totalBytes / 1024).toFixed(1)} KB)
              </div>
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="px-2.5 py-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] font-mono text-amber-200">
              {pendingCount} offline change{pendingCount === 1 ? '' : 's'} queued for sync-on-reconnect.
            </div>
          )}

          <div className="flex flex-col gap-1.5 pt-1">
            <button
              type="button"
              id="navbar-force-sync-btn"
              onClick={() => void handleForceSync()}
              disabled={connectionState === 'syncing'}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${connectionState === 'syncing' ? 'animate-spin' : ''}`}
              />
              <span>{connectionState === 'syncing' ? 'Re-validating...' : 'Force Sync'}</span>
            </button>

            <button
              type="button"
              id="navbar-open-storage-manager-btn"
              onClick={() => {
                setIsPopoverOpen(false);
                openStorageManager('vault');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>Open App Vault & Storage</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
