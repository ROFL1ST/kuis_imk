// src/components/ui/LevelUpModal.jsx

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Star, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

const LevelUpModal = ({ isOpen, onClose, newLevel }) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#f97316", "#eab308", "#a78bfa", "#38bdf8", "#4ade80"],
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.45, duration: 0.6 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden border text-center"
            style={{
              background: "var(--color-surface-900)",
              borderColor: "rgb(234 179 8 / 0.30)",
              boxShadow: "0 0 60px rgb(234 179 8 / 0.20), 0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Glow top */}
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg, #f97316, #eab308, #a78bfa)" }}
            />

            <div className="p-8">
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, #f97316, #eab308)",
                  boxShadow: "0 12px 40px rgb(234 179 8 / 0.40)",
                }}
              >
                <Trophy className="text-white" size={44} fill="currentColor" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-3xl"
                  style={{ background: "linear-gradient(135deg, #f97316, #eab308)", opacity: 0.3 }}
                />
              </motion.div>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, type: "spring", bounce: 0.6 }}
                  >
                    <Star size={20} fill="#eab308" style={{ color: "#eab308" }} />
                  </motion.div>
                ))}
              </div>

              <p
                className="text-[11px] font-black uppercase tracking-widest mb-2"
                style={{ color: "#fb923c" }}
              >
                {t("levelUp.title") || "Level Up!"}
              </p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                className="text-7xl font-black tracking-tighter mb-1"
                style={{ color: "var(--color-surface-50)" }}
              >
                {newLevel}
              </motion.div>

              <p className="text-sm font-medium mb-6" style={{ color: "var(--color-surface-400)" }}>
                {t("levelUp.desc") || "Kamu telah mencapai level baru!"}
              </p>

              {/* Perks strip */}
              <div
                className="flex items-center justify-center gap-3 p-3 rounded-xl mb-6 border"
                style={{
                  background: "var(--color-surface-800)",
                  borderColor: "var(--color-surface-700)",
                }}
              >
                <Zap size={14} fill="#fbbf24" style={{ color: "#fbbf24" }} />
                <span className="text-xs font-bold" style={{ color: "var(--color-surface-300)" }}>
                  {t("levelUp.perk") || "Fitur & tantangan baru terbuka!"}
                </span>
                <Sparkles size={14} style={{ color: "#a78bfa" }} />
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-black text-white cursor-pointer border-none"
                style={{
                  background: "linear-gradient(135deg, #f97316, #eab308)",
                  boxShadow: "0 8px 24px rgb(234 179 8 / 0.30)",
                }}
              >
                {t("levelUp.cta") || "Lanjutkan! 🚀"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;
