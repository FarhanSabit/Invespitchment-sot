export interface ReadingTimeResult {
  minutes: number;
  wordCount: number;
  formatted: string;
}

/**
 * Baseline word counts for each briefing section (SSOT defaults)
 * to prevent zero-read-time layout shifts before DOM rendering.
 */
export const SECTION_BASELINE_WORD_COUNTS: Record<string, number> = {
  hero: 580,
  'dual-engines': 820,
  'fusion-stack': 1250,
  'rd-roadmap': 740,
  milestones: 610,
  'value-exchange': 540,
  'market-shift': 890,
  'case-studies': 1100,
  'unit-economics': 1350,
  'dual-shore-globe': 630,
  'executive-team': 710,
  'passive-ip': 840,
  'moat-benchmarks': 790,
  'investment-terms': 920,
};

const WORDS_PER_MINUTE = 200;

/**
 * Calculates estimated reading time from a raw text string or rendered DOM element.
 */
export function calculateReadingTime(
  source: string | HTMLElement | null | undefined,
  wpm = WORDS_PER_MINUTE
): ReadingTimeResult {
  let text = '';

  if (typeof source === 'string') {
    text = source;
  } else if (source && typeof source === 'object' && 'innerText' in source) {
    // Clone or read text ignoring scripts, style tags, and hidden print elements
    text = source.innerText || source.textContent || '';
  }

  // Clean and split words
  const cleanText = text
    .replace(/[^\w\s-]/g, ' ')
    .trim();

  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / wpm));

  return {
    minutes,
    wordCount,
    formatted: `${minutes} min read`,
  };
}

/**
 * Computes live or baseline reading time for a specific briefing section ID.
 */
export function getSectionReadingTime(
  sectionId: string,
  wpm = WORDS_PER_MINUTE
): ReadingTimeResult {
  if (typeof document !== 'undefined') {
    const el = document.getElementById(sectionId);
    if (el) {
      const res = calculateReadingTime(el, wpm);
      if (res.wordCount > 50) {
        return res;
      }
    }
  }

  // Fallback to calibrated baseline if DOM node is not yet populated
  const baselineWords = SECTION_BASELINE_WORD_COUNTS[sectionId] || 600;
  const minutes = Math.max(1, Math.ceil(baselineWords / wpm));

  return {
    minutes,
    wordCount: baselineWords,
    formatted: `${minutes} min read`,
  };
}
