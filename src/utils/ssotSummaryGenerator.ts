import {
  FUSION_LAYERS,
  FINANCIAL_TIERS,
  CASE_STUDIES,
  NON_CLIENT_STREAMS,
  COMPETITOR_DATA,
  STARTUP_BENCHMARKS,
  PITCH_DECK_SLIDES,
} from '../data/mockData';
import { Currency, USD_TO_BDT_RATE } from '../types';
import { GlobalViewMode } from '../App';

const formatCurrencyValue = (usdAmount: number, currency: Currency): string => {
  if (currency === 'USD') {
    return `$${Math.round(usdAmount).toLocaleString()} USD`;
  }
  return `${Math.round(usdAmount * USD_TO_BDT_RATE).toLocaleString()} ৳ BDT`;
};

/**
 * Aggregates key points from all 14 SSOT sections into a single,
 * comprehensive plain-text Executive Summary document for one-click download.
 */
export const buildSsotExecutiveSummaryText = (
  currency: Currency = 'USD',
  viewMode: GlobalViewMode = 'investor'
): string => {
  const generatedAt = new Date().toISOString().split('T')[0];
  const divider = '================================================================================';
  const subDivider = '--------------------------------------------------------------------------------';

  const lines: string[] = [];

  // COVER HEADER
  lines.push(divider);
  lines.push('SPENTA — INTELLIGENT REALITY | MASTER SINGLE SOURCE OF TRUTH (SSOT)');
  lines.push('CONSOLIDATED INVESTOR EXECUTIVE SUMMARY & DILIGENCE BRIEF');
  lines.push(divider);
  lines.push(`Generated Date       : ${generatedAt}`);
  lines.push(`Active Currency      : ${currency} (Audited FX: 1 USD = ${USD_TO_BDT_RATE} BDT)`);
  lines.push(`Briefing Perspective : ${viewMode === 'investor' ? 'Institutional Investor View' : 'Strategic Partner View'}`);
  lines.push(`Corporate Structure  : Delaware C-Corp | San Jose, CA (HQ) <-> Dhaka, BD (R&D)`);
  lines.push(`Direct Founder Desk  : founders@spenta.io`);
  lines.push('');

  // SECTION 01: EXECUTIVE OVERVIEW
  lines.push('01. EXECUTIVE OVERVIEW & CORE THESIS');
  lines.push(subDivider);
  lines.push('• Mission: Bridging Immersive Spatial Computing (XR) and Physical AI / Document Intelligence');
  lines.push('  through the proprietary 6-Layer Omni Vertical Fusion Architecture.');
  lines.push('• Market Opportunity: $667.3B Total Addressable Market (TAM) by 2033 at 41.1%–42.5% CAGR.');
  lines.push('• Proven Client Impact: 450% 3-Year Verified Client ROI (Prime Bank PrimeOCR); -97% latency.');
  lines.push('• Financial Discipline: 32.5% – 45.0% Gross Margin | 13.5% – 25.0% Net Operating Margin.');
  lines.push(`• Seed Round Ask: ${formatCurrencyValue(500000, currency)} YC Post-Money SAFE @ ${formatCurrencyValue(4500000, currency)} Cap (20% Discount).`);
  lines.push('');

  // SECTION 02: DUAL-ENGINE COMMERCIAL PORTFOLIOS
  lines.push('02. DUAL-ENGINE COMMERCIAL PORTFOLIOS (#dual-engines)');
  lines.push(subDivider);
  lines.push('• Engine 1 — The Experience Engine (Spatial Computing & Digital Twins):');
  lines.push('  Unreal Engine 5 (Nanite/Lumen), OpenXR cleanroom training simulators, browser-native WebXR');
  lines.push('  commerce try-on, BLE campus/hospital digital twins, and anamorphic 3D DOOH spectacles.');
  lines.push('• Engine 2 — The Operations Engine (Physical AI & Document Intelligence):');
  lines.push('  Air-gapped PrimeOCR hybrid IDP (LLaMA 3.2 Vision + LayoutLM v3), 8 omni-vertical reasoning');
  lines.push('  assistants, multilingual WhatsApp Voice ERP, and predictive edge SCADA anomaly detection.');
  lines.push('• Compounding Synergy: Client projects fund modular 3D & AI components reused across future');
  lines.push('  deployments, driving COGS down while building passive marketplace IP.');
  lines.push('');

  // SECTION 03: 6-LAYER NEURAL FUSION ARCHITECTURE
  lines.push('03. 6-LAYER NEURAL FUSION ARCHITECTURE (#fusion-stack)');
  lines.push(subDivider);
  [...FUSION_LAYERS]
    .sort((a, b) => b.level - a.level)
    .forEach((layer) => {
      lines.push(`[L${layer.level}] ${layer.title}`);
      lines.push(`     Stack   : ${layer.techStack.join(', ')}`);
      if (layer.specs) {
        lines.push(`     Perf    : ${layer.specs.latency} | ${layer.specs.throughput} | SLA: ${layer.specs.uptimeSLA}`);
      }
      lines.push(`     Impact  : ${layer.enterpriseImpact}`);
    });
  lines.push('');

  // SECTION 04 & 05: TECHNOLOGY R&D ROADMAP & STRATEGIC MILESTONES
  lines.push('04 & 05. R&D ROADMAP (2024–2027+) & 18-MONTH SPRINT MILESTONES (#rd-roadmap, #milestones)');
  lines.push(subDivider);
  lines.push('• Phase 1 (2024 — Completed)        : Core PrimeOCR v1.0, WebXR Showroom Engine, Hospital Twin.');
  lines.push('• Phase 2 (2025 — In Production)    : Cleanroom VR Simulation, Self-Hosted LLaMA 3.2 Vision.');
  lines.push('• Phase 3 (2026 — Active Execution) : Smart Eyewear Spatial HUD, Real-Time SCADA IoT Bridge, Multi-Tenant LMS.');
  lines.push('• Phase 4 (2027+ — Target Scale)    : Autonomous Spatial Robotics & Global Creator IP Marketplace.');
  lines.push('• 12–18 Month Capital Targets       : $60,000 USD MRR Platform ARR | 8 Australian Pilots | 50+ Fab Packs.');
  lines.push('');

  // SECTION 06: VALUE EXCHANGE MODEL
  lines.push('06. ECOSYSTEM VALUE EXCHANGE MODEL (#value-exchange)');
  lines.push(subDivider);
  lines.push('• Bidirectional value loop connecting Enterprise Clients, Dual-Shore Engineering (San Jose/Dhaka),');
  lines.push('  Spatial Asset Marketplaces (Epic Fab / Unity), Hardware OEMs, and Seed SAFE Investors.');
  lines.push('• Land-and-Expand Motion: $1,200 Entry WebAR/AI pilot -> $16k–$25k Mid-Market -> $50k–$90k+ On-Prem Platform.');
  lines.push('');

  // SECTION 07: MACRO CATALYST & HARDWARE INFLUX
  lines.push('07. MACRO CATALYST: BIG TECH HARDWARE INFLUX (#market-shift)');
  lines.push(subDivider);
  lines.push('• Meta & EssilorLuxottica : 7.2M+ Ray-Ban Meta smart glasses shipped; RGB/Audio sensory ingest.');
  lines.push('• Android XR Alliance     : Samsung Galaxy XR, Google & Qualcomm Snapdragon XR2+ Gen 2 ecosystem.');
  lines.push('• Apple Spatial Computing : visionOS & Vision Pro establishing enterprise Micro-OLED benchmark.');
  lines.push('• NVIDIA Isaac & Jetson   : Edge compute enabling air-gapped factory & cleanroom intelligence.');
  lines.push('');

  // SECTION 08: VERIFIED ENTERPRISE CASE STUDIES
  lines.push('08. VERIFIED ENTERPRISE CASE STUDIES (#case-studies)');
  lines.push(subDivider);
  CASE_STUDIES.forEach((cs, idx) => {
    const headlineMetrics = cs.metrics.map((m) => `${m.label}: ${m.value}`).join(' | ');
    lines.push(`${idx + 1}. ${cs.client} (${cs.industry}) — [${cs.tag}]`);
    lines.push(`   ${cs.headline}`);
    lines.push(`   Verified Metrics: ${headlineMetrics}`);
  });
  lines.push('');

  // SECTION 09: 9-TIER UNIT ECONOMICS
  lines.push(`09. RECALIBRATED 9-TIER UNIT ECONOMICS (${currency} BASELINE) (#unit-economics)`);
  lines.push(subDivider);
  lines.push('Disciplined margin ceiling enforced at <=45.0% Gross Margin & <=25.0% Net Margin with full cost absorption:');
  FINANCIAL_TIERS.forEach((tier) => {
    const baselineFormatted = formatCurrencyValue(tier.baselineUsd, currency);
    const rangeFormatted = currency === 'USD' ? tier.rangeUsd : tier.rangeBdt;
    lines.push(
      `• ${tier.code} (${tier.name}) | Range: ${rangeFormatted} | Base: ${baselineFormatted} | ` +
        `GM: ${tier.grossMarginPercent}% | Net: ${tier.netMarginPercent}% | Timeline: ${tier.deliveryTimeline}`
    );
  });
  lines.push('');

  // SECTION 10 & 11: DUAL-SHORE OPERATIONS & EXECUTIVE TEAM
  lines.push('10 & 11. DUAL-SHORE GLOBAL OPERATIONS & LEADERSHIP (#dual-shore-globe, #executive-team)');
  lines.push(subDivider);
  lines.push('• San Jose, CA (USA) & Sydney (APAC) : Enterprise Client Strategy, SAFE Governance, ASX Pilots.');
  lines.push('• Dhaka (Bangladesh R&D Studio)      : 24/7 Deep-Tech Engineering (UE5, WebXR, AI/OCR) @ 8:1 Arbitrage.');
  lines.push('• Blended Rate Advantage             : $35–$75/hr vs $150–$250/hr Western Agencies (50%+ savings).');
  lines.push('• Executive Leadership               : CEO & Spatial Architect (San Jose), CTO AI & Vision (Dhaka),');
  lines.push('                                       VP Global Enterprise Solutions (Sydney), Director of 3D Pipeline (Dhaka).');
  lines.push('');

  // SECTION 12: PASSIVE IP & CREATOR COMMERCE STREAMS
  lines.push('12. NON-CLIENT, PASSIVE & CREATOR COMMERCE STREAMS (#passive-ip)');
  lines.push(subDivider);
  lines.push('Projected Diversified Secondary Cashflow: $15,000 – $64,000/mo across 5 automated streams:');
  NON_CLIENT_STREAMS.forEach((stream) => {
    const yieldRange = currency === 'USD' ? stream.monthlyUsdRange : stream.monthlyBdtRange;
    lines.push(
      `• ${stream.title} (${stream.platform}): ${yieldRange} | GM: ${stream.grossMargin} | Net: ${stream.netMargin}`
    );
  });
  lines.push('');

  // SECTION 13: COMPETITIVE MOAT & STARTUP BENCHMARKS
  lines.push('13. COMPETITIVE MOAT & REAL-WORLD PRECEDENTS (#moat-benchmarks)');
  lines.push(subDivider);
  COMPETITOR_DATA.forEach((row) => {
    lines.push(`• ${row.attribute}: Spenta [${row.spenta}] vs Western [${row.westernAgencies}] vs Outsourcers [${row.commodityOutsourcers}]`);
  });
  lines.push('Precedent Benchmarks:');
  STARTUP_BENCHMARKS.forEach((b) => {
    lines.push(`• ${b.name} (${b.sector}) — ${b.metric}: ${b.description}`);
  });
  lines.push('');

  // SECTION 14: SEED SAFE TERMS & CAPITAL ALLOCATION
  lines.push('14. SEED ROUND SAFE TERMS & USE OF FUNDS (#investment-terms)');
  lines.push(subDivider);
  const askSlide = PITCH_DECK_SLIDES[PITCH_DECK_SLIDES.length - 1];
  askSlide.points.forEach((pt) => {
    lines.push(`• ${pt}`);
  });
  lines.push('');
  lines.push(divider);
  lines.push('CONFIDENTIALITY NOTICE: Prepared exclusively for institutional investment diligence.');
  lines.push('Full interactive financial modeling, 3D WebXR previews, and Data Room at founders@spenta.io');
  lines.push(divider);

  return lines.join('\n');
};

export const downloadSsotExecutiveSummary = (
  currency: Currency = 'USD',
  viewMode: GlobalViewMode = 'investor'
): string => {
  const content = buildSsotExecutiveSummaryText(currency, viewMode);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const filename = `Spenta_SSOT_Executive_Summary_${currency}.txt`;
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
};
