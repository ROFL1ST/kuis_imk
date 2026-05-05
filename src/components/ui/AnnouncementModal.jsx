// src/components/ui/AnnouncementModal.jsx

import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X, ExternalLink } from "lucide-react";

const AnnouncementModal = ({ isOpen, onClose, announcement }) => {
  if (!announcement) return null;

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl overflow-hidden border"
            style={{
              background: "var(--color-surface-900)",
              borderColor: "var(--color-surface-700)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Accent bar */}
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa, #38bdf8)" }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: "var(--color-surface-800)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgb(99 102 241 / 0.15)", color: "#818cf8" }}
                >
                  <Megaphone size={17} />
                </div>
                <div>
                  <h3 className="font-black text-sm" style={{ color: "var(--color-surface-50)" }}>
                    {announcement.title || "Pengumuman"}
                  </h3>
                  <p className="text-[10px]" style={{ color: "var(--color-surface-500)" }}>
                    {announcement.date || ""}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border"
                style={{
                  background: "var(--color-surface-800)",
                  borderColor: "var(--color-surface-700)",
                  color: "var(--color-surface-400)",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {announcement.image && (
                <img
                  src={announcement.image}
                  alt="announcement"
                  className="w-full rounded-xl mb-4 object-cover max-h-48"
                  style={{ border: "1px solid var(--color-surface-700)" }}
                />
              )}
              <p
                className="text-sm leading-relaxed font-medium mb-5"
                style={{ color: "var(--color-surface-300)" }}
              >
                {announcement.content}
              </p>

              <div className="flex gap-2">
                {announcement.link && (
                  <a
                    href={announcement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl font-black text-white flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #818cf8)",
                      boxShadow: "0 8px 24px rgb(99 102 241 / 0.25)",
                    }}
                  >
                    <ExternalLink size={15} /> Selengkapnya
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold cursor-pointer border"
                  style={{
                    background: "var(--color-surface-800)",
                    borderColor: "var(--color-surface-700)",
                    color: "var(--color-surface-300)",
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementModal;
