import { Flame } from "lucide-react";
import { clsx } from "clsx";

/**
 * StreakHoverCard — Shows current streak with a popover on hover.
 * Tier system: active (< 7d), hot (7–29d), legend (30d+)
 *
 * @param {number} streak        - Current streak count in days
 * @param {string} lastActiveLabel - Human-readable last active date
 */
export function StreakHoverCard({ streak = 0, lastActiveLabel = "Today" }) {
  const tier = streak >= 30 ? "legend" : streak >= 7 ? "hot" : "active";

  const nextMilestone = streak >= 30 ? null : streak >= 7 ? 30 : 7;
  const milestoneProgress = streak >= 30
    ? 100
    : streak >= 7
    ? ((streak - 7) / 23) * 100
    : (streak / 7) * 100;

  return (
    <div className="group relative inline-flex">
      {/* Trigger chip */}
      <button
        className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] text-sm font-bold transition-all cursor-pointer border-none",
          tier === "legend" && "gradient-streak text-white",
          tier === "hot"    && "text-orange-400",
          tier === "active" && "text-surface-300"
        )}
        style={tier !== "legend" ? {
          background: tier === "hot"
            ? "rgb(249 115 22 / 0.15)"
            : "var(--color-surface-800)",
          border: tier === "hot"
            ? "1px solid rgb(249 115 22 / 0.30)"
            : "1px solid var(--color-surface-700)",
        } : undefined}
        aria-label={`${streak} day streak`}
      >
        <Flame
          size={15}
          fill="currentColor"
          className={clsx(
            tier === "legend" && "text-white",
            tier === "hot"    && "text-orange-400",
            tier === "active" && "text-surface-400"
          )}
        />
        {streak}d
      </button>

      {/* Hover popover */}
      <div
        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52
                   card-glass p-4 space-y-3
                   opacity-0 scale-95 pointer-events-none
                   group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                   transition-all duration-200 z-10"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-surface-300 uppercase tracking-wide">
            Current Streak
          </span>
          <Flame size={14} className="text-orange-400" fill="currentColor" />
        </div>

        <p className="text-2xl font-black text-surface-50 leading-none">
          {streak}{" "}
          <span className="text-sm font-normal text-surface-400">days</span>
        </p>

        <p className="text-xs text-surface-500">Last active: {lastActiveLabel}</p>

        {/* Milestone progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-surface-500">
            <span>Next milestone</span>
            <span>{nextMilestone ? `${nextMilestone}d` : "MAX 🔥"}</span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--color-surface-800)" }}
          >
            <div
              className="h-full rounded-full gradient-streak transition-all duration-700"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
