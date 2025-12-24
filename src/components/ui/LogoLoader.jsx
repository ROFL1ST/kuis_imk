import React from "react";
import { Zap } from "lucide-react"; 
import { motion } from "framer-motion";

const LogoLoader = () => {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center"
      >
        {/* Lingkaran Background */}
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50"></div>
        
        {/* Logo Utama */}
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200 rotate-3">
          <Zap size={40} className="text-white fill-white" />
        </div>
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-xl font-black text-indigo-900 tracking-tight"
      >
        QuizApp
      </motion.h1>
    </div>
  );
};

export default LogoLoader;