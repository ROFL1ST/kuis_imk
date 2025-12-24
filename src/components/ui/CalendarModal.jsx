import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Check, Flame, Trophy, Calendar, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CalendarModal = ({ isOpen, onClose, activityDates = [], currentStreak = 0 }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  // State baru untuk arah animasi (1 = Next/Kanan, -1 = Prev/Kiri)
  const [direction, setDirection] = useState(0); 

  if (!isOpen) return null;

  const getJakartaDateString = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
  };

  // --- LOGIC KALENDER ---
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(displayDate);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

  // --- LOGIC STATISTIK ---
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const activeDaysInMonth = activityDates.filter(date => date.startsWith(currentMonthPrefix)).length;
  const monthlyPercentage = Math.round((activeDaysInMonth / daysInMonth) * 100);

  let motivationText = "Ayo mulai petualanganmu!";
  let barColor = "bg-slate-300";
  if (monthlyPercentage > 0) { motivationText = "Awal yang bagus!"; barColor = "bg-orange-300"; }
  if (monthlyPercentage >= 30) { motivationText = "Konsistensi mulai terbentuk! 👍"; barColor = "bg-orange-400"; }
  if (monthlyPercentage >= 60) { motivationText = "Kamu makin rajin nih! 🔥"; barColor = "bg-orange-500"; }
  if (monthlyPercentage >= 90) { motivationText = "Luar biasa! Hampir sempurna! 🚀"; barColor = "bg-purple-500"; }
  if (monthlyPercentage === 100) { motivationText = "Sempurna! Kamu Legenda! 🏆"; barColor = "bg-purple-600"; }

  const totalActiveDays = activityDates.length;

  // --- HANDLERS DENGAN ANIMASI ---
  const prevMonth = () => {
    setDirection(-1); // Set arah ke kiri
    setDisplayDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setDirection(1); // Set arah ke kanan
    setDisplayDate(new Date(year, month + 1, 1));
  };

  const isDateActive = (dateObj) => {
    if (!dateObj) return false;
    return activityDates.includes(getJakartaDateString(dateObj));
  };
  const isToday = (dateObj) => {
    if (!dateObj) return false;
    return getJakartaDateString(dateObj) === getJakartaDateString(new Date());
  };

  // --- VARIANTS ANIMASI SLIDE ---
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 20 : -20, // Masuk dari kanan jika next, kiri jika prev
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -20 : 20, // Keluar ke kiri jika next, kanan jika prev
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-sm md:max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* HEADER MODAL */}
        <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center shrink-0 z-10 relative">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200 text-orange-500 shadow-sm">
                    <Flame size={20} fill="currentColor" className="animate-pulse" />
                </div>
                <div>
                    <h2 className="font-extrabold text-slate-800 text-base leading-tight">Streak Calendar</h2>
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">{currentStreak} Hari Beruntun</p>
                </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition text-slate-400 hover:text-slate-600">
                <X size={20} />
            </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto custom-scrollbar relative">
            
            {/* BAGIAN 1: KALENDER (DIBUNGKUS ANIMASI) */}
            <div className="p-6 pb-2">
                {/* Header Kontrol Bulan (Tetap Static agar tidak ikut gerak, hanya teks bulan yg gerak kalau mau, tapi disini kita gerakkan isinya saja agar layout stabil) */}
                <div className="flex justify-between items-center mb-6 px-1">
                    <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center border rounded-xl hover:bg-slate-50 text-slate-500 transition shadow-sm active:scale-95"><ChevronLeft size={20}/></button>
                    
                    {/* AnimatePresence untuk Nama Bulan */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.h3 
                            key={monthName} // Key berubah -> trigger animasi
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

                    <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center border rounded-xl hover:bg-slate-50 text-slate-500 transition shadow-sm active:scale-95"><ChevronRight size={20}/></button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3">
                    {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                {/* ANIMASI GRID TANGGAL */}
                <div className="min-h-[240px]"> {/* Min-height agar modal tidak 'jump' saat ganti bulan */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div 
                            key={displayDate.toISOString()} // Key unik per bulan
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2 }} // Durasi cepat agar snappy
                            className="grid grid-cols-7 gap-2"
                        >
                            {days.map((dateObj, idx) => {
                                if (!dateObj) return <div key={idx} />; 

                                const active = isDateActive(dateObj);
                                const today = isToday(dateObj);

                                return (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div className={`
                                            w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all cursor-default relative
                                            ${active 
                                                ? "bg-gradient-to-b from-orange-400 to-orange-500 border-orange-500 text-white shadow-md shadow-orange-200" 
                                                : today 
                                                    ? "bg-white border-orange-300 border-dashed text-orange-500" 
                                                    : "bg-transparent border-transparent text-slate-600 hover:bg-slate-50"
                                            }
                                        `}>
                                            {active ? <Check size={16} strokeWidth={4} /> : dateObj.getDate()}
                                            {today && !active && <div className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full -bottom-1"></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* BAGIAN 2: STATISTIK BULANAN (IKUT ANIMASI GANTI BULAN) */}
            <div className="px-6 pb-6">
                 <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={displayDate.toISOString() + "-stats"}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2, delay: 0.05 }} // Sedikit delay agar efek 'cascade'
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4"
                    >
                        {/* Progress Bar Bulan Ini */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600">Keaktifan Bulan Ini</span>
                                </div>
                                <span className="text-xs font-black text-slate-800">{activeDaysInMonth} / {daysInMonth} Hari</span>
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

                        {/* Stats Bawah */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-yellow-500">
                                    <Trophy size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Main</p>
                                    <p className="text-sm font-black text-slate-800">{totalActiveDays} Hari</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-blue-500">
                                    <TrendingUp size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Akurasi Bulanan</p>
                                    <p className="text-sm font-black text-slate-800">{monthlyPercentage}%</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

        </div>

        {/* FOOTER KECIL */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center shrink-0 z-10 relative">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Keep the fire burning! 🔥
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarModal;