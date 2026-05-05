// src/components/ui/StreakHoverCard.jsx

import React from "react";
import {
  Flame,
  Check,
  CalendarDays,
  ChevronRight,
  Gift,
  Target,
  Snowflake,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const StreakHoverCard = ({
  streakCount = 0,
  activityDates = [],
  missions = [],
  onOpenCalendar,
  dailyStreak,
}) => {
  const { t } = useLanguage();

  const getJakartaDateString = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const isPreviousDayActive = (currentDateStr) => {
    const date = new Date(currentDateStr);
    date.setDate(date.getDate() - 1);
    const prevDateStr = getJakartaDateString(date);
    return activityDates.includes(prevDateStr);
  };

  const getLast7Days = () => {
    const days = [];
    const now = new Date();
    const jakartaTodayStr = getJakartaDateString(now);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = getJakartaDateString(d);
      const isActive = activityDates.includes(dateStr);
      const isToday = dateStr === jakartaTodayStr;
      const isPast = dateStr < jakartaTodayStr;
      const isFrozen = isPast && !isActive && isPreviousDayActive(dateStr);
      days.push({
        label: d.toLocaleDateString("id-ID", { weekday: "narrow" }),
        isActive,
        isToday,
        isFrozen,
        date: d.getDate(),
      });
    }
    return days;
  };

  const weekData = getLast7Days();
  const daysCycle = 7;
  const currentProgress = dailyStreak % daysCycle;
  const daysLeft = daysCycle - currentProgress;
  const nextMilestone = dailyStreak + daysLeft;
  const milestoneProgress = (currentProgress / daysCycle) * 100;

  const completedMissions = missions.filter(
    (m) => m.status === "claimed" || m.status === "claimable"
  ).length;
  const totalMissions = missions.length;
  const missionProgress =
    totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  return (
    <div
      className="absolute top-full mt-3 right-0 w-[360px] rounded-2xl z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200 overflow-hidden border"
      style={{
        background: "var(--color-surface-900)",
        borderColor: "var(--color-surface-700)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Arrow */}
      <div
        className="absolute -top-2 right-8 w-4 h-4 rotate-45 border-t border-l z-0"
        style={{
          background: "var(--color-surface-900)",
          borderColor: "var(--color-surface-700)",
        }}
      />

      {/* HEADER */}
      <div
        className="relative z-10 p-5 border-b"
        style={{
          background: "linear-gradient(135deg, rgb(249 115 22 / 0.12) 0%, var(--color-surface-900) 100%)",
          borderColor: "var(--color-surface-700)",
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                streakCount > 0
                  ? "border-orange-500/30"
                  : ""
              }`}
              style={{
                background: streakCount > 0
                  ? "linear-gradient(135deg, #f97316, #ef4444)"
                  : "var(--color-surface-800)",
                borderColor: streakCount > 0 ? "rgb(249 115 22 / 0.3)" : "var(--color-surface-700)",
                boxShadow: streakCount > 0 ? "0 8px 24px rgb(249 115 22 / 0.30)" : "none",
              }}
            >
              <Flame
                className={`w-8 h-8 ${
                  streakCount > 0 ? "text-white fill-white animate-pulse" : ""
                }`}
                style={{ color: streakCount > 0 ? "#fff" : "var(--color-surface-500)" }}
              />
            </div>
            <div>
              <h4
                className="text-[10px] font-black uppercase tracking-widest mb-1"
                style={{ color: "#fb923c" }}
              >
                {t("modals.streakCurrent")}
              </h4>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-black leading-none"
                  style={{ color: "var(--color-surface-50)" }}
                >
                  {streakCount}
                </span>
                <span className="text-sm font-bold" style={{ color: "var(--color-surface-400)" }}>
                  Hari
                </span>
              </div>
            </div>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border"
            style={{
              background: "var(--color-surface-800)",
              color: "var(--color-surface-400)",
              borderColor: "var(--color-surface-700)",
            }}
          >
            <CalendarDays size={10} /> {t("modals.last7Days")}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-5">
        {/* REWARD PROGRESS */}
        <div
          className="rounded-xl p-3 border"
          style={{
            background: "var(--color-surface-800)",
            borderColor: "var(--color-surface-700)",
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Gift size={14} style={{ color: "#a78bfa" }} />
              <span className="text-xs font-bold" style={{ color: "var(--color-surface-300)" }}>
                {t("modals.bigPrize")} ({t("dashboard.day")} {nextMilestone})
              </span>
            </div>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
              style={{
                background: "rgb(139 92 246 / 0.15)",
                color: "#c084fc",
                borderColor: "rgb(139 92 246 / 0.25)",
              }}
            >
              {daysLeft === 0 ? t("modals.today") : `${daysLeft} ${t("modals.daysLeft")}`}
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--color-surface-700)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${milestoneProgress}%`, background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }}
            />
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div>
          <span
            className="text-[10px] font-bold uppercase block mb-3"
            style={{ color: "var(--color-surface-500)" }}
          >
            {t("modals.activityHistory")}
          </span>
          <div className="flex justify-between items-start">
            {weekData.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
                  style={{
                    background: day.isActive
                      ? "linear-gradient(135deg, #f97316, #ef4444)"
                      : day.isFrozen
                      ? "rgb(14 165 233 / 0.15)"
                      : day.isToday
                      ? "var(--color-surface-800)"
                      : "transparent",
                    borderColor: day.isActive
                      ? "rgb(249 115 22 / 0.50)"
                      : day.isFrozen
                      ? "rgb(14 165 233 / 0.30)"
                      : day.isToday
                      ? "var(--color-surface-600)"
                      : "var(--color-surface-800)",
                    color: day.isActive
                      ? "#fff"
                      : day.isFrozen
                      ? "#38bdf8"
                      : day.isToday
                      ? "var(--color-surface-300)"
                      : "var(--color-surface-600)",
                    boxShadow: day.isActive ? "0 4px 12px rgb(249 115 22 / 0.30)" : "none",
                  }}
                >
                  {day.isActive ? (
                    <Check size={14} strokeWidth={3} />
                  ) : day.isFrozen ? (
                    <Snowflake size={13} className="animate-pulse" />
                  ) : (
                    day.date
                  )}
                </div>
                <span
                  className="text-[9px] font-bold uppercase"
                  style={{
                    color: day.isToday ? "#fb923c" : "var(--color-surface-600)",
                  }}
                >
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MISSIONS */}
        {missions.length > 0 && (
          <div
            className="flex items-center justify-between pt-3 border-t"
            style={{ borderColor: "var(--color-surface-800)" }}
          >
            <div className="flex items-center gap-2">
              <Target size={14} style={{ color: "#60a5fa" }} />
              <span className="text-xs font-bold" style={{ color: "var(--color-surface-300)" }}>
                {t("dashboard.dailyMissions")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: "var(--color-surface-200)" }}>
                {completedMissions}/{totalMissions}
              </span>
              <div
                className="w-16 h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--color-surface-700)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${missionProgress}%`, background: "#3b82f6" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div
        className="p-3 border-t"
        style={{
          background: "var(--color-surface-950)",
          borderColor: "var(--color-surface-800)",
        }}
      >
        <button
          onClick={onOpenCalendar}
          className="w-full py-2.5 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer border group"
          style={{
            background: "var(--color-surface-800)",
            borderColor: "var(--color-surface-700)",
            color: "var(--color-surface-300)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-surface-700)";
            e.currentTarget.style.color = "var(--color-surface-100)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-surface-800)";
            e.currentTarget.style.color = "var(--color-surface-300)";
          }}
        >
          {t("modals.viewCalendar")}
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default StreakHoverCard;
