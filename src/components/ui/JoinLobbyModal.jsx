// src/components/ui/JoinLobbyModal.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, X, Loader2, Hash } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { socialAPI } from "../../services/api";

const JoinLobbyModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) { toast.error("Masukkan kode lobby."); return; }
    setLoading(true);
    try {
      const res = await socialAPI.joinChallenge(code.trim().toUpperCase());
      if (res.data.status === "success") {
        const challenge = res.data.data;
        onClose();
        navigate(`/challenges/${challenge.ID}/lobby`, {
          state: { challenge },
        });
      } else {
        toast.error(res.data.message || "Kode tidak ditemukan.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal bergabung.");
    } finally {
      setLoading(false);
    }
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
          onClick={onClose}
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
            {/* Accent */}
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg, #f97316, #ef4444)" }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: "var(--color-surface-800)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgb(249 115 22 / 0.15)", color: "#fb923c" }}
                >
                  <Swords size={17} />
                </div>
                <div>
                  <h3 className="font-black text-sm" style={{ color: "var(--color-surface-50)" }}>
                    {t("modals.joinLobby") || "Gabung Lobby"}
                  </h3>
                  <p className="text-[10px]" style={{ color: "var(--color-surface-500)" }}>
                    {t("modals.joinLobbyDesc") || "Masukkan kode dari temanmu"}
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

            <div className="p-5">
              <div className="relative mb-5">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="KODE LOBBY"
                  maxLength={8}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className="w-full p-4 pl-12 rounded-xl text-center text-xl font-black tracking-[0.3em] uppercase outline-none"
                  style={{
                    background: "var(--color-surface-800)",
                    border: "2px solid var(--color-surface-700)",
                    color: "var(--color-surface-50)",
                    letterSpacing: "0.3em",
                  }}
                  autoFocus
                />
                <Hash
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-surface-500)" }}
                />
              </div>

              <button
                onClick={handleJoin}
                disabled={loading || !code.trim()}
                className="w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer border-none"
                style={{
                  background: loading || !code.trim()
                    ? "var(--color-surface-800)"
                    : "linear-gradient(135deg, #f97316, #ef4444)",
                  color: loading || !code.trim()
                    ? "var(--color-surface-600)"
                    : "#fff",
                  boxShadow: !loading && code.trim()
                    ? "0 8px 24px rgb(249 115 22 / 0.25)"
                    : "none",
                }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Bergabung...</>
                ) : (
                  <><Swords size={16} /> {t("modals.joinBtn") || "Masuk Lobby"}</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinLobbyModal;
