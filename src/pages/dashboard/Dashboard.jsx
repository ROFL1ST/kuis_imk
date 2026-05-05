import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trophy,
  CheckCircle,
  Gift,
  Zap,
  Coins,
  Hash,
  Flame,
  BrainCircuit,
  Globe,
  Play,
  AlertTriangle,
  Loader2,
  XCircle,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react";
import { topicAPI, dailyAPI, quizAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Skeleton from "../../components/ui/Skeleton";
import Modal from "../../components/ui/Modal";
import { useLanguage } from "../../context/LanguageContext";

const Dashboard = () => {
  const { t } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState(null);
  const [showRemedialModal, setShowRemedialModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [weakTopics, setWeakTopics] = useState([]);

  useEffect(() => { document.title = "Dashboard | QuizzApp Indo"; }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [topicRes, dailyRes] = await Promise.allSettled([
          topicAPI.getAllTopics(),
          dailyAPI.getInfo(),
        ]);
        if (topicRes.status === "fulfilled") setTopics(topicRes.value.data.data || []);
        if (dailyRes.status === "fulfilled") setDailyData(dailyRes.value.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClaimLogin = async () => {
    try {
      const res = await dailyAPI.claimLogin();
      toast.success(`+${res.data.data.coins_gained} Koin!`);
      setDailyData((prev) => ({ ...prev, streak: { ...prev.streak, status: "claimed" } }));
      refreshProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal klaim");
    }
  };

  const handleClaimMission = async (missionId) => {
    try {
      const res = await dailyAPI.claimMission(missionId);
      toast.success(`Misi Selesai! +${res.data.data.reward} Koin`);
      setDailyData((prev) => ({
        ...prev,
        missions: prev.missions.map((m) => m.id === missionId ? { ...m, status: "claimed" } : m),
      }));
      refreshProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal klaim");
    }
  };

  const handleOpenRemedial = async () => {
    setShowRemedialModal(true);
    setAnalyzing(true);
    setWeakTopics([]);
    try {
      const res = await quizAPI.getRemedial();
      const questions = res.data.data || [];
      const topicsFound = questions.map((q) =>
        q.Quiz?.Title || q.quiz?.title || q.Quiz?.title || (q.quiz_id ? `Quiz Materi #${q.quiz_id}` : "Materi Umum")
      );
      setWeakTopics([...new Set(topicsFound)].slice(0, 3));
    } catch (err) {
      if (err.response?.status === 404) {
        setShowRemedialModal(false);
        toast.success("Hebat! Tidak ada materi yang perlu diulang saat ini.", { icon: "🎉", duration: 4000 });
      } else {
        toast.error("Gagal menganalisis data remedial.");
        setShowRemedialModal(false);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const startRemedial = () => { setShowRemedialModal(false); navigate("/play/remedial"); };

  const quizStreakCount = dailyData?.streak?.quiz_streak ?? user?.streak_count ?? 0;
  const isQuizDoneToday = dailyData?.streak?.is_quiz_done ?? false;
  const loginStreakDay = dailyData?.streak?.day ?? 1;
  const isLoginRewardClaimed = dailyData?.streak?.status === "cooldown" || dailyData?.streak?.status === "claimed";

  // ────────────── LOADING SKELETON ──────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="w-full h-48 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto space-y-8 pb-16 px-4"
      style={{ color: "var(--color-surface-100)" }}
    >
      {/* ═══════════════════════════════════════════════════════════
           HERO HEADER
      ═══════════════════════════════════════════════════════════ */}
      <div
        className="relative rounded-2xl p-6 md:p-8 overflow-hidden border"
        style={{
          background: "linear-gradient(135deg, rgb(79 70 229 / 0.15) 0%, rgb(99 102 241 / 0.05) 50%, rgb(139 92 246 / 0.10) 100%)",
          borderColor: "rgb(99 102 241 / 0.20)",
        }}
      >
        {/* decorative glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgb(99 102 241 / 0.12)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgb(139 92 246 / 0.08)", transform: "translate(-20%, 20%)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border"
              style={{
                background: "rgb(99 102 241 / 0.15)",
                borderColor: "rgb(99 102 241 / 0.30)",
                color: "var(--color-brand-400)",
              }}
            >
              <Sparkles size={12} />
              {t("dashboard.readyToLearn")}
            </div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2" style={{ color: "var(--color-surface-50)" }}>
              <Zap size={28} style={{ color: "#fbbf24" }} fill="#fbbf24" />
              {t("dashboard.welcome")}, {user?.name}!
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-surface-400)" }}>
              Terus belajar, raih level berikutnya.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            <div
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border"
              style={{
                background: "var(--color-surface-900)",
                borderColor: "var(--color-surface-700)",
              }}
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ background: "rgb(99 102 241 / 0.15)", color: "var(--color-brand-400)" }}
              >
                <Trophy size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-surface-500)" }}>
                  {t("dashboard.level")}
                </p>
                <p className="text-base font-black" style={{ color: "var(--color-surface-50)" }}>
                  {user?.level || 1}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border"
              style={{
                background: "var(--color-surface-900)",
                borderColor: "var(--color-surface-700)",
              }}
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ background: "rgb(245 158 11 / 0.15)", color: "#fbbf24" }}
              >
                <Coins size={16} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-surface-500)" }}>
                  Koin
                </p>
                <p className="text-base font-black" style={{ color: "var(--color-surface-50)" }}>
                  {user?.coins || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           DAILY SECTION
      ═══════════════════════════════════════════════════════════ */}
      {dailyData && dailyData.streak && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Streak Card */}
          <div
            className="rounded-2xl p-6 border relative overflow-hidden flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, rgb(99 102 241 / 0.20) 0%, rgb(139 92 246 / 0.15) 100%)",
              borderColor: "rgb(99 102 241 / 0.25)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
              style={{ background: "rgb(99 102 241 / 0.20)", transform: "translate(40%, -40%)" }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Flame
                  size={18}
                  fill={quizStreakCount > 0 || isQuizDoneToday ? "currentColor" : "none"}
                  style={{ color: quizStreakCount > 0 ? "#fb923c" : "var(--color-surface-500)" }}
                />
                <span className="text-sm font-bold" style={{ color: "var(--color-surface-300)" }}>
                  {t("dashboard.seriousMode")}
                </span>
              </div>
              <h2 className="text-5xl font-black mb-1" style={{ color: "var(--color-surface-50)" }}>
                {quizStreakCount}
              </h2>
              <p className="text-sm" style={{ color: "var(--color-surface-400)" }}>
                {t("dashboard.quizStreak")} {t("dashboard.day")}
              </p>
              <div
                className="mt-4 text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-bold"
                style={{
                  background: isQuizDoneToday ? "rgb(34 197 94 / 0.15)" : "rgb(249 115 22 / 0.15)",
                  color: isQuizDoneToday ? "#4ade80" : "#fb923c",
                }}
              >
                {isQuizDoneToday ? "✓ " + t("dashboard.streakSafe") : "⚠ " + t("dashboard.streakDanger")}
              </div>
            </div>

            {/* Login reward */}
            <div
              className="mt-5 pt-4 relative z-10"
              style={{ borderTop: "1px solid rgb(255 255 255 / 0.08)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--color-surface-500)" }}
                  >
                    {t("dashboard.loginGift")} · {t("dashboard.day")} {loginStreakDay}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Gift size={13} style={{ color: "#fbbf24" }} />
                    <span className="font-bold text-sm" style={{ color: "var(--color-surface-200)" }}>
                      {dailyData.streak.reward} Koin
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClaimLogin}
                  disabled={dailyData.streak.status !== "claimable"}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none"
                  style={{
                    background: dailyData.streak.status === "claimable"
                      ? "var(--color-brand-500)"
                      : "rgb(255 255 255 / 0.08)",
                    color: dailyData.streak.status === "claimable" ? "#fff" : "var(--color-surface-500)",
                    cursor: dailyData.streak.status === "claimable" ? "pointer" : "not-allowed",
                    animation: dailyData.streak.status === "claimable" ? "pulse 2s infinite" : "none",
                  }}
                >
                  {isLoginRewardClaimed ? t("dashboard.claimed") : t("dashboard.claim")}
                </button>
              </div>
            </div>
          </div>

          {/* Daily Missions */}
          <div
            className="lg:col-span-2 rounded-2xl border p-6"
            style={{
              background: "var(--color-surface-900)",
              borderColor: "var(--color-surface-800)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "var(--color-surface-100)" }}>
                <CheckCircle size={18} style={{ color: "#4ade80" }} />
                {t("dashboard.dailyMissions")}
              </h3>
              <span className="text-xs" style={{ color: "var(--color-surface-500)" }}>
                {t("dashboard.resetDaily")}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {dailyData.missions?.map((mission) => (
                <div
                  key={mission.id}
                  className="rounded-xl p-4 border transition-colors"
                  style={{
                    background: "var(--color-surface-800)",
                    borderColor: mission.status === "claimed"
                      ? "rgb(34 197 94 / 0.20)"
                      : mission.status === "claimable"
                      ? "rgb(34 197 94 / 0.30)"
                      : "var(--color-surface-700)",
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 pr-2">
                      <h4 className="font-bold text-sm" style={{ color: "var(--color-surface-100)" }}>
                        {mission.title}
                      </h4>
                      <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "var(--color-surface-500)" }}>
                        {mission.description}
                      </p>
                    </div>
                    <span
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: "rgb(245 158 11 / 0.15)",
                        color: "#fbbf24",
                      }}
                    >
                      <Coins size={9} /> {mission.reward}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div
                        className="w-full rounded-full h-1.5"
                        style={{ background: "var(--color-surface-700)" }}
                      >
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            background: mission.status === "claimable" || mission.status === "claimed"
                              ? "#4ade80" : "var(--color-brand-500)",
                            width: `${Math.min((mission.progress / mission.target) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] mt-1 text-right" style={{ color: "var(--color-surface-500)" }}>
                        {mission.progress}/{mission.target}
                      </div>
                    </div>
                    <button
                      onClick={() => handleClaimMission(mission.id)}
                      disabled={mission.status !== "claimable"}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-none"
                      style={{
                        background: mission.status === "claimable" ? "#4ade80" : "var(--color-surface-700)",
                        color: mission.status === "claimable" ? "#052e16" : "var(--color-surface-500)",
                        cursor: mission.status === "claimable" ? "pointer" : "default",
                      }}
                    >
                      {mission.status === "claimed"
                        ? t("dashboard.missionDone")
                        : mission.status === "claimable"
                        ? t("dashboard.claim")
                        : t("dashboard.missionGo")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           SMART MENU: Remedial + Community
      ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Smart Remedial */}
        <div
          className="rounded-2xl p-6 border flex items-center justify-between relative overflow-hidden group cursor-pointer"
          style={{
            background: "linear-gradient(135deg, rgb(239 68 68 / 0.12) 0%, rgb(249 115 22 / 0.08) 100%)",
            borderColor: "rgb(239 68 68 / 0.20)",
          }}
        >
          <div
            className="absolute right-0 top-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
            style={{ background: "rgb(239 68 68 / 0.15)", transform: "translate(40%, -40%)" }}
          />
          <div className="relative z-10">
            <h3
              className="text-base font-bold flex items-center gap-2 mb-1"
              style={{ color: "var(--color-surface-100)" }}
            >
              <BrainCircuit size={18} style={{ color: "#f87171" }} />
              {t("dashboard.smartRemedial")}
            </h3>
            <p className="text-sm mb-4 max-w-xs" style={{ color: "var(--color-surface-400)" }}>
              {t("dashboard.aiDetect")}
            </p>
            <button
              onClick={handleOpenRemedial}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all border cursor-pointer"
              style={{
                background: "var(--color-surface-900)",
                borderColor: "rgb(239 68 68 / 0.30)",
                color: "#f87171",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgb(239 68 68 / 0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--color-surface-900)"; }}
            >
              {t("dashboard.analyzeWeakness")}
            </button>
          </div>
          <BrainCircuit
            size={56}
            className="hidden sm:block flex-shrink-0 relative z-0"
            style={{ color: "rgb(239 68 68 / 0.20)" }}
          />
        </div>

        {/* Community Quiz (Coming Soon) */}
        <div
          className="rounded-2xl p-6 border flex flex-col justify-between relative"
          style={{
            background: "var(--color-surface-900)",
            borderColor: "var(--color-surface-800)",
            opacity: 0.7,
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3
                className="font-bold flex items-center gap-2 text-base"
                style={{ color: "var(--color-surface-300)" }}
              >
                <Globe size={18} style={{ color: "var(--color-surface-500)" }} />
                {t("dashboard.communityQuiz")}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-surface-500)" }}>
                {t("dashboard.communityDesc")}
              </p>
            </div>
            <div
              className="p-2.5 rounded-xl"
              style={{ background: "var(--color-surface-800)", color: "var(--color-surface-600)" }}
            >
              <Globe size={20} />
            </div>
          </div>
          <button
            disabled
            className="w-full py-2.5 rounded-xl font-bold text-sm cursor-not-allowed border"
            style={{
              background: "var(--color-surface-800)",
              color: "var(--color-surface-600)",
              borderColor: "var(--color-surface-700)",
            }}
          >
            {t("dashboard.soon")}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TOPIC GRID
      ═══════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-surface-50)" }}>
            <BookOpen size={20} style={{ color: "var(--color-brand-400)" }} />
            {t("dashboard.exploreTopics")}
          </h2>
        </div>

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((topic, idx) => {
              const colors = [
                { bg: "rgb(99 102 241 / 0.12)",  icon: "var(--color-brand-400)",  border: "rgb(99 102 241 / 0.20)"  },
                { bg: "rgb(139 92 246 / 0.12)",  icon: "#c084fc",                border: "rgb(139 92 246 / 0.20)"  },
                { bg: "rgb(14 165 233 / 0.12)",  icon: "#38bdf8",                border: "rgb(14 165 233 / 0.20)"  },
                { bg: "rgb(34 197 94 / 0.12)",   icon: "#4ade80",                border: "rgb(34 197 94 / 0.20)"   },
                { bg: "rgb(249 115 22 / 0.12)",  icon: "#fb923c",                border: "rgb(249 115 22 / 0.20)"  },
                { bg: "rgb(236 72 153 / 0.12)",  icon: "#f472b6",                border: "rgb(236 72 153 / 0.20)"  },
              ];
              const c = colors[idx % colors.length];
              return (
                <Link
                  key={topic.ID}
                  to={`/topic/${topic.slug}`}
                  className="group rounded-2xl border p-5 flex flex-col h-full transition-all duration-200"
                  style={{
                    background: "var(--color-surface-900)",
                    borderColor: "var(--color-surface-800)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = c.border;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 8px 32px ${c.bg}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--color-surface-800)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all"
                    style={{ background: c.bg, color: c.icon }}
                  >
                    <Hash size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3
                      className="text-base font-bold mb-1.5 transition-colors"
                      style={{ color: "var(--color-surface-100)" }}
                    >
                      {topic.title}
                    </h3>
                    <p className="text-sm line-clamp-2" style={{ color: "var(--color-surface-500)" }}>
                      {topic.description || "Topik menarik untuk mengasah pengetahuanmu."}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="mt-5 pt-4 flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--color-surface-800)" }}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-surface-500)" }}>
                      {t("dashboard.startQuiz")}
                    </span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{ background: "var(--color-surface-800)", color: "var(--color-surface-400)" }}
                    >
                      <Play size={12} fill="currentColor" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-2xl border border-dashed"
            style={{
              background: "var(--color-surface-900)",
              borderColor: "var(--color-surface-700)",
            }}
          >
            <div
              className="inline-flex p-4 rounded-full mb-4"
              style={{ background: "var(--color-surface-800)" }}
            >
              <BookOpen size={28} style={{ color: "var(--color-surface-600)" }} />
            </div>
            <p className="font-medium" style={{ color: "var(--color-surface-500)" }}>
              {t("dashboard.noTopics")}
            </p>
          </div>
        )}
      </div>

      {/* ── REMEDIAL MODAL ── */}
      <Modal
        isOpen={showRemedialModal}
        onClose={() => setShowRemedialModal(false)}
        maxWidth="max-w-md"
      >
        <div className="text-center">
          {analyzing ? (
            <div className="py-10">
              <Loader2 size={44} className="animate-spin mx-auto mb-4" style={{ color: "var(--color-brand-400)" }} />
              <h3 className="text-lg font-bold" style={{ color: "var(--color-surface-100)" }}>
                {t("modals.analyzing")}
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--color-surface-500)" }}>
                {t("modals.analyzingDesc")}
              </p>
            </div>
          ) : (
            <>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgb(239 68 68 / 0.15)", color: "#f87171" }}
              >
                <AlertTriangle size={30} />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: "var(--color-surface-50)" }}>
                {t("modals.diagnosisComplete")}
              </h2>
              <p className="text-sm mb-6 px-2" style={{ color: "var(--color-surface-400)" }}>
                {t("modals.weaknessFocus")}
              </p>

              <div
                className="rounded-xl p-4 text-left border mb-6"
                style={{
                  background: "var(--color-surface-800)",
                  borderColor: "var(--color-surface-700)",
                }}
              >
                <h4
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: "var(--color-surface-500)" }}
                >
                  {t("modals.todayFocus")}
                </h4>
                <div className="space-y-2">
                  {weakTopics.length > 0 ? (
                    weakTopics.map((topicName, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                        style={{
                          background: "var(--color-surface-900)",
                          borderColor: "rgb(239 68 68 / 0.20)",
                        }}
                      >
                        <XCircle size={16} style={{ color: "#f87171", flexShrink: 0 }} />
                        <span className="font-bold text-sm" style={{ color: "var(--color-surface-200)" }}>
                          {topicName}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs italic" style={{ color: "var(--color-surface-500)" }}>
                      {t("modals.noWeakness")}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRemedialModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold transition border cursor-pointer"
                  style={{
                    background: "var(--color-surface-800)",
                    color: "var(--color-surface-300)",
                    borderColor: "var(--color-surface-700)",
                  }}
                >
                  {t("modals.later")}
                </button>
                <button
                  onClick={startRemedial}
                  className="flex-1 py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 border-none cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                    boxShadow: "0 4px 20px rgb(239 68 68 / 0.25)",
                  }}
                >
                  {t("modals.startRemedial")} <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
