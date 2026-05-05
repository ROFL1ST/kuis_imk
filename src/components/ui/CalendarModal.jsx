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

  const getPreviousDayString = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return getJakartaDateString(date);
  };

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const localeMap = { id: "id-ID", en: "en-US", jp: "ja-JP" };
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
  const activeDaysInMonth = activityDates.filter((d) =>
    d.startsWith(currentMonthPrefix)
  ).length;
  const monthlyPercentage = Math.round((activeDaysInMonth / daysInMonth) * 100);
  const totalActiveDays = activityDates.length;

  // bar color & motivation
  let motivationText = t("modals.motivation.start");
  let barGradient = "var(--color-surface-600)";
  if (monthlyPercentage > 0)   { motivationText = t("modals.motivation.good");       barGradient = "linear-gradient(90deg,#f97316,#fb923c)"; }
  if (monthlyPercentage >= 30) { motivationText = t("modals.motivation.consistent"); barGradient = "linear-gradient(90deg,#f97316,#ef4444)"; }
  if (monthlyPercentage >= 60) { motivationText = t("modals.motivation.diligent");   barGradient = "linear-gradient(90deg,#f97316,#ef4444)"; }
  if (monthlyPercentage >= 90) { motivationText = t("modals.motivation.perfect");    barGradient = "linear-gradient(90deg,#a78bfa,#818cf8)"; }
  if (monthlyPercentage === 100) { motivationText = t("modals.motivation.legend");   barGradient = "linear-gradient(90deg,#a78bfa,#6366f1)"; }

  const prevMonth = () => { setDirection(-1); setDisplayDate(new Date(year, month - 1, 1)); };
  const nextMonth = () => { setDirection(1);  setDisplayDate(new Date(year, month + 1, 1)); };
  const isDateActive = (dateStr) => activityDates.includes(dateStr);

  const getDayStatus = (dateObj) => {
    if (!dateObj) return { type: "empty" };
    const dateStr = getJakartaDateString(dateObj);
    const todayStr = getJakartaDateString(new Date());
    if (isDateActive(dateStr)) return { type: "active" };
    if (dateStr === todayStr) return { type: "today_inactive" };
    if (dateStr < todayStr) {
      const prevDayStr = getPreviousDayString(dateStr);
      if (isDateActive(prevDayStr)) return { type: "frozen" };
      return { type: "inactive_past" };
    }
    return { type: "future" };
  };

  const getWeekDays = (locale) => {
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2023, 0, 2 + i))
    );
  };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -20 : 20, opacity: 0 }),
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(12px)" }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-sm md:max-w-md rounded-[28px] overflow-hidden border flex flex-col max-h-[90vh]"
        style={{
          background: "var(--color-surface-900)",
          borderColor: "var(--color-surface-700)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full shrink-0" style={{ background: "linear-gradient(90deg,#f97316,#ef4444,#a78bfa)" }} />

        {/* HEADER */}
        <div
          className="p-5 border-b flex justify-between items-center shrink-0"
          style={{
            background: "linear-gradient(135deg, rgb(249 115 22 / 0.10) 0%, var(--color-surface-900) 100%)",
            borderColor: "var(--color-surface-800)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#f97316,#ef4444)",
                boxShadow: "0 8px 20px rgb(249 115 22 / 0.30)",
              }}
            >
              <Flame size={22} fill="white" className="text-white animate-pulse" />
            </div>
            <div>
              <h2 className="font-black text-base" style={{ color: "var(--color-surface-50)" }}>
                {t("modals.streakCalendarTitle")}
              </h2>
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#fb923c" }}>
                {currentStreak} {t("modals.streakCountLabel")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border cursor-pointer"
            style={{
              background: "var(--color-surface-800)",
              borderColor: "var(--color-surface-700)",
              color: "var(--color-surface-400)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENT — scrollable */}
        <div className="overflow-y-auto flex-1" style={{ scrollbarColor: "var(--color-surface-700) transparent" }}>
          <div className="p-6 pb-2">
            {/* Month nav */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={prevMonth}
                className="w-9 h-9 flex items-center justify-center rounded-xl border cursor-pointer transition-all"
                style={{
                  background: "var(--color-surface-800)",
                  borderColor: "var(--color-surface-700)",
                  color: "var(--color-surface-400)",
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.h3
                  key={monthName}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.2 }}
                  className="font-black text-lg capitalize tracking-tight"
                  style={{ color: "var(--color-surface-100)" }}
                >
                  {monthName}
                </motion.h3>
              </AnimatePresence>

              <button
                onClick={nextMonth}
                className="w-9 h-9 flex items-center justify-center rounded-xl border cursor-pointer transition-all"
                style={{
                  background: "var(--color-surface-800)",
                  borderColor: "var(--color-surface-700)",
                  color: "var(--color-surface-400)",
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {getWeekDays(currentLocale).map((d) => (
                <div key={d} className="text-center text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--color-surface-600)" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="min-h-[240px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={displayDate.toISOString()}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-7 gap-2"
                >
                  {days.map((dateObj, idx) => {
                    if (!dateObj) return <div key={idx} />;
                    const status = getDayStatus(dateObj);

                    let bg, border, color, shadow = "none";

                    switch (status.type) {
                      case "active":
                        bg = "linear-gradient(135deg,#f97316,#ef4444)";
                        border = "rgb(249 115 22 / 0.5)";
                        color = "#fff";
                        shadow = "0 4px 12px rgb(249 115 22 / 0.35)";
                        break;
                      case "frozen":
                        bg = "rgb(14 165 233 / 0.15)";
                        border = "rgb(14 165 233 / 0.30)";
                        color = "#38bdf8";
                        break;
                      case "today_inactive":
                        bg = "var(--color-surface-800)";
                        border = "#fb923c";
                        color = "#fb923c";
                        break;
                      case "inactive_past":
                        bg = "var(--color-surface-850, var(--color-surface-800))";
                        border = "var(--color-surface-800)";
                        color = "var(--color-surface-600)";
                        break;
                      default:
                        bg = "transparent";
                        border = "transparent";
                        color = "var(--color-surface-500)";
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-xs font-bold border-2 transition-all cursor-default relative"
                          style={{ background: bg, borderColor: border, color, boxShadow: shadow }}
                        >
                          {status.type === "active" ? (
                            <Check size={15} strokeWidth={3} />
                          ) : status.type === "frozen" ? (
                            <Snowflake size={14} className="animate-pulse" />
                          ) : (
                            dateObj.getDate()
                          )}
                          {status.type === "today_inactive" && (
                            <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full" style={{ background: "#fb923c" }} />
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
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2, delay: 0.05 }}
                className="rounded-2xl p-4 border space-y-4"
                style={{
                  background: "var(--color-surface-800)",
                  borderColor: "var(--color-surface-700)",
                }}
              >
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} style={{ color: "var(--color-surface-500)" }} />
                      <span className="text-xs font-bold" style={{ color: "var(--color-surface-400)" }}>
                        {t("modals.monthlyActivity")}
                      </span>
                    </div>
                    <span className="text-xs font-black" style={{ color: "var(--color-surface-100)" }}>
                      {activeDaysInMonth} / {daysInMonth} {t("modals.days")}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-700)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${monthlyPercentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: barGradient }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold mt-1.5 text-right italic" style={{ color: "var(--color-surface-500)" }}>
                    "{motivationText}"
                  </p>
                </div>

                <div className="h-px" style={{ background: "var(--color-surface-700)" }} />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-xl"
                      style={{ background: "rgb(234 179 8 / 0.15)", color: "#fbbf24" }}
                    >
                      <Trophy size={17} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase" style={{ color: "var(--color-surface-500)" }}>
                        {t("modals.totalPlay")}
                      </p>
                      <p className="text-sm font-black" style={{ color: "var(--color-surface-100)" }}>
                        {totalActiveDays} {t("modals.days")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-xl"
                      style={{ background: "rgb(59 130 246 / 0.15)", color: "#60a5fa" }}
                    >
                      <TrendingUp size={17} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase" style={{ color: "var(--color-surface-500)" }}>
                        {t("modals.monthlyAccuracy")}
                      </p>
                      <p className="text-sm font-black" style={{ color: "var(--color-surface-100)" }}>
                        {monthlyPercentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="p-3 border-t text-center shrink-0"
          style={{
            background: "var(--color-surface-950, var(--color-surface-900))",
            borderColor: "var(--color-surface-800)",
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-surface-600)" }}>
            {t("modals.keepBurning")}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarModal;
