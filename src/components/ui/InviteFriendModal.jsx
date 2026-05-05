// src/components/ui/InviteFriendModal.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X, Search, CheckCircle2, Send, Loader2 } from "lucide-react";
import { socialAPI } from "../../services/api";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";

const InviteFriendModal = ({ isOpen, onClose, users = [], onInvited }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (username) => {
    setSelected((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    );
  };

  const handleSend = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      await Promise.all(selected.map((username) => socialAPI.sendFriendRequest(username)));
      toast.success(t("invite.sent") || "Undangan terkirim!");
      onInvited?.();
      onClose();
    } catch {
      toast.error(t("invite.failed") || "Gagal mengirim undangan.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--color-surface-800)",
    border: "2px solid var(--color-surface-700)",
    color: "var(--color-surface-100)",
    outline: "none",
    borderRadius: "0.75rem",
    padding: "0.6rem 0.75rem 0.6rem 2.5rem",
    width: "100%",
    fontSize: "0.875rem",
    fontWeight: 600,
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
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#4ade80,#34d399)" }} />

            {/* Header */}
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: "var(--color-surface-800)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgb(74 222 128 / 0.12)", color: "#4ade80" }}
                >
                  <UserPlus size={17} />
                </div>
                <div>
                  <h3 className="font-black text-sm" style={{ color: "var(--color-surface-50)" }}>
                    {t("invite.title") || "Undang Teman"}
                  </h3>
                  <p className="text-[10px]" style={{ color: "var(--color-surface-500)" }}>
                    {t("invite.subtitle") || "Cari & undang teman baru"}
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

            <div className="p-5 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-surface-500)" }} />
                <input
                  type="text"
                  placeholder={t("invite.search") || "Cari username atau nama..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* User list */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {filtered.length === 0 ? (
                  <p className="text-center py-8 text-sm font-bold" style={{ color: "var(--color-surface-500)" }}>
                    {t("invite.noUsers") || "Tidak ada pengguna ditemukan"}
                  </p>
                ) : (
                  filtered.map((u) => {
                    const isSelected = selected.includes(u.username);
                    return (
                      <div
                        key={u.id || u.ID}
                        onClick={() => toggle(u.username)}
                        className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
                        style={{
                          background: isSelected ? "rgb(74 222 128 / 0.08)" : "var(--color-surface-800)",
                          borderColor: isSelected ? "rgb(74 222 128 / 0.35)" : "var(--color-surface-700)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                            style={{
                              background: isSelected ? "rgb(74 222 128 / 0.15)" : "var(--color-surface-700)",
                              color: isSelected ? "#4ade80" : "var(--color-surface-400)",
                            }}
                          >
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: "var(--color-surface-100)" }}>{u.name}</p>
                            <p className="text-[10px]" style={{ color: "var(--color-surface-500)" }}>@{u.username}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={17} style={{ color: "#4ade80" }} />}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={loading || selected.length === 0}
                className="w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer border-none"
                style={{
                  background: loading || selected.length === 0
                    ? "var(--color-surface-800)"
                    : "linear-gradient(135deg,#4ade80,#34d399)",
                  color: loading || selected.length === 0
                    ? "var(--color-surface-600)"
                    : "#052e16",
                  boxShadow: !loading && selected.length > 0
                    ? "0 8px 24px rgb(74 222 128 / 0.25)"
                    : "none",
                }}
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Mengirim...</>
                ) : (
                  <><Send size={15} /> {t("invite.send") || `Kirim Undangan (${selected.length})`}</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteFriendModal;
