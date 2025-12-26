// src/components/ui/StreakSuccessModal.jsx

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const StreakSuccessModal = ({ isOpen, onClose, streakCount, type = 'extended' }) => {
  // type: 'extended' (lanjut) atau 'recovered' (mulai lagi setelah bolong)

  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

       return () => clearInterval(interval);
    }
  }, [isOpen]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.5, opacity: 0, y: 100 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", damping: 15, stiffness: 100, delay: 0.1 } 
    },
    exit: { scale: 0.8, opacity: 0, y: -50 }
  };

  const flameVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
        scale: 1, 
        rotate: 0,
        transition: { type: "spring", damping: 10, stiffness: 100, delay: 0.3 }
    },
    pulse: {
        scale: [1, 1.1, 1],
        filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
        transition: { repeat: Infinity, duration: 1.5 }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.5 } }
  };

  const title = type === 'recovered' ? "Streak Dinyalakan Kembali!" : "Streak Diperpanjang!";
  const message = type === 'recovered' 
    ? "Kerja bagus kembali ke jalur! Jangan biarkan apinya padam lagi." 
    : "Konsistensi luar biasa! Pertahankan momentum ini.";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white border border-slate-200 w-full max-w-sm md:max-w-md rounded-[32px] p-8 text-center relative overflow-hidden shadow-2xl"
            variants={modalVariants}
          >
            {/* Tombol Close Light Mode */}
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1 rounded-full transition">
                <X size={24} />
            </button>
            
            {/* Background Glow Light Mode (Orange lembut) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-100/80 rounded-full blur-3xl -z-10 animate-pulse"></div>

            <motion.div 
                className="mx-auto w-32 h-32 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-200 border-4 border-orange-100 relative"
                variants={flameVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={flameVariants} animate="pulse">
                  <Flame size={80} className="text-white fill-white" />
                </motion.div>
                {/* Checkmark badge */}
                <motion.div 
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1, transition: { delay: 0.8, type: "spring" } }}
                   className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 text-green-500 shadow-sm border border-slate-100"
                >
                  <CheckCircle2 size={32} fill="currentColor" className="text-white" />
                </motion.div>
            </motion.div>
            
            <motion.div variants={textVariants}>
                <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                   {streakCount} Hari!
                </h2>
                <h3 className="text-xl font-bold text-orange-500 mb-4">{title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  {message}
                </p>
            </motion.div>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg shadow-lg shadow-orange-500/30 uppercase tracking-wider transition-all"
            >
              Lanjut
            </motion.button>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakSuccessModal;