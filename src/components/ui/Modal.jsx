// src/components/ui/Modal.jsx
// Generic base modal wrapper

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
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
            className={`w-full ${maxWidth} rounded-2xl overflow-hidden border`}
            style={{
              background: "var(--color-surface-900)",
              borderColor: "var(--color-surface-700)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            {title && (
              <div
                className="flex items-center justify-between p-5 border-b"
                style={{ borderColor: "var(--color-surface-800)" }}
              >
                <h3 className="font-black text-base" style={{ color: "var(--color-surface-50)" }}>
                  {title}
                </h3>
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
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
