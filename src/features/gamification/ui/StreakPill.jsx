import { Flame } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/**
 * Compact streak badge for the sidebar bottom.
 * Props: streak (number)
 */
export function StreakPill({ streak }) {
  const isHot = streak >= 7;
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold tabular',
        isHot
          ? 'bg-orange-50 text-fire border border-orange-200'
          : 'bg-canvas text-sub border border-ring'
      )}
    >
      <Flame
        size={15}
        strokeWidth={2}
        className={cn(isHot && 'animate-pulse-glow')}
        fill={isHot ? 'currentColor' : 'none'}
      />
      <span>{streak} day streak</span>
    </div>
  );
}
