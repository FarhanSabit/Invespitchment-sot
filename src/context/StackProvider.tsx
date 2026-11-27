import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  LocalPersistenceService,
  PersistenceStatusSnapshot,
  SavedScenarioRecord,
  WorkspaceSnapshotRecord,
  StorageBreakdownSummary,
  CachedBriefingPayload,
  SyncConnectionState,
} from '../services/LocalPersistenceService';
import { Currency, FeedbackComment } from '../types';
import { InvestorPersona } from '../components/OnboardingWizardModal';
import { FinancialScenario } from '../components/UnitEconomicsSection';
import { GlobalViewMode } from '../App';
import { FINANCIAL_TIERS, FUSION_LAYERS, CASE_STUDIES } from '../data/mockData';
import { getStoredQuickNotes } from '../utils/quickNotesStorage';

export interface ActiveWorkspaceSnapshot {
  currency: Currency;
  persona: InvestorPersona | null;
  scenario: FinancialScenario;
  globalViewMode: GlobalViewMode;
  activeSectionId: string;
  comments: FeedbackComment[];
}

interface StackContextValue {
  connectionState: SyncConnectionState;
  lastSyncedAt: number | null;
  pendingCount: number;
  lastError: string | null;
  storageEngine: PersistenceStatusSnapshot['storageEngine'];
  savedScenarios: SavedScenarioRecord[];
  workspaceSnapshots: WorkspaceSnapshotRecord[];
  cachedBriefing: CachedBriefingPayload | null;
  storageBreakdown: StorageBreakdownSummary;
  isLoadingVault: boolean;
  isStorageManagerOpen: boolean;
  openStorageManager: (initialTab?: 'vault' | 'breakdown') => void;
  closeStorageManager: () => void;
  storageInitialTab: 'vault' | 'breakdown';
  forceSync: () => Promise<void>;
  refreshVault: () => Promise<void>;
  saveScenario: (
    input: Omit<SavedScenarioRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'> & { id?: string }
  ) => Promise<SavedScenarioRecord>;
  deleteScenario: (id: string) => Promise<void>;
  saveCurrentWorkspaceSnapshot: (customName?: string) => Promise<WorkspaceSnapshotRecord>;
  deleteWorkspaceSnapshot: (id: string) => Promise<void>;
  exportVaultData: () => Promise<void>;
  resetVault: () => Promise<void>;
  applySavedScenario: (record: SavedScenarioRecord) => void;
  restoreWorkspaceSnapshot: (record: WorkspaceSnapshotRecord) => void;
  currentWorkspace: ActiveWorkspaceSnapshot;
}

const EMPTY_BREAKDOWN: StorageBreakdownSummary = {
  totalBytes: 0,
  totalItems: 0,
  largestConsumerType: null,
  largestConsumerLabel: null,
  quotaBytes: null,
  browserUsageBytes: null,
  breakdown: [],
};

const StackContext = createContext<StackContextValue | undefined>(undefined);

export interface StackProviderProps {
  children: React.ReactNode;
  workspaceState: ActiveWorkspaceSnapshot;
  onApplyScenario?: (scenario: FinancialScenario, currency: Currency) => void;
  onRestoreSnapshot?: (snapshot: WorkspaceSnapshotRecord) => void;
}

