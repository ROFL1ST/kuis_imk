// src/components/ui/LogoLoader.jsx

import { motion } from "framer-motion";

const LogoLoader = ({ text = "Loading..." }) => {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6"
      style={{
        background: "var(--color-surface-950, #030712)",
      }}
    >
      {/* Logo mark */}
      <div className="relative">
        {/* Outer glow ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 rounded-[28px]"
          style={{
            background: "conic-gradient(from 0deg, transparent 70%, #f97316, #a78bfa, transparent)",
            padding: "2px",
          }}
        />

        {/* Logo box */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative w-20 h-20 rounded-[24px] flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--color-surface-800), var(--color-surface-900))",
            border: "1px solid var(--color-surface-700)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Letter Q stylized */}
          <span
            className="text-3xl font-black select-none"
            style={{
              background: "linear-gradient(135deg, #f97316, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Q
          </span>
        </motion.div>
      </div>

      {/* Dot loader */}
      <div className="flex gap-2 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="w-2 h-2 rounded-full"
            style={{ background: i === 1 ? "#a78bfa" : "#f97316" }}
          />
        ))}
      </div>

      {/* Text */}
      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-surface-500)" }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LogoLoader;
