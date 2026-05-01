// src/features/gamification/ui/LevelUpModal.jsx
// Premium animated level-up celebration modal.
// Replaces generic alert box with a polished reward moment.
import { useEffect, useRef } from 'react';
import { X, Zap, Star, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// ---------------------------------------------------------------------------
// Confetti particle (CSS-only, 12 dots)
// ---------------------------------------------------------------------------
function Confetti() {
  const particles = [
    { x: -60, y: -80,  color: 'bg-brand-400', size: 'w-2 h-2',   delay: '0ms'   },
    { x: 40,  y: -90,  color: 'bg-yellow-400', size: 'w-1.5 h-3', delay: '60ms'  },
    { x: -80, y: -40,  color: 'bg-green-400',  size: 'w-2 h-2',   delay: '120ms' },
    { x: 80,  y: -50,  color: 'bg-pink-400',   size: 'w-1.5 h-1.5', delay: '40ms'  },
    { x: -40, y: -100, color: 'bg-teal-400',   size: 'w-2 h-1',   delay: '80ms'  },
    { x: 60,  y: -70,  color: 'bg-orange-400', size: 'w-1.5 h-2', delay: '20ms'  },
    { x: -20, y: -110, color: 'bg-purple-400', size: 'w-2 h-2',   delay: '100ms' },
    { x: 100, y: -30,  color: 'bg-brand-300',  size: 'w-1 h-3',   delay: '50ms'  },
    { x: -100,y: -20,  color: 'bg-yellow-300', size: 'w-2 h-1.5', delay: '70ms'  },
    { x: 20,  y: -120, color: 'bg-green-300',  size: 'w-1.5 h-1.5', delay: '90ms'  },
    { x: -50, y: -60,  color: 'bg-red-400',    size: 'w-2 h-2',   delay: '30ms'  },
    { x: 50,  y: -95,  color: 'bg-teal-300',   size: 'w-1 h-2',   delay: '110ms' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {particles.map((p, i) => (
        <div
          key={i}
          className={cn(
            p.size, p.color,
            'absolute rounded-sm left-1/2 top-1/2',
            'animate-[confetti_0.8s_ease-out_both]',
          )}
          style={{
            '--tx': `${p.x}px`,
            '--ty': `${p.y}px`,
            animationDelay: p.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          from { transform: translate(-50%,-50%) translate(0,0) rotate(0deg); opacity:1; }
          to   { transform: translate(-50%,-50%) translate(var(--tx),var(--ty)) rotate(360deg) scale(0); opacity:0; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Perk chip
// ---------------------------------------------------------------------------
function PerkChip({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl
                    bg-white/10 border border-white/20 backdrop-blur-sm">
      <Icon size={13} className="text-yellow-300 shrink-0" />
      <span className="text-xs font-medium text-white/90">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LevelUpModal
// ---------------------------------------------------------------------------
export function LevelUpModal({
  isOpen,
  onClose,
  newLevel    = 5,
  xpGained    = 150,
  perks       = [],      // [{ icon, label }]
  nextLevelXP = 500,
}) {
  const closeRef = useRef(null);

  // Trap focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') onClose?.(); }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const defaultPerks = perks.length > 0 ? perks : [
    { icon: Star,   label: 'Badge baru terbuka'  },
    { icon: Trophy, label: 'Ranking meningkat'   },
    { icon: Zap,    label: `+${xpGained} XP gained` },
  ];

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.15);opacity:0.15} }
      `}</style>

      {/* Modal card */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden
                   shadow-modal animate-[slideUp_0.35s_cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Confetti burst */}
        <Confetti />

        {/* Gradient header */}
        <div className="relative px-6 pt-10 pb-8 text-center"
             style={{ background: 'linear-gradient(160deg,#3130A8 0%,#4F4DE8 60%,#7C3AED 100%)' }}>

          {/* Close */}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-4 right-4 w-8 h-8 rounded-full
                       bg-white/10 hover:bg-white/20 flex items-center justify-center
                       text-white/80 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>

          {/* Level badge */}
          <div className="relative inline-flex items-center justify-center mb-4">
            {/* Pulsing ring */}
            <div className="absolute w-28 h-28 rounded-full border-2 border-yellow-300/40
                            animate-[pulseRing_2s_ease-in-out_infinite]" />
            <div className="w-24 h-24 rounded-full bg-yellow-400/20 border-2 border-yellow-300/60
                            flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <p className="text-3xl font-display font-black text-yellow-300 leading-none">
                  {newLevel}
                </p>
                <p className="text-2xs text-yellow-200/80 font-semibold uppercase tracking-widest mt-0.5">
                  Level
                </p>
              </div>
            </div>
          </div>

          <p className="text-2xs font-semibold text-white/60 uppercase tracking-widest mb-1">
            ✦ Level Up! ✦
          </p>
          <h2 id="levelup-title"
              className="text-2xl font-display font-black text-white leading-tight">
            Luar Biasa!<br />
            <span className="text-yellow-300">Kamu naik level</span>
          </h2>
          <p className="text-sm text-white/70 mt-2">
            +{xpGained} XP diperoleh dari sesi ini
          </p>
        </div>

        {/* Perks & CTA */}
        <div className="bg-surface px-6 py-6 space-y-4">
          {/* Perks */}
          <div className="space-y-2">
            <p className="text-2xs font-semibold text-ghost uppercase tracking-wider">
              Yang kamu dapatkan
            </p>
            <div className="space-y-2">
              {defaultPerks.map((p, i) => (
                <div key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                             bg-canvas border border-ring">
                  <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
                    <p.icon size={13} className="text-brand-600" />
                  </div>
                  <span className="text-sm text-ink font-medium">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* XP to next level */}
          {nextLevelXP && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-2xs text-ghost">
                <span>Progress ke Level {newLevel + 1}</span>
                <span className="font-mono">0 / {nextLevelXP} XP</span>
              </div>
              <div className="h-1.5 rounded-full bg-ring overflow-hidden">
                <div className="h-full w-0 rounded-full"
                     style={{ background: 'linear-gradient(90deg,#7C3AED,#5B21B6)' }} />
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2
                       py-3 rounded-xl bg-brand-gradient text-white
                       text-sm font-semibold shadow-card
                       hover:shadow-panel hover:scale-[1.02] transition-all"
          >
            Lanjutkan <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
