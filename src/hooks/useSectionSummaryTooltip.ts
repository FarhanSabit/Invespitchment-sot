import { useState, useCallback, useRef, type MouseEvent as ReactMouseEvent, type FocusEvent as ReactFocusEvent } from 'react';
import { SECTION_SUMMARIES, SectionSummaryMetadata } from '../data/sectionSummaries';

export interface SectionTooltipState {
  isVisible: boolean;
  sectionId: string;
  title: string;
  code: string;
  summary: string;
  accent: 'cyan' | 'emerald' | 'indigo' | 'purple' | 'amber';
  x: number;
  y: number;
  placement: 'top' | 'bottom';
}

export interface UseSectionSummaryTooltipOptions {
  delay?: number;
  hideDelay?: number;
}

/**
 * Custom hook to extract section one-sentence summaries from the DOM's
 * `data-section-summary` attribute (or fallback dictionary) and display
 * an institutional tooltip on hover/focus over progress markers or dividers.
 */
export function useSectionSummaryTooltip(options?: UseSectionSummaryTooltipOptions) {
  const [tooltipState, setTooltipState] = useState<SectionTooltipState | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const showTimeoutRef = useRef<number | null>(null);

  const getSectionSummary = useCallback((sectionId: string): { summary: string; title: string; code: string; accent: SectionSummaryMetadata['accent'] } => {
    let summary = '';
    let title = '';
    let code = '';
    let accent: SectionSummaryMetadata['accent'] = 'cyan';

    if (typeof document !== 'undefined') {
      const el = document.getElementById(sectionId) || document.querySelector(`[data-section-id="${sectionId}"]`);
      if (el) {
        summary = el.getAttribute('data-section-summary') || el.getAttribute('data-summary') || '';
      }
    }

    const fallback = SECTION_SUMMARIES[sectionId];
    if (fallback) {
      if (!summary) summary = fallback.summary;
      title = fallback.title;
      code = fallback.code;
      accent = fallback.accent;
    } else {
      if (!title) title = sectionId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      code = 'SEC';
    }

    return { summary: summary || 'Executive briefing section with detailed metrics and deliverables.', title, code, accent };
  }, []);

  const showTooltip = useCallback((sectionId?: string, event?: ReactMouseEvent | MouseEvent) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    const targetId = sectionId || 'hero';
    const target = event?.currentTarget as HTMLElement | null;
    const { summary, title, code, accent } = getSectionSummary(targetId);

    const computeCoords = () => {
      let x = window.innerWidth / 2;
      let y = 100;
      let placement: 'top' | 'bottom' = 'top';

      if (target && typeof target.getBoundingClientRect === 'function') {
        const rect = target.getBoundingClientRect();
        x = rect.left + rect.width / 2;

        // Check if there is enough space above
        if (rect.top > 140) {
          y = rect.top - 12;
          placement = 'top';
        } else {
          y = rect.bottom + 12;
          placement = 'bottom';
        }
      } else if (event) {
        x = event.clientX;
        y = event.clientY - 16;
      }

      // Clamp horizontal position to avoid viewport edge overflows
      const tooltipMaxWidth = 360;
      const padding = 16;
      if (x - tooltipMaxWidth / 2 < padding) {
        x = tooltipMaxWidth / 2 + padding;
      } else if (x + tooltipMaxWidth / 2 > window.innerWidth - padding) {
        x = window.innerWidth - tooltipMaxWidth / 2 - padding;
      }

      setTooltipState({
        isVisible: true,
        sectionId: targetId,
        title,
        code,
        summary,
        accent,
        x,
        y,
        placement,
      });
    };

    if (options?.delay && options.delay > 0) {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = window.setTimeout(computeCoords, options.delay);
    } else {
      computeCoords();
    }
  }, [getSectionSummary, options?.delay]);

  const hideTooltip = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    const delay = options?.hideDelay ?? 120;
    hideTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, delay);
  }, [options?.hideDelay]);

  const bindTrigger = useCallback((sectionId?: string) => ({
    onMouseEnter: (e: ReactMouseEvent) => showTooltip(sectionId, e),
    onMouseLeave: hideTooltip,
    onFocus: (e: ReactFocusEvent) => showTooltip(sectionId, e as unknown as ReactMouseEvent),
    onBlur: hideTooltip,
  }), [showTooltip, hideTooltip]);

  return {
    tooltipState,
    showTooltip,
    hideTooltip,
    bindTrigger,
    getSectionSummary,
  };
}
