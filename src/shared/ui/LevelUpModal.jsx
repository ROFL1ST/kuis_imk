import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";

/**
 * LevelUpModal — Premium gamification reward overlay.
 * Auto-closes after 5s. Uses framer-motion spring animations.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {number}  newLevel
 * @param {number}  xpGained
 */
export function LevelUpModal({ isOpen, onClose, newLevel, xpGained }) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm card-glass p-8 text-center space-y-5 overflow-hidden"
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            {/* Background glow overlay */}
            <div className="absolute inset-0 gradient-levelup opacity-10 rounded-[var(--radius-card)] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-200 transition-colors cursor-pointer border-none bg-transparent p-1"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Level badge */}
            <motion.div
              className="mx-auto w-20 h-20 rounded-full gradient-levelup flex items-center justify-center"
              style={{ boxShadow: "var(--shadow-glow)" }}
              initial={{ rotate: -15, scale: 0.7 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
            >
              <span className="text-2xl font-black text-white leading-none">
                {newLevel}
              </span>
            </motion.div>

            {/* Title */}
            <div>
              <p className="text-xs text-brand-400 uppercase tracking-widest font-semibold mb-1">
                Level Up!
              </p>
              <h2 className="text-2xl font-bold text-surface-50">
                You reached Level {newLevel}
              </h2>
            </div>

            {/* XP gained chip */}
            {xpGained && (
              <motion.div
                className="inline-flex items-center gap-2 text-warning text-sm font-semibold px-4 py-2 rounded-[var(--radius-pill)]"
                style={{
                  background: "rgb(245 158 11 / 0.10)",
                  border: "1px solid rgb(245 158 11 / 0.20)"
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <Star size={14} fill="currentColor" />
                +{xpGained} XP earned
              </motion.div>
            )}

            <p className="text-sm text-surface-400">
              Keep answering to unlock new quizzes and climb the leaderboard.
            </p>

            <button onClick={onClose} className="btn-primary w-full justify-center">
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
