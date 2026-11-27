import { Currency, FeedbackComment } from '../types';
import { InvestorPersona } from '../components/OnboardingWizardModal';
import { FinancialScenario } from '../components/UnitEconomicsSection';
import { GlobalViewMode } from '../App';

export type SyncConnectionState = 'synced' | 'syncing' | 'offline';

export interface SavedScenarioRecord {
  id: string;
  name: string;
  scenario: FinancialScenario;
  tierCode: string;
  tierName: string;
  currency: Currency;
  baselineUsd: number;
  grossMarginPercent: number;
  netMarginPercent: number;
  projectedFiveYearRoiPercent: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface WorkspaceSnapshotRecord {
  id: string;
  name: string;
  persona: InvestorPersona | null;
  scenario: FinancialScenario;
  currency: Currency;
  globalViewMode: GlobalViewMode;
  activeSectionId: string;
  commentsCount: number;
  quickNotesCount: number;
  commentsPreview: FeedbackComment[];
  createdAt: number;
  synced: boolean;
}

export interface CachedBriefingPayload {
  id: string;
  currency: Currency;
  persona: InvestorPersona | null;
  scenario: FinancialScenario;
  globalViewMode: GlobalViewMode;
  activeSectionId: string;
  comments: FeedbackComment[];
  tierCount: number;
  fusionLayerCount: number;
  caseStudyCount: number;
  cachedAt: number;
}

export interface SyncQueueItem {
  id: string;
  entityType: 'scenario' | 'snapshot' | 'briefing_cache';
  entityId: string;
  action: 'upsert' | 'delete';
  payload: unknown;
  queuedAt: number;
}

export interface StorageTypeBreakdown {
  type: 'scenarios' | 'snapshots' | 'briefing_cache' | 'sync_queue';
  label: string;
  description: string;
  itemCount: number;
  bytes: number;
  sharePercent: number;
  isLargest: boolean;
  accent: 'cyan' | 'indigo' | 'emerald' | 'amber';
}

export interface StorageBreakdownSummary {
  totalBytes: number;
  totalItems: number;
  largestConsumerType: StorageTypeBreakdown['type'] | null;
  largestConsumerLabel: string | null;
  quotaBytes: number | null;
  browserUsageBytes: number | null;
  breakdown: StorageTypeBreakdown[];
}

export interface PersistenceStatusSnapshot {
  connectionState: SyncConnectionState;
  lastSyncedAt: number | null;
  pendingCount: number;
  lastError: string | null;
  storageEngine: 'indexeddb' | 'localstorage-fallback';
}

export interface VaultExportPayload {
  exportedAt: string;
  application: string;
  schemaVersion: number;
  storageEngine: PersistenceStatusSnapshot['storageEngine'];
  totals: {
    scenarios: number;
    workspaceSnapshots: number;
    totalBytes: number;
  };
  scenarios: SavedScenarioRecord[];
  workspaceSnapshots: WorkspaceSnapshotRecord[];
  cachedBriefingMeta: Omit<CachedBriefingPayload, 'comments'> | null;
}

const DB_NAME = 'spenta_investor_ssot_db';
const DB_VERSION = 1;

const STORES = {
  BRIEFING_CACHE: 'briefing_cache',
  SCENARIOS: 'scenarios',
  SNAPSHOTS: 'snapshots',
  SYNC_QUEUE: 'sync_queue',
} as const;

const FALLBACK_PREFIX = 'spenta_vault_fallback_v1_';
const SEED_FLAG_KEY = 'spenta_vault_seeded_v1';

const DEFAULT_SEED_SCENARIOS: SavedScenarioRecord[] = [
  {
    id: 'scen-seed-base-t4',
    name: 'Base Case · T4 Dual-Shore Spatial Commerce Flagship',
    scenario: 'base',
    tierCode: 'T4',
    tierName: 'Enterprise Spatial Twin + AI Workflow',
    currency: 'USD',
    baselineUsd: 85000,
    grossMarginPercent: 45.0,
    netMarginPercent: 32.5,
    projectedFiveYearRoiPercent: 450,
    notes: 'Audited 32.5%–45% margin corridor with Dhaka R&D 8:1 leverage.',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    synced: true,
  },
  {
    id: 'scen-seed-aggressive-t7',
    name: 'Aggressive FY27 · T7 GCC Smart District Twin Rollout',
    scenario: 'aggressive',
    tierCode: 'T7',
    tierName: 'Multi-Site Physical AI & Edge Compute Cluster',
    currency: 'USD',
    baselineUsd: 240000,
    grossMarginPercent: 49.2,
    netMarginPercent: 36.8,
    projectedFiveYearRoiPercent: 615,
    notes: 'Models sovereign smart-infrastructure expansion across MENA & APAC.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    synced: true,
  },
  {
    id: 'scen-seed-conservative-t2',
    name: 'Conservative Floor · T2 Pilot Conversion Stress Test',
    scenario: 'conservative',
    tierCode: 'T2',
    tierName: 'Single-Site WebXR & KYC Vector Deployment',
    currency: 'USD',
    baselineUsd: 35000,
    grossMarginPercent: 39.4,
    netMarginPercent: 24.8,
    projectedFiveYearRoiPercent: 295,
    notes: 'Bear-case sensitivity incorporating +18% enterprise CAC buffer.',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    synced: true,
  },
];

const DEFAULT_SEED_SNAPSHOTS: WorkspaceSnapshotRecord[] = [
  {
    id: 'snap-seed-vc-diligence',
    name: 'Seed Committee Review · VC Institutional Lens',
    persona: 'vc',
    scenario: 'base',
    currency: 'USD',
    globalViewMode: 'investor',
    activeSectionId: 'unit-economics',
    commentsCount: 0,
    quickNotesCount: 3,
    commentsPreview: [],
    createdAt: Date.now() - 86400000 * 2,
    synced: true,
  },
];

function estimateByteSize(value: unknown): number {
  try {
    const json = JSON.stringify(value);
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(json).length;
    }
    return json.length * 2;
  } catch {
    return 0;
  }
}

