import React from "react";
import { Flame, Check, CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const StreakHoverCard = ({
  streakCount,
  activityDates = [],
  onOpenCalendar,
}) => {

  const getJakartaDateString = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };
  const getLast7Days = () => {
    const days = [];
    const today = new Date(); 
    const jakartaTodayStr = getJakartaDateString(today);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      
    
      const dateStr = getJakartaDateString(d); 
      
      const isActive = activityDates.includes(dateStr);
      
      days.push({
        label: d.toLocaleDateString("id-ID", { weekday: "narrow" }), 
        isActive: isActive,
        // Cek "Hari Ini" dengan membandingkan string Jakarta
        isToday: dateStr === jakartaTodayStr, 
        date: d.getDate()
      });
    }
    return days;
  };

  const weekData = getLast7Days();

  // Status text berdasarkan streak
  const getStatusText = () => {
    if (streakCount >= 30) return "Kamu on fire! 🔥";
    if (streakCount >= 7) return "Seminggu penuh! 🚀";
    if (streakCount > 0) return "Pertahankan apimu!";
    return "Mulai streak hari ini!";
  };

  return (
    <div className="absolute top-full mt-3 right-0 w-[340px] bg-white rounded-3xl shadow-2xl border border-slate-200 p-0 z-50 transform origin-top-right animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
      {/* Panah Segitiga */}
      <div className="absolute -top-2 right-8 w-4 h-4 bg-orange-50 border-t border-l border-orange-100 transform rotate-45 z-0"></div>

      {/* Header (Gradient Background) */}
      <div className="relative z-10 bg-gradient-to-r from-orange-50 to-orange-100/50 p-5 border-b border-orange-100">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            Daily Streak
          </h4>
          <span className="text-[10px] font-bold bg-white text-orange-500 px-2 py-0.5 rounded-full shadow-sm border border-orange-100 flex items-center gap-1">
            <CalendarDays size={10} /> Minggu Ini
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white ${
                streakCount > 0
                  ? "bg-gradient-to-br from-orange-400 to-red-500"
                  : "bg-slate-200"
              }`}
            >
              <Flame
                className={`w-9 h-9 ${
                  streakCount > 0
                    ? "text-white animate-pulse fill-white"
                    : "text-slate-400"
                }`}
              />
            </div>
            {streakCount > 0 && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 border-2 border-white rounded-full p-1 shadow-sm">
                <Check size={10} className="text-white" strokeWidth={4} />
              </div>
            )}
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800 leading-none mb-1">
              {streakCount}
            </div>
            <p className="text-sm font-bold text-slate-500">
              {getStatusText()}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-5 bg-white">
        <div className="flex justify-between items-start mb-2">
          {weekData.map((day, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 group cursor-default relative"
            >
              {/* Tooltip Tanggal */}

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 relative
                        ${
                          day.isActive
                            ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200 scale-110"
                            : day.isToday
                            ? "bg-white border-slate-300 border-dashed text-slate-300"
                            : "bg-transparent border-slate-100 text-slate-200"
                        }
                    `}
              >
                {day.isActive ? <Check size={16} strokeWidth={4} /> : null}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  day.isToday ? "text-orange-500" : "text-slate-400"
                }`}
              >
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Action */}
      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <button
          onClick={onOpenCalendar}
          className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:shadow-sm group"
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
