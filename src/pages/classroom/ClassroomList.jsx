import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { classroomAPI } from "../../services/newFeatures";
import { Plus, Users, BookOpen, ArrowRight, X, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Skeleton from "../../components/ui/Skeleton";

const ClassroomList = () => {
  const { t } = useLanguage();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => { fetchClassrooms(); }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await classroomAPI.getMyClassrooms();
      if (res.data.status === "success") setClassrooms(res.data.data);
      else toast.error(res.data.message);
    } catch (error) {
      console.error("Gagal memuat data kelas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await classroomAPI.joinClassroom(joinCode.toLowerCase());
      if (res.data.status === "success") {
        toast.success("Berhasil bergabung ke kelas!");
        setShowJoinModal(false);
        setJoinCode("");
        fetchClassrooms();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal bergabung ke kelas");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--color-surface-50)" }}>
            {t("classroom.title")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-surface-500)" }}>
            {t("classroom.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowJoinModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all"
          style={{
            background: "var(--color-brand-500)",
            color: "#fff",
            boxShadow: "0 4px 16px rgb(99 102 241 / 0.30)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-brand-600)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-brand-500)")}
        >
          <Plus size={16} />
          {t("classroom.join")}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div
          className="text-center py-24 rounded-3xl border border-dashed"
          style={{
            background: "var(--color-surface-900)",
            borderColor: "var(--color-surface-700)",
          }}
        >
          <BookOpen size={48} className="mx-auto mb-4" style={{ color: "var(--color-surface-700)" }} />
          <h3 className="text-lg font-black mb-1" style={{ color: "var(--color-surface-300)" }}>
            {t("classroom.noClass")}
          </h3>
          <p className="text-sm" style={{ color: "var(--color-surface-500)" }}>
            {t("classroom.joinPromo")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classrooms.joining?.map((classroom, index) => {
            const upcoming = classroom.upcoming_assignments || [];
            const hasUrgent = upcoming.length > 0;
            const mostUrgent = hasUrgent
              ? upcoming.reduce((a, b) => (a.days_left < b.days_left ? a : b))
              : null;
            return (
              <ClassroomCard
                key={classroom.ID}
                classroom={classroom}
                index={index}
                hasUrgent={hasUrgent}
                upcoming={upcoming}
                mostUrgent={mostUrgent}
                t={t}
              />
            );
          })}
        </div>
      )}

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            key="join-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgb(0 0 0 / 0.65)", backdropFilter: "blur(6px)" }}
            onClick={(e) => e.target === e.currentTarget && setShowJoinModal(false)}
          >
            <motion.div
              key="join-modal"
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{
                background: "var(--color-surface-900)",
                border: "1px solid var(--color-surface-700)",
                boxShadow: "0 24px 64px rgb(0 0 0 / 0.5)",
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgb(99 102 241 / 0.15)", border: "1px solid rgb(99 102 241 / 0.25)" }}
                  >
                    <Hash size={16} style={{ color: "var(--color-brand-400)" }} />
                  </div>
                  <h2 className="text-lg font-black" style={{ color: "var(--color-surface-50)" }}>
                    {t("classroom.join")}
                  </h2>
                </div>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
                  style={{ color: "var(--color-surface-500)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-surface-800)"; e.currentTarget.style.color = "var(--color-surface-200)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-surface-500)"; }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleJoinClass} className="space-y-4">
                {/* Code input */}
                <div>
                  <label className="block text-xs font-black mb-2 uppercase tracking-widest" style={{ color: "var(--color-surface-500)" }}>
                    Kode Kelas
                  </label>
                  <input
                    type="text"
                    placeholder={t("classroom.codePlaceholder")}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl font-mono text-center text-xl font-black tracking-[0.3em] outline-none transition-all uppercase"
                    style={{
                      background: "var(--color-surface-800)",
                      border: "1px solid var(--color-surface-700)",
                      color: "var(--color-surface-50)",
                      caretColor: "var(--color-brand-400)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-500)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-surface-700)")}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-black text-sm transition-colors"
                    style={{
                      background: "var(--color-surface-800)",
                      color: "var(--color-surface-400)",
                      border: "1px solid var(--color-surface-700)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-surface-200)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-surface-400)")}
                  >
                    {t("classroom.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={joining || !joinCode.trim()}
                    className="flex-1 py-2.5 rounded-xl font-black text-sm text-white transition-all"
                    style={{
                      background: joining || !joinCode.trim() ? "var(--color-surface-700)" : "var(--color-brand-500)",
                      color: joining || !joinCode.trim() ? "var(--color-surface-500)" : "#fff",
                      boxShadow: joining || !joinCode.trim() ? "none" : "0 4px 16px rgb(99 102 241 / 0.30)",
                    }}
                  >
                    {joining ? "Bergabung..." : t("classroom.joinBtn")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function ClassroomCard({ classroom, index, hasUrgent, upcoming, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link to={`/classrooms/${classroom.ID}`} className="block h-full">
        <div
          className="p-5 rounded-2xl border flex flex-col h-full transition-all"
          style={{
            background: hasUrgent ? "rgb(245 158 11 / 0.06)" : "var(--color-surface-900)",
            borderColor: hasUrgent ? "rgb(245 158 11 / 0.30)" : "var(--color-surface-800)",
            boxShadow: hasUrgent ? "0 0 20px rgb(245 158 11 / 0.08)" : "none",
          }}
        >
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: hasUrgent ? "rgb(245 158 11 / 0.12)" : "rgb(99 102 241 / 0.12)",
                border: `1px solid ${hasUrgent ? "rgb(245 158 11 / 0.25)" : "rgb(99 102 241 / 0.20)"}`,
              }}
            >
              <BookOpen size={18} style={{ color: hasUrgent ? "#f59e0b" : "var(--color-brand-400)" }} />
            </div>
            <span
              className="font-mono font-black text-xs px-2.5 py-1 rounded-lg"
              style={{
                background: "var(--color-surface-800)",
                color: "var(--color-surface-400)",
                border: "1px solid var(--color-surface-700)",
              }}
            >
              {classroom.code}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-black text-base mb-3" style={{ color: "var(--color-surface-100)" }}>
            {classroom.name}
          </h3>

          {/* Upcoming deadlines */}
          {hasUrgent && (
            <div className="mb-3 space-y-1.5">
              {upcoming.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: "rgb(245 158 11 / 0.10)",
                    border: "1px solid rgb(245 158 11 / 0.20)",
                  }}
                >
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={{
                      background: a.days_left <= 1 ? "#ef4444" : "#f59e0b",
                      color: "#fff",
                    }}
                  >
                    H-{a.days_left - 1}
                  </span>
                  <span className="text-xs font-medium truncate" style={{ color: "#f59e0b" }}>
                    Deadline!
                  </span>
                </div>
              ))}
              {upcoming.length > 2 && (
                <p className="text-xs font-black pl-1" style={{ color: "#f59e0b" }}>
                  +{upcoming.length - 2} tugas lainnya
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            className="mt-auto pt-3 flex items-center justify-between text-xs border-t"
            style={{ borderColor: "var(--color-surface-800)", color: "var(--color-surface-500)" }}
          >
            <div className="flex items-center gap-1.5">
              <Users size={13} />
              <span>{classroom.members?.length || 0} {t("classroom.members")}</span>
            </div>
            <ArrowRight size={13} style={{ color: "var(--color-brand-400)" }} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default ClassroomList;
