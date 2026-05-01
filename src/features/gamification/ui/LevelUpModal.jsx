import { useEffect, useRef } from 'react';
import { X, Star, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/**
 * Polished level-up celebration modal.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   prevLevel: number
 *   newLevel: number
 *   xpGained: number
 *   reward?: { emoji: string, title: string, description: string }
 */
export function LevelUpModal({ isOpen, onClose, prevLevel, newLevel, xpGained, reward }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-sm bg-levelup-card rounded-3xl
                   shadow-modal border border-brand-100
                   animate-scale-in overflow-hidden
                   focus:outline-none"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-xp-gradient" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-ghost
                     hover:bg-brand-50 hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="px-6 pt-8 pb-6 text-center space-y-5">
          {/* Level badge hero */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-xp-gradient opacity-20 blur-xl scale-110" />
            <div
              className="relative w-24 h-24 rounded-full bg-xp-gradient
                          flex flex-col items-center justify-center
                          shadow-glow-xp animate-float"
            >
              <span className="text-white text-2xs font-semibold uppercase tracking-widest">
                Level
              </span>
              <span className="text-white text-3xl font-display font-bold leading-none">
                {newLevel}
              </span>
            </div>
          </div>

          {/* Copy */}
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Sparkles size={14} className="text-gold animate-pulse-glow" />
              <p className="text-xs font-semibold uppercase tracking-widest text-xp">
                Level Up!
              </p>
              <Sparkles size={14} className="text-gold animate-pulse-glow" />
            </div>
            <h2 id="levelup-title" className="text-2xl font-display text-ink">
              You reached Level {newLevel}
            </h2>
            <p className="text-sm text-sub mt-1">
              Up from Level {prevLevel} · +{xpGained} XP earned
            </p>
          </div>

          {/* Optional reward */}
          {reward && (
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl
                          bg-white/60 border border-white/80 text-left"
            >
              <div
                className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20
                            flex items-center justify-center text-lg flex-shrink-0"
              >
                {reward.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{reward.title}</p>
                <p className="text-xs text-sub">{reward.description}</p>
              </div>
              <Star size={14} className="text-gold ml-auto flex-shrink-0" />
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2
                       py-3 px-5 rounded-xl
                       bg-xp-gradient text-white text-sm font-semibold
                       shadow-glow-xp hover:opacity-90 active:scale-[0.98]
                       transition-all duration-150"
          >
            Keep going <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
