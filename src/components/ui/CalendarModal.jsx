import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Check, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CalendarModal = ({ isOpen, onClose, activityDates = [], currentStreak = 0 }) => {
  const [displayDate, setDisplayDate] = useState(new Date());

  if (!isOpen) return null;

  const getJakartaDateString = (date) => {
    return new Intl.DateTimeFormat("en-CA", { // en-CA menghasilkan format YYYY-MM-DD
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
  // Mulai dari Senin (Senin=0, Minggu=6)
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

  // --- HANDLERS ---
  const prevMonth = () => setDisplayDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDisplayDate(new Date(year, month + 1, 1));

  // Cek Aktivitas (Cocokkan string YYYY-MM-DD Jakarta)
  const isDateActive = (dateObj) => {
    if (!dateObj) return false;
    const dateStr = getJakartaDateString(dateObj); 
    return activityDates.includes(dateStr);
  };

  // Cek Hari Ini (Cocokkan dengan Waktu Jakarta Sekarang)
  const isToday = (dateObj) => {
    if (!dateObj) return false;
    const dateStr = getJakartaDateString(dateObj);
    const todayStr = getJakartaDateString(new Date()); // Waktu sekarang di Jakarta
    return dateStr === todayStr;
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* HEADER MODAL */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center border border-orange-200 text-orange-500">
                    <Flame size={18} fill="currentColor" />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800 text-sm">Streak Calendar</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{currentStreak} Hari Beruntun</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-600">
                <X size={20} />
            </button>
        </div>

        {/* CONTROLS BULAN */}
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <button onClick={prevMonth} className="p-2 border rounded-xl hover:bg-slate-50 text-slate-500 transition"><ChevronLeft size={20}/></button>
                <h3 className="font-black text-lg text-slate-700 capitalize">{monthName}</h3>
                <button onClick={nextMonth} className="p-2 border rounded-xl hover:bg-slate-50 text-slate-500 transition"><ChevronRight size={20}/></button>
            </div>

            {/* GRID KALENDER */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-slate-300 uppercase tracking-wide">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((dateObj, idx) => {
                    if (!dateObj) return <div key={idx} />; // Spacer

                    const active = isDateActive(dateObj);
                    const today = isToday(dateObj);

                    return (
                        <div key={idx} className="flex flex-col items-center gap-1 group relative">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                                ${active 
                                    ? "bg-orange-500 border-orange-600 text-white shadow-md shadow-orange-200" 
                                    : today 
                                        ? "bg-white border-slate-300 border-dashed text-slate-400" 
                                        : "bg-transparent border-transparent text-slate-700 hover:bg-slate-50"
                                }
                            `}>
                                {active ? <Check size={18} strokeWidth={4} /> : dateObj.getDate()}
                            </div>
                            
                            {/* Tooltip Tanggal */}
                            {today && (
                                <span className="absolute -bottom-4 text-[9px] font-bold text-orange-500 uppercase tracking-tight">Hari Ini</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">Zona Waktu: Asia/Jakarta (WIB)</p>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarModal;