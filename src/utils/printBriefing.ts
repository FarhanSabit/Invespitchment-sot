export interface PrintBriefingResult {
  triggered: boolean;
  isMobileOrUnsupported: boolean;
  warningMessage?: string;
}

/**
 * Triggers the browser's print dialog using the @media print institutional briefing stylesheet.
 * Emits a console.warn when invoked from a mobile or unsupported browser environment to guide
 * the user toward a desktop browser experience for optimal A4 pagination and chart rendering.
 */
export const triggerBriefingPrint = (): PrintBriefingResult => {
  if (typeof window === 'undefined' || typeof window.print !== 'function') {
    const warningMessage =
      '[Spenta Print Utility] Printing is not supported in this browser environment. Please open the Spenta Investor Briefing on a modern desktop browser (Chrome, Edge, Safari, or Firefox) to print or save as A4 PDF.';
    console.warn(warningMessage);
    return {
      triggered: false,
      isMobileOrUnsupported: true,
      warningMessage,
    };
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const isNarrowTouchViewport =
    typeof window.matchMedia === 'function' &&
    window.innerWidth < 768 &&
    window.matchMedia('(pointer: coarse)').matches;

  const isMobileEnv = isMobileUserAgent || isNarrowTouchViewport;

  if (isMobileEnv) {
    const warningMessage =
      '[Spenta Print Utility] Mobile browser print layout detected. For crisp A4 pagination, high-density financial tables, and D3/Recharts vector fidelity, please switch to a desktop browser experience.';
    console.warn(warningMessage);
    window.print();
    return {
      triggered: true,
      isMobileOrUnsupported: true,
      warningMessage,
    };
  }

  window.print();
  return {
    triggered: true,
    isMobileOrUnsupported: false,
  };
};
