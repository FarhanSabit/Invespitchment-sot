import React, { useEffect } from 'react';
import { useArPreview } from '../context/ArPreviewContext';
import { ArSpatialViewer } from './ArSpatialViewer';
import { 
  X, 
  Glasses, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ArPreviewModal: React.FC = () => {
  const { isOpen, payload, closeArPreview } = useArPreview();

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeArPreview();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeArPreview]);

  if (!isOpen || !payload) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-6">
        
        {/* Backdrop click to close */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={closeArPreview}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-5xl max-h-[94vh] bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 hud-corner"
        >
          {/* Top Header Bar */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <Glasses className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2">
                  <span>AUGMENTED REALITY & SPATIAL 3D PREVIEW</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase font-mono font-bold">
                    WebXR 1:1 Scale
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {payload.sectionTitle} {payload.subtitle ? `• ${payload.subtitle}` : ''}
                </div>
              </div>
            </div>

            <button
              onClick={closeArPreview}
              className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close 3D Spatial Viewer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3D Spatial Canvas Area */}
          <div className="p-3 sm:p-4 bg-slate-950 overflow-y-auto flex-1">
            <ArSpatialViewer modelPreset={payload.modelPreset} />
          </div>

          {/* Bottom Diligence Spec Footer */}
          <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero External Assets • 100% Procedural Three.js WebGL</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-slate-400 hidden sm:inline">
                Target: Apple Vision Pro, Meta Quest 3, Mobile Safari WebXR
              </span>
            </div>

            {payload.sectionId && (
              <button
                onClick={() => {
                  closeArPreview();
                  const el = document.getElementById(payload.sectionId!);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Jump to {payload.sectionTitle}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
