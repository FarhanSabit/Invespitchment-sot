export type QuickNoteColor = 'amber' | 'emerald' | 'cyan' | 'rose' | 'purple';

export type QuickNoteCategory = 
  | 'High Conviction'
  | 'Key Question'
  | 'Due Diligence'
  | 'Risk Flag'
  | 'Valuation Note';

export interface QuickNote {
  id: string;
  sectionId: string;
  sectionTitle: string;
  text: string;
  color: QuickNoteColor;
  category: QuickNoteCategory;
  author: string;
  createdAt: number;
  updatedAt?: number;
}

export const NOTE_COLOR_CONFIG: Record<
  QuickNoteColor,
  {
    name: string;
    hex: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    ringClass: string;
    dotClass: string;
    category: QuickNoteCategory;
  }
> = {
  emerald: {
    name: 'High Conviction',
    hex: '#10b981',
    bgClass: 'bg-emerald-950/40',
    borderClass: 'border-emerald-500/40',
    textClass: 'text-emerald-400',
    ringClass: 'ring-emerald-400',
    dotClass: 'bg-emerald-400',
    category: 'High Conviction',
  },
  amber: {
    name: 'Key Question',
    hex: '#f59e0b',
    bgClass: 'bg-amber-950/40',
    borderClass: 'border-amber-500/40',
    textClass: 'text-amber-400',
    ringClass: 'ring-amber-400',
    dotClass: 'bg-amber-400',
    category: 'Key Question',
  },
  cyan: {
    name: 'Due Diligence',
    hex: '#06b6d4',
    bgClass: 'bg-cyan-950/40',
    borderClass: 'border-cyan-500/40',
    textClass: 'text-cyan-400',
    ringClass: 'ring-cyan-400',
    dotClass: 'bg-cyan-400',
    category: 'Due Diligence',
  },
  rose: {
    name: 'Risk Flag',
    hex: '#f43f5e',
    bgClass: 'bg-rose-950/40',
    borderClass: 'border-rose-500/40',
    textClass: 'text-rose-400',
    ringClass: 'ring-rose-400',
    dotClass: 'bg-rose-400',
    category: 'Risk Flag',
  },
  purple: {
    name: 'Valuation Note',
    hex: '#a855f7',
    bgClass: 'bg-purple-950/40',
    borderClass: 'border-purple-500/40',
    textClass: 'text-purple-400',
    ringClass: 'ring-purple-400',
    dotClass: 'bg-purple-400',
    category: 'Valuation Note',
  },
};
