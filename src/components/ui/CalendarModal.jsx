// src/components/ui/CalendarModal.jsx

import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Flame,
  Trophy,
  Calendar,
  TrendingUp,
  Snowflake,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const CalendarModal = ({
  isOpen,
  onClose,
  activityDates = [],
  currentStreak = 0,
}) => {
  const { t, language } = useLanguage();
  const [displayDate, setDisplayDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  if (!isOpen) return null;

  const getJakartaDateString = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  // Helper: Ambil tanggal kemarin (untuk cek streak putus)
  const getPreviousDayString = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return getJakartaDateString(date);
  };

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  // Use appropriate locale for month name
  const localeMap = {
    id: "id-ID",
    en: "en-US",
    jp: "ja-JP",
  };
  const currentLocale = localeMap[language] || "id-ID";

  const monthName = new Intl.DateTimeFormat(currentLocale, {
    month: "long",
    year: "numeric",
  }).format(displayDate);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const activeDaysInMonth = activityDates.filter((date) =>
    date.startsWith(currentMonthPrefix)
  ).length;
  const monthlyPercentage = Math.round((activeDaysInMonth / daysInMonth) * 100);

  let motivationText = t("modals.motivation.start");
  let barColor = "bg-slate-300";
  if (monthlyPercentage > 0) {
    motivationText = t("modals.motivation.good");
    barColor = "bg-orange-300";
  }
  if (monthlyPercentage >= 30) {
    motivationText = t("modals.motivation.consistent");
    barColor = "bg-orange-400";
  }
  if (monthlyPercentage >= 60) {
    motivationText = t("modals.motivation.diligent");
    barColor = "bg-orange-500";
  }
  if (monthlyPercentage >= 90) {
    motivationText = t("modals.motivation.perfect");
    barColor = "bg-purple-500";
  }
  if (monthlyPercentage === 100) {
    motivationText = t("modals.motivation.legend");
    barColor = "bg-purple-600";
  }

  const totalActiveDays = activityDates.length;

  const prevMonth = () => {
    setDirection(-1);
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setDirection(1);
    setDisplayDate(new Date(year, month + 1, 1));
  };

  const isDateActive = (dateStr) => {
    return activityDates.includes(dateStr);
  };

  const isToday = (dateStr) => {
    return dateStr === getJakartaDateString(new Date());
  };

  // --- LOGIKA UTAMA: TENTUKAN STATUS HARI ---
  const getDayStatus = (dateObj) => {
    if (!dateObj) return { type: "empty" };

    const dateStr = getJakartaDateString(dateObj);
    const todayStr = getJakartaDateString(new Date());

    // 1. Hari Aktif (Api Menyala)
    if (isDateActive(dateStr)) {
      return { type: "active" };
    }

    // 2. Hari Ini (Belum Dikerjakan)
    if (dateStr === todayStr) {
      return { type: "today_inactive" };
    }

    // 3. Hari Lewat (Cek apakah 'Frozen' atau 'Padam')
    if (dateStr < todayStr) {
      // Cek hari sebelumnya. Jika hari sebelumnya AKTIF, maka hari ini adalah TITIK PUTUS (Frozen).
      // Jika hari sebelumnya TIDAK AKTIF, maka api sudah padam sebelumnya (Inactive Normal).
      const prevDayStr = getPreviousDayString(dateStr);
      if (isDateActive(prevDayStr)) {
        return { type: "frozen" }; // Efek Es
      }
      return { type: "inactive_past" }; // Biasa
    }

    return { type: "future" };
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -20 : 20,
      opacity: 0,
    }),
  };

  const weekDays = ["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"]; // This should ideally be localized too, but for now fixed is partial acceptable, or map it.
  // Mapping weekdays based on language could be better but let's stick to simple first or use Intl.
  // Using Intl for weekdays:
  const getWeekDays = (locale) => {
    const baseDate = new Date(2023, 0, 2); // Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(
        new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
          new Date(2023, 0, 2 + i)
        )
      );
    }
    return days;
  };
  const currentWeekDays = getWeekDays(currentLocale);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-sm md:max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center shrink-0 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200 text-orange-500 shadow-sm">
              <Flame size={20} fill="currentColor" className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base leading-tight">
                {t("modals.streakCalendarTitle")}
              </h2>
              <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">
                {currentStreak} {t("modals.streakCountLabel")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto custom-scrollbar relative">
          <div className="p-6 pb-2">
            <div className="flex justify-between items-center mb-6 px-1">
              <button
                onClick={prevMonth}
                className="w-9 h-9 flex items-center justify-center border rounded-xl hover:bg-slate-50 text-slate-500 transition shadow-sm active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.h3
                  key={monthName}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="font-black text-lg text-slate-800 capitalize tracking-tight"
                >
                  {monthName}
                </motion.h3>
              </AnimatePresence>

              <button
                onClick={nextMonth}
                className="w-9 h-9 flex items-center justify-center border rounded-xl hover:bg-slate-50 text-slate-500 transition shadow-sm active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-3">
              {currentWeekDays.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="min-h-[240px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={displayDate.toISOString()}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-7 gap-2"
                >
                  {days.map((dateObj, idx) => {
                    if (!dateObj) return <div key={idx} />;

                    const status = getDayStatus(dateObj);
                    let containerClass =
                      "bg-transparent border-transparent text-slate-300";
                    let content = dateObj.getDate();
                    let showMarker = false;

                    switch (status.type) {
                      case "active":
                        containerClass =
                          "bg-gradient-to-b from-orange-400 to-orange-500 border-orange-500 text-white shadow-md shadow-orange-200";
                        content = <Check size={16} strokeWidth={4} />;
                        break;
                      case "frozen":
                        containerClass = "bg-frozen";
                        content = (
                          <Snowflake size={16} className="animate-pulse" />
                        );
                        break;
                      case "today_inactive":
                        containerClass =
                          "bg-white border-orange-300 border-dashed text-orange-500";
                        showMarker = true;
                        break;
                      case "inactive_past":
                        containerClass =
                          "bg-slate-50 border-slate-100 text-slate-400";
                        break;
                      default:
                        containerClass =
                          "bg-transparent border-transparent text-slate-600 hover:bg-slate-50";
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`
                                            w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all cursor-default relative overflow-hidden
                                            ${containerClass}
                                        `}
                        >
                          {content}
                          {showMarker && (
                            <div className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full -bottom-1"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* STATS */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={displayDate.toISOString() + "-stats"}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, delay: 0.05 }}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4"
              >
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">
                        {t("modals.monthlyActivity")}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-800">
                      {activeDaysInMonth} / {daysInMonth} {t("modals.days")}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${monthlyPercentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${barColor}`}
                    ></motion.div>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1.5 text-right italic">
                    "{motivationText}"
                  </p>
                </div>

                <div className="h-px bg-slate-200 border-dashed"></div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-yellow-500">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {t("modals.totalPlay")}
                      </p>
                      <p className="text-sm font-black text-slate-800">
                        {totalActiveDays} {t("modals.days")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-blue-500">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {t("modals.monthlyAccuracy")}
                      </p>
                      <p className="text-sm font-black text-slate-800">
                        {monthlyPercentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center shrink-0 z-10 relative">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {t("modals.keepBurning")}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarModal;