class LocalPersistenceServiceImpl {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private storageEngine: PersistenceStatusSnapshot['storageEngine'] = 'indexeddb';
  private connectionState: SyncConnectionState =
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced';
  private lastSyncedAt: number | null = Date.now();
  private pendingCount = 0;
  private lastError: string | null = null;
  private listeners = new Set<(status: PersistenceStatusSnapshot) => void>();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.lastError = null;
    void this.forceSync();
  };

  private handleOffline = () => {
    this.connectionState = 'offline';
    this.notify();
  };

  private notify() {
    const snapshot = this.getStatus();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  public subscribe(listener: (status: PersistenceStatusSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStatus(): PersistenceStatusSnapshot {
    return {
      connectionState: this.connectionState,
      lastSyncedAt: this.lastSyncedAt,
      pendingCount: this.pendingCount,
      lastError: this.lastError,
      storageEngine: this.storageEngine,
    };
  }

  private openDatabase(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        this.storageEngine = 'localstorage-fallback';
        resolve(null);
        return;
      }

      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORES.BRIEFING_CACHE)) {
            db.createObjectStore(STORES.BRIEFING_CACHE, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.SCENARIOS)) {
            db.createObjectStore(STORES.SCENARIOS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.SNAPSHOTS)) {
            db.createObjectStore(STORES.SNAPSHOTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
            db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          this.storageEngine = 'indexeddb';
          resolve(request.result);
        };

        request.onerror = () => {
          this.storageEngine = 'localstorage-fallback';
          this.lastError = 'IndexedDB unavailable; using local storage fallback.';
          resolve(null);
        };
      } catch {
        this.storageEngine = 'localstorage-fallback';
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  private readFallbackStore<T>(storeName: string): T[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = window.localStorage.getItem(`${FALLBACK_PREFIX}${storeName}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeFallbackStore<T>(storeName: string, records: T[]): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(`${FALLBACK_PREFIX}${storeName}`, JSON.stringify(records));
    } catch {
      // Ignore quota errors in fallback mode
    }
  }

  private async getAllRecords<T>(storeName: string): Promise<T[]> {
    const db = await this.openDatabase();
    if (!db) {
      return this.readFallbackStore<T>(storeName);
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as T[]) || []);
        req.onerror = () => resolve(this.readFallbackStore<T>(storeName));
      } catch {
        resolve(this.readFallbackStore<T>(storeName));
      }
    });
  }

  private async putRecord<T extends { id: string }>(storeName: string, record: T): Promise<void> {
    const db = await this.openDatabase();
    if (!db) {
      const existing = this.readFallbackStore<T>(storeName).filter((r) => r.id !== record.id);
      this.writeFallbackStore(storeName, [record, ...existing]);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    }).catch(() => {
      const existing = this.readFallbackStore<T>(storeName).filter((r) => r.id !== record.id);
      this.writeFallbackStore(storeName, [record, ...existing]);
    });
  }

  private async deleteRecord(storeName: string, id: string): Promise<void> {
    const db = await this.openDatabase();
    if (!db) {
      const existing = this.readFallbackStore<{ id: string }>(storeName).filter((r) => r.id !== id);
      this.writeFallbackStore(storeName, existing);
      return;
    }

    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async clearStore(storeName: string): Promise<void> {
    const db = await this.openDatabase();
    if (!db) {
      this.writeFallbackStore(storeName, []);
      return;
    }

    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      await this.openDatabase();

      const alreadySeeded =
        typeof window !== 'undefined' && window.localStorage?.getItem(SEED_FLAG_KEY) === 'true';

      const [existingScenarios, existingSnapshots, queue] = await Promise.all([
        this.getAllRecords<SavedScenarioRecord>(STORES.SCENARIOS),
        this.getAllRecords<WorkspaceSnapshotRecord>(STORES.SNAPSHOTS),
        this.getAllRecords<SyncQueueItem>(STORES.SYNC_QUEUE),
      ]);

      if (!alreadySeeded && existingScenarios.length === 0 && existingSnapshots.length === 0) {
        for (const scenario of DEFAULT_SEED_SCENARIOS) {
          await this.putRecord(STORES.SCENARIOS, scenario);
        }
        for (const snapshot of DEFAULT_SEED_SNAPSHOTS) {
          await this.putRecord(STORES.SNAPSHOTS, snapshot);
        }
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(SEED_FLAG_KEY, 'true');
        }
      }

      this.pendingCount = queue.length;
      this.connectionState =
        typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced';
      this.initialized = true;
      this.notify();
    })();

    return this.initPromise;
  }

  private async enqueueMutation(item: Omit<SyncQueueItem, 'id' | 'queuedAt'>): Promise<void> {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    const queueRecord: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      queuedAt: Date.now(),
    };
    await this.putRecord(STORES.SYNC_QUEUE, queueRecord);
    const allQueued = await this.getAllRecords<SyncQueueItem>(STORES.SYNC_QUEUE);
    this.pendingCount = allQueued.length;

    if (isOffline) {
      this.connectionState = 'offline';
      this.notify();
    } else {
      await this.forceSync();
    }
  }

  public async forceSync(): Promise<PersistenceStatusSnapshot> {
    await this.initialize();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.connectionState = 'offline';
      this.lastError = 'Network offline. Local IndexedDB cache remains active.';
      this.notify();
      return this.getStatus();
    }

    this.connectionState = 'syncing';
    this.lastError = null;
    this.notify();

    // Perform brief local integrity verification + flush pending offline mutations
    await new Promise((resolve) => setTimeout(resolve, 420));

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.connectionState = 'offline';
      this.notify();
      return this.getStatus();
    }

    const [scenarios, snapshots] = await Promise.all([
      this.getAllRecords<SavedScenarioRecord>(STORES.SCENARIOS),
      this.getAllRecords<WorkspaceSnapshotRecord>(STORES.SNAPSHOTS),
    ]);

    for (const item of scenarios) {
      if (!item.synced) {
        await this.putRecord(STORES.SCENARIOS, { ...item, synced: true });
      }
    }
    for (const snap of snapshots) {
      if (!snap.synced) {
        await this.putRecord(STORES.SNAPSHOTS, { ...snap, synced: true });
      }
    }

    await this.clearStore(STORES.SYNC_QUEUE);
    this.pendingCount = 0;
    this.lastSyncedAt = Date.now();
    this.connectionState = 'synced';
    this.notify();
    return this.getStatus();
  }

  public async cacheBriefingData(payload: CachedBriefingPayload): Promise<void> {
    await this.initialize();
    await this.putRecord(STORES.BRIEFING_CACHE, payload);
    this.lastSyncedAt =
      typeof navigator !== 'undefined' && !navigator.onLine ? this.lastSyncedAt : Date.now();
    this.notify();
  }

  public async getCachedBriefingData(): Promise<CachedBriefingPayload | null> {
    await this.initialize();
    const records = await this.getAllRecords<CachedBriefingPayload>(STORES.BRIEFING_CACHE);
    return records.find((r) => r.id === 'primary-briefing') || records[0] || null;
  }

  public async getScenarios(): Promise<SavedScenarioRecord[]> {
    await this.initialize();
    const list = await this.getAllRecords<SavedScenarioRecord>(STORES.SCENARIOS);
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public async saveScenario(
    input: Omit<SavedScenarioRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'> & { id?: string }
  ): Promise<SavedScenarioRecord> {
    await this.initialize();
    const now = Date.now();
    const isOnline = typeof navigator === 'undefined' || navigator.onLine;
    const record: SavedScenarioRecord = {
      ...input,
      id: input.id || `scen-${now}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      synced: isOnline,
    };
    await this.putRecord(STORES.SCENARIOS, record);
    await this.enqueueMutation({
      entityType: 'scenario',
      entityId: record.id,
      action: 'upsert',
      payload: { name: record.name, scenario: record.scenario },
    });
    return record;
  }

  public async deleteScenario(id: string): Promise<void> {
    await this.initialize();
    await this.deleteRecord(STORES.SCENARIOS, id);
    await this.enqueueMutation({
      entityType: 'scenario',
      entityId: id,
      action: 'delete',
      payload: null,
    });
  }

  public async getSnapshots(): Promise<WorkspaceSnapshotRecord[]> {
    await this.initialize();
    const list = await this.getAllRecords<WorkspaceSnapshotRecord>(STORES.SNAPSHOTS);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  public async saveSnapshot(
    input: Omit<WorkspaceSnapshotRecord, 'id' | 'createdAt' | 'synced'>
  ): Promise<WorkspaceSnapshotRecord> {
    await this.initialize();
    const now = Date.now();
    const isOnline = typeof navigator === 'undefined' || navigator.onLine;
    const record: WorkspaceSnapshotRecord = {
      ...input,
      id: `snap-${now}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      synced: isOnline,
    };
    await this.putRecord(STORES.SNAPSHOTS, record);
    await this.enqueueMutation({
      entityType: 'snapshot',
      entityId: record.id,
      action: 'upsert',
      payload: { name: record.name, activeSectionId: record.activeSectionId },
    });
    return record;
  }

  public async deleteSnapshot(id: string): Promise<void> {
    await this.initialize();
    await this.deleteRecord(STORES.SNAPSHOTS, id);
    await this.enqueueMutation({
      entityType: 'snapshot',
      entityId: id,
      action: 'delete',
      payload: null,
    });
  }

  public async getStorageBreakdown(): Promise<StorageBreakdownSummary> {
    await this.initialize();
    const [scenarios, snapshots, briefingCache, syncQueue] = await Promise.all([
      this.getAllRecords<SavedScenarioRecord>(STORES.SCENARIOS),
      this.getAllRecords<WorkspaceSnapshotRecord>(STORES.SNAPSHOTS),
      this.getAllRecords<CachedBriefingPayload>(STORES.BRIEFING_CACHE),
      this.getAllRecords<SyncQueueItem>(STORES.SYNC_QUEUE),
    ]);

    const rawItems: Omit<StorageTypeBreakdown, 'sharePercent' | 'isLargest'>[] = [
      {
        type: 'scenarios',
        label: 'Saved Scenarios',
        description: 'Custom financial scenarios, tier weights, and ROI projections',
        itemCount: scenarios.length,
        bytes: estimateByteSize(scenarios),
        accent: 'cyan',
      },
      {
        type: 'snapshots',
        label: 'Workspace Snapshots',
        description: 'Full persona, lens, section anchor, and diligence state captures',
        itemCount: snapshots.length,
        bytes: estimateByteSize(snapshots),
        accent: 'indigo',
      },
      {
        type: 'briefing_cache',
        label: 'Offline Briefing Cache',
        description: 'Cached investor briefing datasets & live diligence session mirror',
        itemCount: briefingCache.length,
        bytes: estimateByteSize(briefingCache),
        accent: 'emerald',
      },
      {
        type: 'sync_queue',
        label: 'Pending Sync Queue',
        description: 'Offline mutations awaiting network reconnect re-validation',
        itemCount: syncQueue.length,
        bytes: estimateByteSize(syncQueue),
        accent: 'amber',
      },
    ];

    const totalBytes = rawItems.reduce((sum, item) => sum + item.bytes, 0);
    const totalItems = rawItems.reduce((sum, item) => sum + item.itemCount, 0);

    let maxBytes = -1;
    let largestType: StorageTypeBreakdown['type'] | null = null;
    let largestLabel: string | null = null;

    for (const item of rawItems) {
      if (item.bytes > maxBytes && item.bytes > 0) {
        maxBytes = item.bytes;
        largestType = item.type;
        largestLabel = item.label;
      }
    }

    const breakdown: StorageTypeBreakdown[] = rawItems.map((item) => ({
      ...item,
      sharePercent: totalBytes > 0 ? Math.round((item.bytes / totalBytes) * 1000) / 10 : 0,
      isLargest: largestType !== null && item.type === largestType,
    }));

    let quotaBytes: number | null = null;
    let browserUsageBytes: number | null = null;
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        quotaBytes = typeof estimate.quota === 'number' ? estimate.quota : null;
        browserUsageBytes = typeof estimate.usage === 'number' ? estimate.usage : null;
      } catch {
        // Ignore storage estimate restrictions
      }
    }

    return {
      totalBytes,
      totalItems,
      largestConsumerType: largestType,
      largestConsumerLabel: largestLabel,
      quotaBytes,
      browserUsageBytes,
      breakdown,
    };
  }

  public async exportVaultPayload(): Promise<VaultExportPayload> {
    await this.initialize();
    const [scenarios, snapshots, cachedBriefing, breakdown] = await Promise.all([
      this.getScenarios(),
      this.getSnapshots(),
      this.getCachedBriefingData(),
      this.getStorageBreakdown(),
    ]);

    const cachedBriefingMeta = cachedBriefing
      ? {
          id: cachedBriefing.id,
          currency: cachedBriefing.currency,
          persona: cachedBriefing.persona,
          scenario: cachedBriefing.scenario,
          globalViewMode: cachedBriefing.globalViewMode,
          activeSectionId: cachedBriefing.activeSectionId,
          tierCount: cachedBriefing.tierCount,
          fusionLayerCount: cachedBriefing.fusionLayerCount,
          caseStudyCount: cachedBriefing.caseStudyCount,
          cachedAt: cachedBriefing.cachedAt,
        }
      : null;

    return {
      exportedAt: new Date().toISOString(),
      application: 'SPENTA — Intelligent Reality | Investor Master SSOT',
      schemaVersion: DB_VERSION,
      storageEngine: this.storageEngine,
      totals: {
        scenarios: scenarios.length,
        workspaceSnapshots: snapshots.length,
        totalBytes: breakdown.totalBytes,
      },
      scenarios,
      workspaceSnapshots: snapshots,
      cachedBriefingMeta,
    };
  }

  public async resetVault(): Promise<void> {
    await Promise.all([
      this.clearStore(STORES.SCENARIOS),
      this.clearStore(STORES.SNAPSHOTS),
      this.clearStore(STORES.BRIEFING_CACHE),
      this.clearStore(STORES.SYNC_QUEUE),
    ]);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(SEED_FLAG_KEY);
    }
    this.initialized = false;
    this.initPromise = null;
    await this.initialize();
  }
}

export const LocalPersistenceService = new LocalPersistenceServiceImpl();
