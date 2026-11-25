import React from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Layers, 
  Presentation, 
  FileText, 
  ArrowUp,
  Sparkles,
  Mail,
  Printer
} from 'lucide-react';
import { FeedbackWidget } from './FeedbackWidget';
import { SpentaLogo } from './SpentaLogo';
import { triggerBriefingPrint } from '../utils/printBriefing';

interface FooterProps {
  onOpenPitchDeck: () => void;
  onOpenDataRoom: () => void;
  onOpenContact?: (topic?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenPitchDeck, 
  onOpenDataRoom,
  onOpenContact
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#030407] border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      
      {/* Background Grids */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Investor Feedback Widget */}
        <FeedbackWidget 
          onOpenContact={onOpenContact} 
          onOpenDataRoom={onOpenDataRoom} 
        />

        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Authority (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <SpentaLogo size="md" showTagline />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Engineering the interactive perceptual layer for enterprise. Bridging Immersive Spatial Computing (Unreal Engine 5, WebXR) with Multimodal Physical AI (LLaMA 3.2 Vision, PrimeOCR).
            </p>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>San Jose, CA</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dhaka, BD</span>
              </span>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Architecture & Stack
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li><a href="#dual-engines" className="hover:text-cyan-400 transition-colors">The Dual Engines</a></li>
              <li><a href="#fusion-stack" className="hover:text-cyan-400 transition-colors">6-Layer Fusion Stack</a></li>
              <li><a href="#case-studies" className="hover:text-cyan-400 transition-colors">Enterprise Case Studies</a></li>
              <li><a href="#unit-economics" className="hover:text-cyan-400 transition-colors">9-Tier Unit Economics</a></li>
              <li><a href="#passive-ip" className="hover:text-cyan-400 transition-colors">Passive IP & Creator Streams</a></li>
            </ul>
          </div>

          {/* Institutional Deliverables (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Investor Governance & Collateral
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target Audience: Board of Directors, Executive Leadership, Australian Investor Group (John), Enterprise Commercial Partners.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onOpenPitchDeck}
                className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>12-Slide Pitch Deck</span>
              </button>

              <button
                onClick={onOpenDataRoom}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Data Room Access</span>
              </button>

              {onOpenContact && (
                <button
                  onClick={onOpenContact}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Direct Inquiry</span>
                </button>
              )}

              <button
                type="button"
                onClick={triggerBriefingPrint}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Print Institutional Briefing (Desktop Recommended)"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Print Briefing</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Confidential Notice */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            CONFIDENTIAL • FOR INSTITUTIONAL INVESTORS ONLY • SPENTA MASTER SSOT v2.6
          </div>

          <div className="flex items-center gap-4">
            <span>© 2026 Spenta Inc. All rights reserved.</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Back to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>TOP</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
