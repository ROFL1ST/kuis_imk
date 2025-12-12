import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star, X, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

const LevelUpModal = ({ isOpen, onClose, newLevel }) => {
  useEffect(() => {
    if (isOpen) {
      // Efek Confetti "School Pride"
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#a855f7', '#fbbf24']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#a855f7', '#fbbf24']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-4 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white w-full max-w-sm rounded-3xl p-1 relative overflow-hidden shadow-2xl"
        >
          {/* Decorative Border Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 animate-gradient-xy"></div>
          
          <div className="bg-white rounded-[22px] relative p-8 text-center overflow-hidden h-full">
            {/* Background Rays */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-100/50 to-transparent opacity-70 pointer-events-none"></div>

            <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition z-20">
              <X size={24} />
            </button>

            {/* Icon Animasi */}
            <div className="relative mb-6 inline-block">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 bg-yellow-200 blur-xl opacity-60 rounded-full scale-150"
               />
               <motion.div
                 initial={{ scale: 0, rotate: -45 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: "spring", bounce: 0.5 }}
                 className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg relative z-10 rotate-3"
               >
                  <Crown size={48} className="text-white drop-shadow-md" />
               </motion.div>
               
               {/* Floating Stars */}
               <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-4 -right-4 text-yellow-500"><Star fill="currentColor" size={24}/></motion.div>
               <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} className="absolute -bottom-2 -left-6 text-orange-400"><Star fill="currentColor" size={20}/></motion.div>
            </div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-1 uppercase tracking-wider"
            >
              Level Up!
            </motion.h2>

            <p className="text-slate-500 font-medium mb-6">Kamu mencapai level baru</p>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-7xl font-black text-slate-800 mb-2 drop-shadow-sm tracking-tighter"
            >
              {newLevel}
            </motion.div>

            <div className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-1 rounded-full text-xs font-bold mb-8">
              SANG PENAKLUK KUIS
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              Lanjutkan <Share2 size={18} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelUpModal;