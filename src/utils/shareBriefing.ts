import { Currency } from '../types';
import { InvestorPersona } from '../components/OnboardingWizardModal';
import { FinancialScenario } from '../components/UnitEconomicsSection';
import { GlobalViewMode } from '../App';

export interface ShareBriefingParams {
  persona?: InvestorPersona | null;
  currency: Currency;
  scenario?: FinancialScenario;
  globalViewMode?: GlobalViewMode;
  sectionId?: string;
  expiresInHours?: number;
}

export interface GeneratedShareSession {
  url: string;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  persona?: InvestorPersona | null;
  currency: Currency;
  scenario: FinancialScenario;
  globalViewMode: GlobalViewMode;
}

export interface ShareBriefingResult {
  success: boolean;
  sharedVia: 'web-share-api' | 'clipboard' | 'fallback';
  url: string;
  sessionId: string;
  error?: string;
}

const STORAGE_KEY = 'spenta_shared_sessions_v1';

/**
 * Generates a unique, high-entropy temporary session ID for investor briefings.
 */
export function generateSessionId(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timestampHex = Date.now().toString(36);
  return `sp_${timestampHex}_${rand}`;
}

/**
 * Constructs a unique, temporary shareable URL encoding the current session state.
 */
export function generateShareableBriefingUrl({
  persona,
  currency,
  scenario = 'base',
  globalViewMode = 'investor',
  sectionId,
  expiresInHours = 168, // 7 days default
}: ShareBriefingParams): GeneratedShareSession {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://spenta.ai';

  const pathname =
    typeof window !== 'undefined' && window.location.pathname
      ? window.location.pathname
      : '/';

  const createdAt = Date.now();
  const expiresAt = createdAt + expiresInHours * 60 * 60 * 1000;
  const sessionId = generateSessionId();

  const urlParams = new URLSearchParams();
  urlParams.set('sid', sessionId);
  urlParams.set('currency', currency);
  urlParams.set('scenario', scenario);
  urlParams.set('view', globalViewMode);
  urlParams.set('exp', expiresAt.toString());

  if (persona) {
    urlParams.set('persona', persona);
  }

  if (sectionId) {
    urlParams.set('section', sectionId);
  }

  const shareUrl = `${origin}${pathname}?${urlParams.toString()}${
    sectionId ? `#${sectionId}` : ''
  }`;

  const sessionRecord: GeneratedShareSession = {
    url: shareUrl,
    sessionId,
    createdAt,
    expiresAt,
    persona,
    currency,
    scenario,
    globalViewMode,
  };

  // Persist locally for session history/diligence audit trail
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = [sessionRecord, ...existing.slice(0, 19)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota or serialization warnings
    }
  }

  return sessionRecord;
}

/**
 * Checks whether the Web Share API is available in the current browser.
 */
export function isWebShareSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function'
  );
}

/**
 * Executes the share action utilizing the native Web Share API if available,
 * gracefully falling back to clipboard copy.
 */
export async function shareBriefingSession(
  params: ShareBriefingParams
): Promise<ShareBriefingResult> {
  const session = generateShareableBriefingUrl(params);

  const shareTitle = `Spenta Investor Briefing // Tailored Diligence Deck`;
  const personaLabel = params.persona ? ` [${params.persona.toUpperCase()} Track]` : '';
  const shareText = `Review Spenta's Institutional Briefing${personaLabel} (${params.currency}, ${params.scenario?.toUpperCase()} Scenario) with 450% verified client ROI and 6-layer physical AI architecture.`;

  // 1. Try Web Share API if available
  if (isWebShareSupported()) {
    try {
      const shareData = {
        title: shareTitle,
        text: shareText,
        url: session.url,
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return {
          success: true,
          sharedVia: 'web-share-api',
          url: session.url,
          sessionId: session.sessionId,
        };
      }
    } catch (err: unknown) {
      // If user aborted / dismissed native sheet, don't throw error
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          success: false,
          sharedVia: 'web-share-api',
          url: session.url,
          sessionId: session.sessionId,
          error: 'Share dialog dismissed by user',
        };
      }
      console.warn('[Spenta Share] Web Share API encountered an error, falling back to clipboard:', err);
    }
  }

  // 2. Fallback to Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(session.url);
      return {
        success: true,
        sharedVia: 'clipboard',
        url: session.url,
        sessionId: session.sessionId,
      };
    } catch (clipboardErr) {
      console.warn('[Spenta Share] Clipboard copy fallback:', clipboardErr);
    }
  }

  // 3. Fallback for older browsers
  return {
    success: false,
    sharedVia: 'fallback',
    url: session.url,
    sessionId: session.sessionId,
    error: 'Clipboard access not granted',
  };
}
