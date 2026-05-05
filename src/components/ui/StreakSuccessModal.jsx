// src/components/ui/StreakSuccessModal.jsx

import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Zap, CalendarDays } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const StreakSuccessModal = ({ isOpen, onClose, streakCount = 0, type = "extended" }) => {
  const { t } = useLanguage();

  const isRecovered = type === "recovered";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden border text-center"
            style={{
              background: "var(--color-surface-900)",
              borderColor: isRecovered
                ? "rgb(14 165 233 / 0.30)"
                : "rgb(249 115 22 / 0.30)",
              boxShadow: isRecovered
                ? "0 0 48px rgb(14 165 233 / 0.15), 0 24px 60px rgba(0,0,0,0.5)"
                : "0 0 48px rgb(249 115 22 / 0.15), 0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Top bar */}
            <div
              className="h-1 w-full"
              style={{
                background: isRecovered
                  ? "linear-gradient(90deg, #0ea5e9, #38bdf8)"
                  : "linear-gradient(90deg, #f97316, #ef4444)",
              }}
            />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border"
              style={{
                background: "var(--color-surface-800)",
                borderColor: "var(--color-surface-700)",
                color: "var(--color-surface-400)",
              }}
            >
              <X size={15} />
            </button>

            <div className="p-8">
              {/* Icon */}
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: 2, duration: 0.4, delay: 0.3 }}
                className="w-24 h-24 rounded-3xl mx-auto mb-5 flex items-center justify-center"
                style={{
                  background: isRecovered
                    ? "linear-gradient(135deg, #0ea5e9, #38bdf8)"
                    : "linear-gradient(135deg, #f97316, #ef4444)",
                  boxShadow: isRecovered
                    ? "0 12px 36px rgb(14 165 233 / 0.35)"
                    : "0 12px 36px rgb(249 115 22 / 0.35)",
                }}
              >
                {isRecovered ? (
                  <CalendarDays size={44} className="text-white" />
                ) : (
                  <Flame size={44} className="text-white fill-white" />
                )}
              </motion.div>

              <p
                className="text-[10px] font-black uppercase tracking-widest mb-2"
                style={{ color: isRecovered ? "#38bdf8" : "#fb923c" }}
              >
                {isRecovered
                  ? t("streak.recovered") || "Streak Dipulihkan!"
                  : t("streak.extended") || "Streak Diperpanjang!"}
              </p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                className="text-7xl font-black tracking-tighter mb-1"
                style={{ color: "var(--color-surface-50)" }}
              >
                {streakCount}
              </motion.div>

              <p className="text-xs font-bold mb-6" style={{ color: "var(--color-surface-400)" }}>
                {t("streak.days") || "Hari Berturut-turut"}
              </p>

              <div
                className="flex items-center justify-center gap-2 p-3 rounded-xl mb-6 border"
                style={{
                  background: "var(--color-surface-800)",
                  borderColor: "var(--color-surface-700)",
                }}
              >
                <Zap size={13} fill="#fbbf24" style={{ color: "#fbbf24" }} />
                <span className="text-xs font-bold" style={{ color: "var(--color-surface-300)" }}>
                  {isRecovered
                    ? t("streak.recoveredDesc") || "XP Streak kamu kembali!"
                    : t("streak.extendedDesc") || "Pertahankan momentummu!"}
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-black text-white cursor-pointer border-none"
                style={{
                  background: isRecovered
                    ? "linear-gradient(135deg, #0ea5e9, #38bdf8)"
                    : "linear-gradient(135deg, #f97316, #ef4444)",
                  boxShadow: isRecovered
                    ? "0 8px 24px rgb(14 165 233 / 0.25)"
                    : "0 8px 24px rgb(249 115 22 / 0.25)",
                }}
              >
                {t("streak.cta") || "Keren! 🔥"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakSuccessModal;
