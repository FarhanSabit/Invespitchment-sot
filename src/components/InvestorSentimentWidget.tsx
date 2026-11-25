import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useInvestorSentiment, SENTIMENT_CONFIGS, InvestorSentiment } from '../context/SentimentContext';
import { HeartPulse, Check, ChevronRight, X, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnchorCoords {
  top: number;
  right: number;
}

export const InvestorSentimentWidget: React.FC = () => {
  const { sentiment, setSentiment, config } = useInvestorSentiment();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [anchor, setAnchor] = useState<AnchorCoords>({ top: 0, right: 72 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updateAnchor = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setAnchor({
      top: rect.top + rect.height / 2,
      right: window.innerWidth - rect.left + 12,
    });
  }, []);

  useEffect(() => {
    if (!isOpen && !isHovered) return;
    updateAnchor();
    window.addEventListener('resize', updateAnchor);
    window.addEventListener('scroll', updateAnchor, { passive: true });
    return () => {
      window.removeEventListener('resize', updateAnchor);
      window.removeEventListener('scroll', updateAnchor);
    };
  }, [isOpen, isHovered, updateAnchor]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = widgetRef.current?.contains(target);
      const inPopover = popoverRef.current?.contains(target);
      if (!inTrigger && !inPopover) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectSentiment = (s: InvestorSentiment) => {
    setSentiment(s);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Clamp popover vertical anchor so it never clips off top/bottom of shorter screens
  const clampedPopoverTop =
    typeof window !== 'undefined'
      ? Math.min(Math.max(anchor.top, 230), Math.max(230, window.innerHeight - 210))
      : anchor.top;

  return (
    <div ref={widgetRef} className="relative flex flex-col items-center">
      {/* Sidebar Trigger Pill */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          updateAnchor();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => {
          updateAnchor();
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => {
          updateAnchor();
          setIsHovered(true);
        }}
        onBlur={() => setIsHovered(false)}
        className={`group relative p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          isOpen
            ? 'bg-slate-900 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-900 border-transparent hover:border-slate-800'
        }`}
        aria-label={`Toggle Investor Sentiment Dial (${config.name})`}
        aria-expanded={isOpen}
      >
        <span className="text-sm xl:text-base leading-none select-none">{config.emoji}</span>

        {/* Glow indicator dot */}
        <span
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950"
          style={{ backgroundColor: config.accentColor, boxShadow: `0 0 6px ${config.accentColor}` }}
        />
      </button>

      {/* Portaled Hover Tooltip when popover is closed */}
      {typeof document !== 'undefined' &&
        !isOpen &&
        isHovered &&
        createPortal(
          <span
            style={{ top: `${anchor.top}px`, right: `${anchor.right}px` }}
            className="fixed -translate-y-1/2 px-2.5 py-1 bg-slate-950/95 backdrop-blur-xl border border-slate-700 text-slate-200 text-[11px] font-mono rounded-lg whitespace-nowrap pointer-events-none shadow-2xl flex items-center gap-1.5 z-[90]"
          >
            <span>Sentiment: {config.name}</span>
          </span>,
          document.body
        )}

      {/* Portaled Floating Sentiment Selection Popover */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, x: 12, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ top: `${clampedPopoverTop}px`, right: `${anchor.right}px` }}
                className="fixed -translate-y-1/2 w-80 max-w-[calc(100vw-6rem)] bg-slate-950/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-[95] text-left cursor-default hud-corner"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-lg border text-xs"
                      style={{
                        backgroundColor: `${config.accentColor}18`,
                        borderColor: `${config.accentColor}50`,
                        color: config.accentColor,
                      }}
                    >
                      <HeartPulse className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-white tracking-wide">
                        INVESTOR SENTIMENT DIAL
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Calibrates UI Accents & Saturation
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                    aria-label="Close Sentiment Dial"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Current Active Mode Callout */}
                <div className="my-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Active State:</span>
                    <span className="font-bold flex items-center gap-1.5" style={{ color: config.accentColor }}>
                      <span>{config.emoji}</span>
                      <span>{config.name}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {config.focusSummary}
                  </p>
                </div>

                {/* Sentiment Options Grid */}
                <div className="space-y-1.5">
                  {(Object.keys(SENTIMENT_CONFIGS) as InvestorSentiment[]).map((key) => {
                    const item = SENTIMENT_CONFIGS[key];
                    const isSelected = sentiment === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectSentiment(key)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                          isSelected
                            ? 'bg-slate-900 border-opacity-100 shadow-md ring-1'
                            : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: item.accentColor,
                                boxShadow: `0 0 15px ${item.accentGlow}`,
                              }
                            : {}
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg shrink-0">{item.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                              <span className={isSelected ? 'text-cyan-300' : 'group-hover:text-white'}>
                                {item.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {item.tagline}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: item.accentColor, color: '#020617' }}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Note */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    <span>Saturation: {config.saturationFilter.split(' ')[0]}</span>
                  </span>
                  <span>Saved in Session</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Ephemeral Toast Notification when changed */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 font-mono text-xs text-white"
            style={{ borderColor: config.accentColor, boxShadow: `0 0 20px ${config.accentGlow}` }}
          >
            <span className="text-lg">{config.emoji}</span>
            <div>
              <span className="font-bold" style={{ color: config.accentColor }}>
                {config.name}
              </span>{' '}
              <span className="text-slate-300">sentiment active • UI saturation & accents updated</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
