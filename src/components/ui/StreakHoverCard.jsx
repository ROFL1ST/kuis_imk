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

const StreakHoverCard = ({
  streakCount = 0,
  activityDates = [],
  missions = [],
  onOpenCalendar,
  dailyStreak,
}) => {
  const getJakartaDateString = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  // Helper cek hari sebelumnya
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

      // Logic Frozen Pintar: Hanya beku jika hari sebelumnya aktif
      const isFrozen = isPast && !isActive && isPreviousDayActive(dateStr);

      days.push({
        label: d.toLocaleDateString("id-ID", { weekday: "narrow" }),
        isActive: isActive,
        isToday: isToday,
        isFrozen: isFrozen,
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
    <div className="absolute top-full mt-3 right-0 w-[360px] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 transform origin-top-right animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
      <div className="absolute -top-2 right-8 w-4 h-4 bg-orange-50 border-t border-l border-orange-100 transform rotate-45 z-0"></div>

      {/* HEADER */}
      <div className="relative z-10 bg-gradient-to-r from-orange-50 to-orange-100/50 p-5 border-b border-orange-100">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border-4 border-white ${
                streakCount > 0
                  ? "bg-gradient-to-br from-orange-400 to-red-500"
                  : "bg-slate-200"
              }`}
            >
              <Flame
                className={`w-8 h-8 ${
                  streakCount > 0
                    ? "text-white animate-pulse fill-white"
                    : "text-slate-400"
                }`}
              />
            </div>

            <div>
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">
                Streak Saat Ini
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-800 leading-none">
                  {streakCount}
                </span>
                <span className="text-sm font-bold text-slate-500">Hari</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-white text-orange-500 px-2 py-1 rounded-full shadow-sm border border-orange-100 flex items-center gap-1">
            <CalendarDays size={10} /> 7 Hari Terakhir
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-5">
        {/* REWARD SECTION */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-purple-500" />
              <span className="text-xs font-bold text-slate-700">
                Hadiah Besar (Hari ke-{nextMilestone})
              </span>
            </div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
              {daysLeft === 0 ? "Hari ini!" : `${daysLeft} hari lagi`}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${milestoneProgress}%` }}
            ></div>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Riwayat Aktivitas
            </span>
          </div>
          <div className="flex justify-between items-start">
            {weekData.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 relative overflow-hidden
                  ${
                    day.isActive
                      ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
                      : day.isFrozen
                      ? "bg-frozen"
                      : day.isToday
                      ? "bg-white border-slate-300 border-dashed text-slate-300"
                      : "bg-transparent border-slate-100 text-slate-200"
                  }`}
                >
                  {day.isActive ? (
                    <Check size={14} strokeWidth={4} />
                  ) : day.isFrozen ? (
                    <Snowflake size={14} className="animate-pulse" />
                  ) : (
                    day.date
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold uppercase ${
                    day.isToday ? "text-orange-500" : "text-slate-300"
                  }`}
                >
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MISSIONS */}
        {missions.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-600">
                Misi Harian
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                {completedMissions}/{totalMissions}
              </span>
              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${missionProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <button
          onClick={onOpenCalendar}
          className="w-full py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all hover:shadow-sm group"
        >
          Lihat Kalender Penuh{" "}
          <ChevronRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};

export default StreakHoverCard;
