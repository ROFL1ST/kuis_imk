// src/components/ui/ReportModal.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { quizAPI } from "../../services/api";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";

const REPORT_REASONS = [
  "Soal tidak jelas",
  "Jawaban salah",
  "Gambar rusak / tidak tampil",
  "Konten tidak pantas",
  "Soal duplikat",
  "Lainnya",
];

const ReportModal = ({ isOpen, onClose, questionId }) => {
  const { t } = useLanguage();
  const [selectedReason, setSelectedReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) { toast.error("Pilih alasan laporan."); return; }
    setLoading(true);
    try {
      await quizAPI.reportQuestion(questionId, { reason: selectedReason, note });
      setDone(true);
    } catch {
      toast.error(t("modals.reportFailed") || "Gagal mengirim laporan.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSelectedReason(""); setNote(""); setDone(false); }, 300);
  };

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
                  style={{ background: "rgb(239 68 68 / 0.15)", color: "#f87171" }}
                >
                  <Flag size={17} />
                </div>
                <div>
                  <h3 className="font-black text-sm" style={{ color: "var(--color-surface-50)" }}>
                    {t("modals.reportTitle") || "Laporkan Soal"}
                  </h3>
                  <p className="text-[10px]" style={{ color: "var(--color-surface-500)" }}>
                    ID #{questionId}
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
                    style={{ background: "rgb(34 197 94 / 0.15)", color: "#4ade80" }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="font-black text-base mb-1" style={{ color: "var(--color-surface-50)" }}>
                    {t("modals.reportSent") || "Laporan Terkirim!"}
                  </h4>
                  <p className="text-xs" style={{ color: "var(--color-surface-500)" }}>
                    {t("modals.reportThanks") || "Terima kasih, tim kami akan meninjau laporan ini."}
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
                  <p className="text-xs mb-3 font-bold" style={{ color: "var(--color-surface-400)" }}>
                    {t("modals.reportReason") || "Pilih alasan:"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {REPORT_REASONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedReason(r)}
                        className="p-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer border"
                        style={{
                          background: selectedReason === r
                            ? "rgb(239 68 68 / 0.15)"
                            : "var(--color-surface-800)",
                          borderColor: selectedReason === r
                            ? "rgb(239 68 68 / 0.40)"
                            : "var(--color-surface-700)",
                          color: selectedReason === r
                            ? "#f87171"
                            : "var(--color-surface-400)",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("modals.reportNote") || "Catatan tambahan (opsional)..."}
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
                    disabled={loading || !selectedReason}
                    className="w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer border-none"
                    style={{
                      background: loading || !selectedReason
                        ? "var(--color-surface-800)"
                        : "linear-gradient(135deg, #ef4444, #f97316)",
                      color: loading || !selectedReason
                        ? "var(--color-surface-600)"
                        : "#fff",
                    }}
                  >
                    {loading ? (
                      <><Loader2 size={15} className="animate-spin" /> Mengirim...</>
                    ) : (
                      <><Send size={15} /> {t("modals.reportSubmit") || "Kirim Laporan"}</>
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

export default ReportModal;
