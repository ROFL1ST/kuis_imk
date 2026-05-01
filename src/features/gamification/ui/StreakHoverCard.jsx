import { useState, useRef } from 'react';
import { Flame, CalendarDays, Trophy } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useOnClickOutside } from '@/shared/hooks/useOnClickOutside';

/**
 * Streak trigger pill + hover/click popover showing weekly activity.
 * @param {number}    streak          - current streak days
 * @param {boolean[]} weekActivity    - 7 booleans Mon–Sun
 * @param {number}    longestStreak   - all-time best
 */
export function StreakHoverCard({ streak, weekActivity = [], longestStreak }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const isHot = streak >= 7;

  return (
    <div ref={ref} className="relative inline-block">

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
          'text-sm font-semibold tabular transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire',
          isHot
            ? 'bg-fire/10 text-fire border border-fire/25 hover:bg-fire/15 shadow-glow-fire'
            : 'bg-orange-50 text-orange-500 border border-orange-200 hover:bg-orange-100'
        )}
      >
        <Flame
          size={15}
          strokeWidth={2}
          className={cn(isHot && 'animate-pulse-glow')}
          fill={isHot ? 'currentColor' : 'none'}
        />
        {streak}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30
                        w-64 bg-streak-card rounded-2xl border border-orange-200/60
                        shadow-panel animate-fade-up">
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2
                          w-3 h-3 bg-amber-50 border-r border-b border-orange-200/60 rotate-45" />

          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fire-gradient
                              flex items-center justify-center shadow-glow-fire">
                <Flame size={20} fill="white" className="text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-widest">Current streak</p>
                <p className="text-xl font-display font-bold text-ink tabular">
                  {streak} <span className="text-base font-sans font-medium text-sub">days</span>
                </p>
              </div>
            </div>

            {/* Weekly grid */}
            <div>
              <p className="text-2xs text-ghost font-medium mb-2 flex items-center gap-1">
                <CalendarDays size={11} /> This week
              </p>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  const active = weekActivity[i] ?? false;
                  const isToday = i === new Date().getDay() - 1;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all',
                        active
                          ? 'bg-fire-gradient text-white shadow-[0_2px_6px_rgba(249,115,22,0.4)]'
                          : 'bg-white/60 border border-orange-100 text-ghost',
                        isToday && !active && 'border-fire/40 ring-1 ring-fire/30'
                      )}>
                        {active ? <Flame size={12} fill="white" strokeWidth={0} /> : null}
                      </div>
                      <span className={cn(
                        'text-2xs',
                        isToday ? 'text-fire font-semibold' : 'text-ghost'
                      )}>{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Best streak */}
            <div className="flex items-center justify-between pt-1 border-t border-orange-200/60">
              <div className="flex items-center gap-1.5 text-xs text-sub">
                <Trophy size={12} className="text-gold" />
                Personal best
              </div>
              <span className="text-sm font-semibold text-ink tabular">{longestStreak} days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
