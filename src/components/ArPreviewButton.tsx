import React from 'react';
import { useArPreview, ArModelPreset } from '../context/ArPreviewContext';
import { Glasses, Box, Sparkles } from 'lucide-react';

interface ArPreviewButtonProps {
  sectionTitle: string;
  sectionId?: string;
  modelPreset?: ArModelPreset;
  subtitle?: string;
  variant?: 'pill' | 'button' | 'compact';
  className?: string;
}

export const ArPreviewButton: React.FC<ArPreviewButtonProps> = ({
  sectionTitle,
  sectionId,
  modelPreset = 'fusion-core',
  subtitle,
  variant = 'pill',
  className = '',
}) => {
  const { openArPreview } = useArPreview();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openArPreview({
      sectionTitle,
      sectionId,
      modelPreset,
      subtitle,
    });
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-sm group ${className}`}
        title={`Open 3D AR Spatial Preview for ${sectionTitle}`}
        aria-label={`Open 3D AR Spatial Preview for ${sectionTitle}`}
      >
        <Glasses className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 hover:from-cyan-900/90 hover:to-indigo-900/90 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md group ${className}`}
        title={`Open 3D AR Spatial Preview for ${sectionTitle}`}
      >
        <Glasses className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span>AR 3D Preview</span>
      </button>
    );
  }

  // Default 'pill' variant designed to sit right next to CopyShareButton in section headers
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-sm group ${className}`}
      title={`Open 3D AR Spatial Preview for ${sectionTitle}`}
      aria-label={`Open 3D AR Spatial Preview for ${sectionTitle}`}
    >
      <Glasses className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
      <span className="font-semibold text-[11px]">AR Preview</span>
      <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold hidden sm:inline">
        3D
      </span>
    </button>
  );
};
