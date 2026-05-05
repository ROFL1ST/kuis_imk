// src/components/ui/ReviewModal.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Send, Loader2, CheckCircle2, Flame } from "lucide-react";
import { quizAPI } from "../../services/api";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";

const ReviewModal = ({ isOpen, onClose, quizId, onSuccess }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error("Berikan rating dulu."); return; }
    setLoading(true);
    try {
      await quizAPI.rateQuiz(quizId, { rating, comment });
      setDone(true);
      onSuccess?.();
    } catch {
      toast.error(t("modals.reviewFailed") || "Gagal menyimpan review.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setRating(0); setHovered(0); setComment(""); setDone(false); }, 300);
  };

  const ratingLabels = ["", "Buruk", "Kurang", "Cukup", "Bagus", "Luar Biasa!"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl overflow-hidden border"
            style={{
              background: "var(--color-surface-900)",
              borderColor: "var(--color-surface-700)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: "var(--color-surface-800)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgb(251 191 36 / 0.15)", color: "#fbbf24" }}
                >
                  <Flame size={17} />
                </div>
                <div>
                  <h3 className="font-black text-sm" style={{ color: "var(--color-surface-50)" }}>
                    {t("modals.reviewTitle") || "Rate Kuis Ini"}
                  </h3>
                  <p className="text-[10px]" style={{ color: "var(--color-surface-500)" }}>
                    {t("modals.reviewSubtitle") || "Bantu pengguna lain dengan reviewmu"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
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

            <div className="p-5">
              {done ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6"
                >
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgb(251 191 36 / 0.15)", color: "#fbbf24" }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="font-black text-base mb-1" style={{ color: "var(--color-surface-50)" }}>
                    {t("modals.reviewSent") || "Review Tersimpan!"}
                  </h4>
                  <p className="text-xs" style={{ color: "var(--color-surface-500)" }}>
                    {t("modals.reviewThanks") || "Terima kasih atas penilaianmu!"}
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-5 w-full py-3 rounded-xl font-bold cursor-pointer border"
                    style={{
                      background: "var(--color-surface-800)",
                      borderColor: "var(--color-surface-700)",
                      color: "var(--color-surface-300)",
                    }}
                  >
                    Tutup
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Stars */}
                  <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          size={32}
                          fill={(hovered || rating) >= s ? "#fbbf24" : "transparent"}
                          style={{
                            color: (hovered || rating) >= s
                              ? "#fbbf24"
                              : "var(--color-surface-600)",
                          }}
                        />
                      </button>
                    ))}
                  </div>

                  <p
                    className="text-center text-xs font-bold mb-4 h-4"
                    style={{ color: "#fbbf24" }}
                  >
                    {ratingLabels[hovered || rating]}
                  </p>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("modals.reviewComment") || "Komentar (opsional)..."}
                    rows={3}
                    className="w-full p-3 rounded-xl text-sm font-medium outline-none resize-none mb-4"
                    style={{
                      background: "var(--color-surface-800)",
                      border: "2px solid var(--color-surface-700)",
                      color: "var(--color-surface-100)",
                    }}
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !rating}
                    className="w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer border-none"
                    style={{
                      background: loading || !rating
                        ? "var(--color-surface-800)"
                        : "linear-gradient(135deg, #fbbf24, #f97316)",
                      color: loading || !rating
                        ? "var(--color-surface-600)"
                        : "#fff",
                    }}
                  >
                    {loading ? (
                      <><Loader2 size={15} className="animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Send size={15} /> {t("modals.reviewSubmit") || "Kirim Review"}</>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
