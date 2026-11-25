export interface SectionSummaryMetadata {
  id: string;
  title: string;
  code: string;
  summary: string;
  accent: 'cyan' | 'emerald' | 'indigo' | 'purple' | 'amber';
}

export const SECTION_SUMMARIES: Record<string, SectionSummaryMetadata> = {
  hero: {
    id: 'hero',
    title: 'Executive Briefing',
    code: 'SSOT',
    summary:
      "Comprehensive briefing on Spenta's omni-vertical fusion model, core performance metrics, 450% client ROI, and the 6-layer architecture.",
    accent: 'cyan',
  },
  'dual-engines': {
    id: 'dual-engines',
    title: 'Dual-Engine Model',
    code: '01',
    summary:
      'Dual synergistic commercial portfolios uniting consumer spatial immersion with back-office document intelligence.',
    accent: 'cyan',
  },
  'fusion-stack': {
    id: 'fusion-stack',
    title: '6-Layer Fusion Stack',
    code: '02',
    summary:
      'Composable six-layer technical architecture spanning physical hardware ingest to cross-platform enterprise delivery.',
    accent: 'indigo',
  },
  'rd-roadmap': {
    id: 'rd-roadmap',
    title: 'R&D Technology Roadmap',
    code: '03',
    summary:
      'Systematic multi-year Gantt maturation converting bespoke spatial contracts and on-premise AI into multi-tenant IP SDKs.',
    accent: 'purple',
  },
  milestones: {
    id: 'milestones',
    title: 'Execution Sprints & Milestones',
    code: '04',
    summary:
      'Execution sprint schedule and operational milestones tracking enterprise rollouts and institutional capital deployment.',
    accent: 'cyan',
  },
  'value-exchange': {
    id: 'value-exchange',
    title: 'Value Exchange Model',
    code: '05',
    summary:
      'Synergistic economic throughput and bidirectional value exchange powering compounding customer retention and margins.',
    accent: 'emerald',
  },
  'market-shift': {
    id: 'market-shift',
    title: 'Macro Hardware Shift',
    code: '06',
    summary:
      'Analysis of the macroeconomic hardware shift as Big Tech smart glasses and spatial sensors unlock a $667B TAM.',
    accent: 'cyan',
  },
  'case-studies': {
    id: 'case-studies',
    title: 'Verified Deployments & Case Studies',
    code: '07',
    summary:
      'Audited client proof points across banking, biopharma, retail, and healthcare demonstrating 450% verified 3-year ROI.',
    accent: 'indigo',
  },
  'unit-economics': {
    id: 'unit-economics',
    title: '9-Tier Unit Economics',
    code: '08',
    summary:
      'Reconciled 9-tier financial waterfall demonstrating 32.5%–45% gross margins and 13.5%–25% audited net profit margins.',
    accent: 'emerald',
  },
  'dual-shore-globe': {
    id: 'dual-shore-globe',
    title: 'Dual-Shore Operational Sync',
    code: '09',
    summary:
      'Interactive 24/7 dual-shore operational engine bridging San Jose executive architecture with Dhaka engineering scale.',
    accent: 'cyan',
  },
  'executive-team': {
    id: 'executive-team',
    title: 'Executive Leadership Team',
    code: '10',
    summary:
      'Multidisciplinary leadership and engineering pioneers with proven track records across Silicon Valley and South Asia.',
    accent: 'indigo',
  },
  'passive-ip': {
    id: 'passive-ip',
    title: 'Passive IP & Creator Commerce',
    code: '11',
    summary:
      'High-margin non-client revenue channels spanning 3D asset store royalties, creator platforms, and micro-SaaS subscriptions.',
    accent: 'purple',
  },
  'moat-benchmarks': {
    id: 'moat-benchmarks',
    title: 'Defensive Moats & Benchmarks',
    code: '12',
    summary:
      'Competitive defensibility analysis highlighting air-gapped on-premise security, speed, and unit margin advantages.',
    accent: 'cyan',
  },
  'investment-terms': {
    id: 'investment-terms',
    title: 'Seed SAFE Terms & Capital Allocation',
    code: '13',
    summary:
      'Seed Round SAFE terms seeking $500k at a $4.5M cap for engineering expansion, hardware labs, and US market penetration.',
    accent: 'emerald',
  },
};
