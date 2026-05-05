// src/pages/dashboard/History.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Clock, Calendar, CheckCircle2, ChevronRight, Swords,
  History as HistoryIcon, BarChart3, Timer, Loader2, BrainCircuit,
} from "lucide-react";
import { quizAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Skeleton from "../../components/ui/Skeleton";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";

/* ── CSS var shortcuts ── */
const BRAND = "var(--color-brand-400)";
const S50   = "var(--color-surface-50)";
const S100  = "var(--color-surface-100)";
const S200  = "var(--color-surface-200)";
const S300  = "var(--color-surface-300)";
const S400  = "var(--color-surface-400)";
const S500  = "var(--color-surface-500)";
const S600  = "var(--color-surface-600)";
const S700  = "var(--color-surface-700)";
const S800  = "var(--color-surface-800)";
const S900  = "var(--color-surface-900)";

/* ── type color map ── */
const TYPE = {
  duel:     { accent: "#fb923c", bg: "rgb(249 115 22 / 0.10)", border: "rgb(249 115 22 / 0.25)", bar: "#f97316", label: "DUEL" },
  survival: { accent: "#a78bfa", bg: "rgb(167 139 250 / 0.10)", border: "rgb(167 139 250 / 0.25)", bar: "#8b5cf6", label: "SURVIVAL" },
  remedial: { accent: "#f87171", bg: "rgb(239 68 68 / 0.10)",  border: "rgb(239 68 68 / 0.25)",  bar: "#ef4444", label: "REMEDIAL" },
  pass:     { accent: "#4ade80", bg: "rgb(34 197 94 / 0.08)",  border: "rgb(34 197 94 / 0.18)",  bar: "#22c55e", label: "" },
  fail:     { accent: "#f87171", bg: "rgb(239 68 68 / 0.08)",  border: "rgb(239 68 68 / 0.18)",  bar: "#ef4444", label: "" },
};

const History = () => {
  const { t }      = useLanguage();
  const navigate   = useNavigate();
  const observer   = useRef();

  const [histories, setHistories]         = useState([]);
  const [stats, setStats]                 = useState({ total_quiz: 0, average_score: 0 });
  const [loading, setLoading]             = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(true);
  const limit = 10;

  useEffect(() => { document.title = "History | QuizApp"; }, []);
  useEffect(() => { fetchHistory(page); }, [page]);

  const fetchHistory = async (pageNum) => {
    setLoading(true);
    try {
      const res = await quizAPI.getMyHistory(pageNum, limit);
      const { list, stats: serverStats } = res.data.data;
      const meta = res.data.meta || {};
      setHistories(prev => pageNum === 1 ? list : [...prev, ...list]);
      if (pageNum === 1 && serverStats) setStats(serverStats);
      if (list.length < limit || meta.current_page >= meta.total_pages) setHasMore(false);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setInitialLoading(false); }
  };

  const lastHistoryElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(p => p + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const goToReview = (id) => navigate(`/history/review/${id}`);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m === 0 ? `${s}s` : `${m}m ${s}s`;
  };

  const getType = (item) => {
    if (item.quiz_title.includes("[DUEL]"))         return "duel";
    if (item.quiz_title.includes("Smart Remedial")) return "remedial";
    if (item.quiz_id === 0)                          return "survival";
    return item.score >= 70 ? "pass" : "fail";
  };

  /* ───────────── SKELETON ───────────── */
  if (initialLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
      <Skeleton className="h-36 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    </div>
  );

  /* ───────────── RENDER ───────────── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto pb-24 px-4"
    >

      {/* ═══ HEADER BANNER ═══ */}
      <div
        className="w-full rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)" }}
      >
        <div style={{ position:"absolute", top:"-50px", right:"-40px", width:"220px", height:"220px", borderRadius:"50%", background:"rgb(99 102 241 / 0.18)", filter:"blur(50px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-20px", left:"20px", width:"140px", height:"140px", borderRadius:"50%", background:"rgb(168 85 247 / 0.12)", filter:"blur(30px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgb(255 255 255 / 0.04) 1px, transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3" style={{ color: "#fff" }}>
              <span className="p-2 rounded-xl" style={{ background: "rgb(255 255 255 / 0.12)" }}>
                <HistoryIcon size={22} style={{ color: "#c7d2fe" }} />
              </span>
              {t("history.title")}
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "rgb(199 210 254 / 0.75)" }}>{t("history.subtitle")}</p>
          </div>

          {/* Stat chips */}
          <div className="flex gap-3">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgb(255 255 255 / 0.08)", border: "1px solid rgb(255 255 255 / 0.12)" }}
            >
              <span className="p-2 rounded-xl" style={{ background: "rgb(99 102 241 / 0.20)", color: "#a5b4fc" }}>
                <CheckCircle2 size={16} />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgb(199 210 254 / 0.6)" }}>{t("history.totalQuiz")}</p>
                <p className="text-lg font-black leading-tight" style={{ color: "#e0e7ff" }}>{stats.total_quiz}</p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgb(255 255 255 / 0.08)", border: "1px solid rgb(255 255 255 / 0.12)" }}
            >
              <span className="p-2 rounded-xl" style={{ background: "rgb(52 211 153 / 0.20)", color: "#6ee7b7" }}>
                <BarChart3 size={16} />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgb(199 210 254 / 0.6)" }}>{t("history.averageScore")}</p>
                <p className="text-lg font-black leading-tight" style={{ color: "#e0e7ff" }}>{stats.average_score}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      {histories.length === 0 ? (
        <div
          className="text-center py-20 rounded-3xl"
          style={{ background: S900, border: `1px dashed ${S700}` }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: S800, color: S700 }}
          >
            <Clock size={36} />
          </div>
          <h3 className="text-base font-black mb-1" style={{ color: S300 }}>{t("history.empty")}</h3>
          <p className="text-sm" style={{ color: S600 }}>{t("history.emptyDesc")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {histories.map((item, index) => {
            const type       = getType(item);
            const cfg        = TYPE[type];
            const cleanTitle = item.quiz_title.replace("[DUEL]", "").trim();
            const isLast     = index === histories.length - 1;

            return (
              <motion.div
                key={`${item.ID}-${index}`}
                ref={isLast ? lastHistoryElementRef : null}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                onClick={() => goToReview(item.ID)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 transition-all"
                style={{
                  background: S900,
                  border: `1px solid ${S800}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.background = cfg.bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S800; e.currentTarget.style.background = S900; }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: cfg.bar, borderRadius: "0 0 0 0" }}
                />

                {/* Background icon */}
                <div
                  className="absolute -right-4 -bottom-4 pointer-events-none opacity-5"
                  style={{ color: cfg.accent }}
                >
                  {type === "duel" || type === "survival"
                    ? <Swords size={90} strokeWidth={1.5} />
                    : type === "remedial"
                    ? <BrainCircuit size={90} strokeWidth={1.5} />
                    : null
                  }
                </div>

                <div className="flex items-start gap-4 pl-3 w-full sm:w-auto z-10">

                  {/* Score badge */}
                  <div
                    className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0"
                    style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, color: cfg.accent }}
                  >
                    <span className="font-black text-xl leading-none">{item.score}</span>
                    <span className="text-[9px] font-black uppercase mt-0.5" style={{ opacity: 0.75 }}>
                      {type === "survival" ? t("history.rounds") : (type === "pass" ? t("history.passed") : type === "fail" ? t("history.failed") : type.toUpperCase())}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {(type === "duel" || type === "survival" || type === "remedial") && (
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ background: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
                        >
                          {cfg.label}
                        </span>
                      )}
                      <h3 className="font-black text-base truncate" style={{ color: S100 }}>{cleanTitle}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg"
                        style={{ background: S800, color: S400, border: `1px solid ${S700}` }}
                      >
                        <Calendar size={11} />
                        {new Date(item.CreatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg"
                        style={{ background: S800, color: S400, border: `1px solid ${S700}` }}
                      >
                        <Timer size={11} /> {formatDuration(item.time_taken)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review arrow */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center z-10">
                  <span
                    className="text-xs font-black uppercase tracking-wide hidden sm:block transition-colors"
                    style={{ color: S600 }}
                  >
                    Review
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background: S800, color: S500 }}
                    onMouseEnter={e => { e.currentTarget.style.background = cfg.bar; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = S800; e.currentTarget.style.color = S500; }}
                  >
                    <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Load more indicator */}
          {loading && (
            <div className="py-4 flex justify-center items-center gap-2" style={{ color: S500 }}>
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm font-black">Memuat lebih banyak...</span>
            </div>
          )}

          {/* End of list */}
          {!hasMore && histories.length > 0 && (
            <div
              className="py-5 text-center text-xs font-black"
              style={{ color: S700, borderTop: `1px dashed ${S800}`, marginTop: "0.5rem" }}
            >
              Semua riwayat telah ditampilkan
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default History;
