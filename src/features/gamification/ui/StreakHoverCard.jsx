// src/features/gamification/ui/StreakHoverCard.jsx
// Premium streak display: pill trigger + rich hover card.
// Shows current streak, weekly calendar heatmap, and freeze status.
import { useState, useRef } from 'react';
import { Flame, Snowflake, Zap, Calendar } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const DAY_LABELS = ['S', 'M', 'T', 'R', 'J', 'S', 'M'];

function StreakDay({ active, isToday, dayLabel }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xs text-ghost font-medium">{dayLabel}</span>
      <div className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
        isToday && 'ring-2 ring-brand-400 ring-offset-1',
        active
          ? 'bg-fire-gradient'
          : 'bg-canvas border border-ring',
      )}>
        {active
          ? <Flame size={13} className="text-white" />
          : <span className="w-1.5 h-1.5 rounded-full bg-ring" />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Streak pill (trigger)
// ---------------------------------------------------------------------------
function StreakPill({ streak, isFrozen, onClick }) {
  const isHot = streak >= 7;
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'border text-sm font-semibold transition-all',
        'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        isFrozen
          ? 'bg-frozen border-cyan-300 text-cyan-700'
          : isHot
            ? 'bg-orange-50 border-orange-300 text-orange-600'
            : 'bg-canvas border-ring text-sub',
      )}
      aria-haspopup="true"
      aria-label={`Streak ${streak} hari. Klik untuk detail.`}
    >
      {isFrozen
        ? <Snowflake size={14} className="text-cyan-500" />
        : <Flame    size={14} className={isHot ? 'text-orange-500' : 'text-ghost'} />}
      <span className="font-mono tabular-nums">{streak}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Hover card
// ---------------------------------------------------------------------------
function StreakCard({ streak, weekData, isFrozen, freezesLeft, longestStreak, onClose }) {
  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                 w-72 bg-surface rounded-2xl border border-ring shadow-panel
                 animate-[slideDown_0.2s_cubic-bezier(0.16,1,0.3,1)]"
      role="tooltip"
    >
      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translate(-50%,-8px); }
          to   { opacity:1; transform:translate(-50%,0); }
        }
      `}</style>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-ring">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isFrozen
              ? <Snowflake size={18} className="text-cyan-500" />
              : <Flame     size={18} className="text-orange-500" />}
            <div>
              <p className="text-xs font-semibold text-ghost uppercase tracking-wider">
                {isFrozen ? 'Streak Dibekukan' : 'Streak Aktif'}
              </p>
              <p className="text-2xl font-display font-bold text-ink tabular-nums">
                {streak}
                <span className="text-sm font-normal text-ghost ml-1">hari</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xs text-ghost">Terpanjang</p>
            <p className="text-sm font-bold text-ink tabular-nums">{longestStreak ?? streak} hr</p>
          </div>
        </div>
      </div>

      {/* Weekly calendar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar size={11} className="text-ghost" />
          <p className="text-2xs font-semibold text-ghost uppercase tracking-wider">7 Hari Terakhir</p>
        </div>
        <div className="flex justify-between">
          {DAY_LABELS.map((d, i) => (
            <StreakDay
              key={i}
              dayLabel={d}
              active={weekData?.[i] ?? false}
              isToday={i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)}
            />
          ))}
        </div>
      </div>

      {/* Freeze info */}
      {(isFrozen || (freezesLeft ?? 0) > 0) && (
        <div className="mx-4 mb-4 px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-200">
          <div className="flex items-center gap-2">
            <Snowflake size={13} className="text-cyan-500 shrink-0" />
            <p className="text-xs text-cyan-800">
              {isFrozen
                ? `Streak dibekukan hari ini. Sisa bekuan: ${freezesLeft ?? 0}×`
                : `${freezesLeft} freeze tersisa — gunakan saat kamu tidak bisa latihan`
              }
            </p>
          </div>
        </div>
      )}

      {/* XP tip */}
      <div className="mx-4 mb-4 px-3 py-2 rounded-xl bg-brand-50 border border-brand-100">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-brand-500 shrink-0" />
          <p className="text-xs text-brand-800">
            Pertahankan streak untuk bonus XP harian!
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function StreakHoverCard({
  streak       = 0,
  weekData     = [true, true, false, true, true, true, false],
  isFrozen     = false,
  freezesLeft  = 2,
  longestStreak,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click
  function handleBlur(e) {
    if (!wrapRef.current?.contains(e.relatedTarget)) setOpen(false);
  }

  return (
    <div
      ref={wrapRef}
      className="relative inline-block"
      onBlur={handleBlur}
    >
      <StreakPill
        streak={streak}
        isFrozen={isFrozen}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <StreakCard
          streak={streak}
          weekData={weekData}
          isFrozen={isFrozen}
          freezesLeft={freezesLeft}
          longestStreak={longestStreak}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