export const StackProvider: React.FC<StackProviderProps> = ({
  children,
  workspaceState,
  onApplyScenario,
  onRestoreSnapshot,
}) => {
  const [status, setStatus] = useState<PersistenceStatusSnapshot>(() =>
    LocalPersistenceService.getStatus()
  );
  const [savedScenarios, setSavedScenarios] = useState<SavedScenarioRecord[]>([]);
  const [workspaceSnapshots, setWorkspaceSnapshots] = useState<WorkspaceSnapshotRecord[]>([]);
  const [cachedBriefing, setCachedBriefing] = useState<CachedBriefingPayload | null>(null);
  const [storageBreakdown, setStorageBreakdown] = useState<StorageBreakdownSummary>(EMPTY_BREAKDOWN);
  const [isLoadingVault, setIsLoadingVault] = useState<boolean>(true);
  const [isStorageManagerOpen, setIsStorageManagerOpen] = useState<boolean>(false);
  const [storageInitialTab, setStorageInitialTab] = useState<'vault' | 'breakdown'>('vault');

  const refreshVault = useCallback(async () => {
    try {
      const [scenarios, snapshots, cached, breakdown] = await Promise.all([
        LocalPersistenceService.getScenarios(),
        LocalPersistenceService.getSnapshots(),
        LocalPersistenceService.getCachedBriefingData(),
        LocalPersistenceService.getStorageBreakdown(),
      ]);
      setSavedScenarios(scenarios);
      setWorkspaceSnapshots(snapshots);
      setCachedBriefing(cached);
      setStorageBreakdown(breakdown);
    } finally {
      setIsLoadingVault(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = LocalPersistenceService.subscribe((nextStatus) => {
      setStatus(nextStatus);
    });

    void LocalPersistenceService.initialize().then(() => {
      void refreshVault();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshVault]);

  // Cache live investor briefing data and workspace state into IndexedDB
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const payload: CachedBriefingPayload = {
        id: 'primary-briefing',
        currency: workspaceState.currency,
        persona: workspaceState.persona,
        scenario: workspaceState.scenario,
        globalViewMode: workspaceState.globalViewMode,
        activeSectionId: workspaceState.activeSectionId,
        comments: workspaceState.comments,
        tierCount: FINANCIAL_TIERS.length,
        fusionLayerCount: FUSION_LAYERS.length,
        caseStudyCount: CASE_STUDIES.length,
        cachedAt: Date.now(),
      };
      void LocalPersistenceService.cacheBriefingData(payload).then(() => {
        setCachedBriefing(payload);
        void LocalPersistenceService.getStorageBreakdown().then(setStorageBreakdown);
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [
    workspaceState.currency,
    workspaceState.persona,
    workspaceState.scenario,
    workspaceState.globalViewMode,
    workspaceState.activeSectionId,
    workspaceState.comments,
  ]);

  // Trigger automatic re-validation and vault refresh when browser reconnects
  useEffect(() => {
    const handleReconnect = () => {
      void LocalPersistenceService.forceSync().then(() => {
        void refreshVault();
      });
    };
    window.addEventListener('online', handleReconnect);
    return () => window.removeEventListener('online', handleReconnect);
  }, [refreshVault]);

  const openStorageManager = useCallback((initialTab: 'vault' | 'breakdown' = 'vault') => {
    setStorageInitialTab(initialTab);
    setIsStorageManagerOpen(true);
    void refreshVault();
  }, [refreshVault]);

  const closeStorageManager = useCallback(() => {
    setIsStorageManagerOpen(false);
  }, []);

  const forceSync = useCallback(async () => {
    await LocalPersistenceService.forceSync();
    await refreshVault();
  }, [refreshVault]);

  const saveScenario = useCallback(
    async (
      input: Omit<SavedScenarioRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'> & {
        id?: string;
      }
    ) => {
      const created = await LocalPersistenceService.saveScenario(input);
      await refreshVault();
      return created;
    },
    [refreshVault]
  );

  const deleteScenario = useCallback(
    async (id: string) => {
      await LocalPersistenceService.deleteScenario(id);
      await refreshVault();
    },
    [refreshVault]
  );

  const saveCurrentWorkspaceSnapshot = useCallback(
    async (customName?: string) => {
      const sectionIds = [
        'hero',
        'dual-engines',
        'fusion-stack',
        'rd-roadmap',
        'milestones',
        'value-exchange',
        'market-shift',
        'case-studies',
        'unit-economics',
        'dual-shore-globe',
        'executive-team',
        'passive-ip',
        'moat-benchmarks',
        'investment-terms',
      ];
      let detectedSectionId = workspaceState.activeSectionId || 'hero';
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 3 && rect.bottom >= window.innerHeight / 3) {
              detectedSectionId = id;
            }
          }
        }
      }

      const quickNotes = getStoredQuickNotes();
      const label =
        customName?.trim() ||
        `Workspace Snapshot · ${workspaceState.scenario.toUpperCase()} (${workspaceState.currency})`;
      const created = await LocalPersistenceService.saveSnapshot({
        name: label,
        persona: workspaceState.persona,
        scenario: workspaceState.scenario,
        currency: workspaceState.currency,
        globalViewMode: workspaceState.globalViewMode,
        activeSectionId: detectedSectionId,
        commentsCount: workspaceState.comments.length,
        quickNotesCount: quickNotes.length,
        commentsPreview: workspaceState.comments.slice(0, 5),
      });
      await refreshVault();
      return created;
    },
    [workspaceState, refreshVault]
  );

  const deleteWorkspaceSnapshot = useCallback(
    async (id: string) => {
      await LocalPersistenceService.deleteSnapshot(id);
      await refreshVault();
    },
    [refreshVault]
  );

  const exportVaultData = useCallback(async () => {
    const payload = await LocalPersistenceService.exportVaultPayload();
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `spenta-app-vault-backup-${dateStamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, []);

  const resetVault = useCallback(async () => {
    await LocalPersistenceService.resetVault();
    await refreshVault();
  }, [refreshVault]);

  const applySavedScenario = useCallback(
    (record: SavedScenarioRecord) => {
      onApplyScenario?.(record.scenario, record.currency);
      setIsStorageManagerOpen(false);
    },
    [onApplyScenario]
  );

  const restoreWorkspaceSnapshot = useCallback(
    (record: WorkspaceSnapshotRecord) => {
      onRestoreSnapshot?.(record);
      setIsStorageManagerOpen(false);
    },
    [onRestoreSnapshot]
  );

  return (
    <StackContext.Provider
      value={{
        connectionState: status.connectionState,
        lastSyncedAt: status.lastSyncedAt,
        pendingCount: status.pendingCount,
        lastError: status.lastError,
        storageEngine: status.storageEngine,
        savedScenarios,
        workspaceSnapshots,
        cachedBriefing,
        storageBreakdown,
        isLoadingVault,
        isStorageManagerOpen,
        openStorageManager,
        closeStorageManager,
        storageInitialTab,
        forceSync,
        refreshVault,
        saveScenario,
        deleteScenario,
        saveCurrentWorkspaceSnapshot,
        deleteWorkspaceSnapshot,
        exportVaultData,
        resetVault,
        applySavedScenario,
        restoreWorkspaceSnapshot,
        currentWorkspace: workspaceState,
      }}
    >
      {children}
    </StackContext.Provider>
  );
};

export function useStack(): StackContextValue {
  const context = useContext(StackContext);
  if (!context) {
    throw new Error('useStack must be used within a StackProvider');
  }
  return context;
}
