// src/pages/social/ChallengeList.jsx

import { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { socialAPI } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import {
  Swords, Clock, CheckCircle2, PlayCircle, Crown, AlertTriangle,
  Users, Zap, Medal, Skull, XCircle, Loader2, Hourglass, Gamepad2,
  RefreshCw, LogIn, Trophy, Target, Coins, LogOut, KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import CreateChallengeModal from "../../components/ui/CreateChallengeModal";
import JoinLobbyModal from "../../components/ui/JoinLobbyModal";

/* ─── Rank helpers (dark-safe) ─────────────────────────────── */
const getRankStyle = (index, totalPlayers, pStatus) => {
  if (pStatus === "rejected") return { background: "rgb(239 68 68 / 0.06)", border: "1px solid rgb(239 68 68 / 0.18)", opacity: 0.6 };
  if (pStatus === "pending")  return { background: "var(--color-surface-800)", border: "1px dashed var(--color-surface-600)" };
  if (index === 0)            return { background: "rgb(234 179 8 / 0.10)",  border: "1px solid rgb(234 179 8 / 0.30)" };
  if (index === 1 && totalPlayers > 1) return { background: "var(--color-surface-800)", border: "1px solid var(--color-surface-700)" };
  if (index === 2 && totalPlayers > 3) return { background: "rgb(249 115 22 / 0.08)", border: "1px solid rgb(249 115 22 / 0.20)" };
  if (index === totalPlayers - 1 && totalPlayers > 1) return { background: "rgb(239 68 68 / 0.06)", border: "1px solid rgb(239 68 68 / 0.15)" };
  return { background: "var(--color-surface-800)", border: "1px solid var(--color-surface-700)" };
};

const getRankIcon = (index, totalPlayers, pStatus) => {
  if (pStatus === "rejected") return <XCircle size={16} style={{ color: "#f87171" }} />;
  if (pStatus === "pending")  return <Clock size={16} style={{ color: "var(--color-surface-600)" }} />;
  if (index === 0)            return <Crown size={16} style={{ color: "#fbbf24", fill: "#fbbf24" }} />;
  if (index === 1 && totalPlayers > 1) return <Medal size={16} style={{ color: "#94a3b8" }} />;
  if (index === 2 && totalPlayers > 3) return <Medal size={16} style={{ color: "#f97316" }} />;
  if (index === totalPlayers - 1 && totalPlayers > 1) return <Skull size={14} style={{ color: "#f87171" }} />;
  return <span style={{ color: "var(--color-surface-500)", fontWeight: 900, fontSize: 11 }}>#{index + 1}</span>;
};

/* ─── PlayerRow ─────────────────────────────────────────────── */
const PlayerRow = ({ p, idx, totalPlayers, isMe, isFinished, mode }) => {
  const { t } = useLanguage();
  const hasPlayed = p.score !== -1;
  const isSurvival = mode === "survival";
  const rowStyle = isFinished || hasPlayed ? getRankStyle(idx, totalPlayers, p.status) : { background: "var(--color-surface-800)", border: "1px solid var(--color-surface-700)" };

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl mb-2 last:mb-0"
      style={rowStyle}
    >
      <div className="flex items-center gap-3">
        <div className="w-5 flex justify-center">
          {isFinished || hasPlayed
            ? getRankIcon(idx, totalPlayers, p.status)
            : <Users size={14} style={{ color: "var(--color-surface-600)" }} />}
        </div>
        <div>
          <p className="text-sm font-black" style={{ color: isMe ? "var(--color-brand-400)" : "var(--color-surface-200)" }}>
            {isMe ? t("challenge.you") : p.user?.name}
          </p>
          <div className="text-[10px] font-bold mt-0.5">
            {p.status === "rejected" ? (
              <span style={{ color: "#f87171" }}>{t("challenge.rejected")}</span>
            ) : p.status === "pending" ? (
              <span style={{ color: "#fb923c" }}>{t("challenge.pending")}</span>
            ) : hasPlayed ? (
              <span style={{ color: "var(--color-surface-500)" }}>{p.time_taken}s</span>
            ) : p.status === "accepted" ? (
              <span style={{ color: "#60a5fa" }}>{t("challenge.ready")}</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="font-black text-sm" style={{ color: "var(--color-surface-300)" }}>
        {hasPlayed ? (isSurvival ? `${t("challenge.streak")}: ${p.score}` : p.score) : "–"}
      </div>
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────── */
const ChallengeList = () => {
  const { t } = useLanguage();
  const [challenges, setChallenges]   = useState([]);
  const [stats, setStats]             = useState({ total: 0, wins: 0, win_rate: 0 });
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loading, setLoading]         = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal]     = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, challengeId: null, challengerName: "" });

  const observer = useRef();
  const lastElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) setPage((p) => p + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const fetchData = async (pageNum, reset = false) => {
    setLoading(true);
    try {
      const res = await socialAPI.getMyChallenges(pageNum, 10);
      const { list, stats: serverStats, has_more } = res.data.data;
      setChallenges((prev) => {
        if (reset) return list || [];
        const existingIds = new Set(prev.map((c) => c.ID));
        return [...prev, ...(list || []).filter((c) => !existingIds.has(c.ID))];
      });
      if (pageNum === 1 && serverStats) setStats(serverStats);
      setHasMore(has_more);
    } catch (err) {
      toast.error("Gagal memuat data duel");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => { fetchData(page, page === 1); }, [page]);
  useEffect(() => { document.title = "Arena Duel | QuizApp"; }, []);

  const handleRefresh = () => { setPage(1); fetchData(1, true); };

  const handleCreateSuccess = (newChallenge) => {
    handleRefresh();
    if (newChallenge?.ID) navigate(`/lobby/${newChallenge.ID}`);
  };

  const handleAccept = async (id, isRealtime, title, creatorId, timeLimit) => {
    try {
      await socialAPI.acceptChallenge(id);
      toast.success("Tantangan diterima!");
      navigate(`/lobby/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menerima tantangan");
    }
  };

  const handleEnterLobby = (id) => navigate(`/lobby/${id}`);

  const handleRejoinGame = (duel) => {
    if (duel.mode === "survival") {
      navigate("/play/survival", { state: { isRealtime: duel.is_realtime, lobbyId: duel.ID, challengeID: duel.ID, isChallenge: true, seed: duel.seed, timeLimit: duel.time_limit || 0, rejoining: true, mode: "survival" } });
    } else {
      navigate(`/play/${duel.quiz_id}`, { state: { isRealtime: duel.is_realtime, lobbyId: duel.ID, title: duel.quiz?.title, timeLimit: duel.time_limit || 0, rejoining: true, challengeID: duel.ID, isChallenge: true, mode: duel.mode } });
    }
  };

  const handleRefuse = async () => {
    try {
      await socialAPI.refuseChallenge(confirmModal.challengeId);
      toast.success("Tantangan ditolak.");
      handleRefresh();
    } catch (err) {
      toast.error("Gagal menolak tantangan");
    } finally {
      setConfirmModal({ challengeId: null, challengerName: "", isOpen: false });
    }
  };

  /* ── Skeleton ────────────────────────────────────────────── */
  if (initialLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-14 w-40 rounded-xl" />
          <Skeleton className="h-14 w-40 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  /* ── Main Render ─────────────────────────────────────────── */
  return (
    <div className="max-w-[1080px] mx-auto pb-20 space-y-8">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2" style={{ color: "var(--color-surface-50)" }}>
            <Swords style={{ color: "#f97316" }} />
            {t("challenge.arenaTitle")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-surface-500)" }}>
            {t("challenge.arenaDesc")}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-5 py-2.5 flex-1 md:flex-none font-black text-sm rounded-xl transition-all inline-flex items-center justify-center gap-2"
            style={{
              background: "var(--color-surface-800)",
              color: "var(--color-brand-400)",
              border: "1px solid var(--color-surface-700)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-700)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-surface-800)")}
          >
            <KeyRound size={15} />
            {t("challenge.enterCode")?.split(" ")[0] || "Masuk Code"}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 flex-1 md:flex-none font-black text-sm text-white rounded-xl transition-all inline-flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
              boxShadow: "0 4px 20px rgb(234 88 12 / 0.30)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 24px rgb(234 88 12 / 0.50)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgb(234 88 12 / 0.30)")}
          >
            <Swords size={15} />
            {t("challenge.createChallenge")}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-3">
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: "var(--color-surface-900)", border: "1px solid var(--color-surface-800)" }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgb(99 102 241 / 0.12)" }}>
            <Target size={15} style={{ color: "var(--color-brand-400)" }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-surface-500)" }}>{t("challenge.totalDuel")}</p>
            <p className="text-sm font-black" style={{ color: "var(--color-surface-100)" }}>{stats.total} {t("challenge.played")}</p>
          </div>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: "var(--color-surface-900)", border: "1px solid var(--color-surface-800)" }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgb(234 179 8 / 0.12)" }}>
            <Trophy size={15} style={{ color: "#fbbf24" }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-surface-500)" }}>{t("challenge.won")}</p>
            <p className="text-sm font-black" style={{ color: "var(--color-surface-100)" }}>{stats.wins}x ({stats.win_rate}%)</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {challenges.length === 0 ? (
        <div
          className="text-center py-24 rounded-3xl border border-dashed"
          style={{ background: "var(--color-surface-900)", borderColor: "var(--color-surface-700)" }}
        >
          <div
            className="inline-flex p-4 rounded-full mb-4"
            style={{ background: "var(--color-surface-800)" }}
          >
            <Swords size={32} style={{ color: "var(--color-surface-700)" }} />
          </div>
          <h3 className="text-lg font-black mb-1" style={{ color: "var(--color-surface-300)" }}>
            {t("challenge.noActiveDuel")}
          </h3>
          <p className="text-sm mb-5" style={{ color: "var(--color-surface-500)" }}>
            {t("challenge.noDuelDesc")}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 rounded-full font-black text-sm text-white"
            style={{ background: "var(--color-brand-500)", boxShadow: "0 4px 16px rgb(99 102 241 / 0.30)" }}
          >
            {t("challenge.findOpponent")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {challenges.map((duel, index) => {
            const isLastElement  = index === challenges.length - 1;
            const participants   = duel.participants || [];
            const myParticipant  = participants.find((p) => p.user_id === user.ID);
            const myStatus       = myParticipant?.status || "pending";
            const myScore        = myParticipant?.score ?? -1;
            const isFinished     = duel.status === "finished";
            const isActive       = duel.status === "active";
            const isRejected     = duel.status === "rejected";
            const allAccepted    = participants.every((p) => p.status === "accepted" || p.status === "finished");
            const isRealtime     = duel.is_realtime;
            const isBattleRoyale = duel.mode === "battleroyale";
            const isMyCreated    = duel.creator_id === user.ID;
            const is2v2          = duel.mode === "2v2";

            const sortedParticipants = [...participants].sort((a, b) => {
              if (a.score !== -1 && b.score === -1) return -1;
              if (a.score === -1 && b.score !== -1) return 1;
              if (a.score !== -1 && b.score !== -1) return b.score !== a.score ? b.score - a.score : a.time_taken - b.time_taken;
              if (a.status === "rejected" && b.status !== "rejected") return 1;
              if (b.status === "rejected" && a.status !== "rejected") return -1;
              return 0;
            });

            const teamA = participants.filter((p) => p.team === "A");
            const teamB = participants.filter((p) => p.team === "B");
            const scoreA = teamA.reduce((acc, curr) => acc + (curr.score > -1 ? curr.score : 0), 0);
            const scoreB = teamB.reduce((acc, curr) => acc + (curr.score > -1 ? curr.score : 0), 0);

            let winnerText = null;
            let winnerStyle = { background: "var(--color-surface-800)", color: "var(--color-surface-400)", border: "1px solid var(--color-surface-700)" };
            if (isFinished) {
              const iWon = is2v2
                ? myParticipant?.team === duel.winning_team
                : duel.winner_id === user.ID;
              if (is2v2) {
                winnerText = duel.winning_team === "A" ? t("challenge.winnerTeamA") : duel.winning_team === "B" ? t("challenge.winnerTeamB") : t("challenge.winnerDraw");
              } else {
                if (duel.winner_id === user.ID) winnerText = t("challenge.winnerYou");
                else if (duel.winner_id) winnerText = `${participants.find((p) => p.user_id === duel.winner_id)?.user?.name || "Lawan"} ${t("challenge.won").toUpperCase()}!`;
                else winnerText = t("challenge.winnerDraw");
              }
              if (iWon) winnerStyle = { background: "rgb(234 179 8 / 0.12)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.30)" };
            }

            const cardBg     = isFinished && ((is2v2 && duel.winning_team === myParticipant?.team) || duel.winner_id === user.ID)
              ? "rgb(234 179 8 / 0.05)"
              : isRejected ? "rgb(239 68 68 / 0.04)" : "var(--color-surface-900)";
            const cardBorder = isFinished && ((is2v2 && duel.winning_team === myParticipant?.team) || duel.winner_id === user.ID)
              ? "rgb(234 179 8 / 0.25)"
              : isRejected ? "rgb(239 68 68 / 0.18)" : "var(--color-surface-800)";

            return (
              <div
                key={duel.ID}
                ref={isLastElement ? lastElementRef : null}
                className="relative overflow-hidden rounded-3xl transition-all"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                {/* Card Header */}
                <div className="p-5" style={{ borderBottom: "1px solid var(--color-surface-800)" }}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded tracking-wider"
                          style={{ background: "var(--color-surface-800)", color: "var(--color-surface-500)", border: "1px solid var(--color-surface-700)" }}
                        >
                          {t("classroom.code")}: {duel.room_code}
                        </span>

                        {/* Mode badge */}
                        {{
                          "2v2":         <span className="text-[10px] font-black px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "rgb(99 102 241 / 0.12)", color: "var(--color-brand-400)" }}><Users size={9} /> 2V2</span>,
                          battleroyale:  <span className="text-[10px] font-black px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "rgb(168 85 247 / 0.12)", color: "#c084fc" }}><Users size={9} /> ROYALE</span>,
                          survival:      <span className="text-[10px] font-black px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "rgb(168 85 247 / 0.12)", color: "#c084fc" }}><Skull size={9} /> SURVIVAL</span>,
                        }[duel.mode] ?? <span className="text-[10px] font-black px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "rgb(249 115 22 / 0.12)", color: "#fb923c" }}><Swords size={9} /> 1V1</span>}

                        {duel.is_realtime && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "rgb(59 130 246 / 0.12)", color: "#60a5fa" }}>
                            <Zap size={9} /> REALTIME
                          </span>
                        )}
                        {duel.time_limit > 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "rgb(34 197 94 / 0.10)", color: "#4ade80" }}>
                            <Hourglass size={9} /> {duel.time_limit}s
                          </span>
                        )}
                        {duel.wager_amount > 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded inline-flex items-center gap-1 animate-pulse" style={{ background: "rgb(234 179 8 / 0.12)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.20)" }}>
                            <Coins size={9} /> POT: {duel.wager_amount * (duel.mode === "2v2" ? 4 : 2)}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black leading-tight" style={{ color: "var(--color-surface-100)" }}>
                        {duel.quiz?.title}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-surface-500)" }}>
                        Host: {duel.creator_id === user.ID ? "Kamu" : duel.creator?.name}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0">
                      {isFinished ? (
                        <div className="px-3 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-1" style={winnerStyle}>
                          <Crown size={11} /> {winnerText || "SELESAI"}
                        </div>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-full" style={{ background: "rgb(239 68 68 / 0.12)", color: "#f87171", border: "1px solid rgb(239 68 68 / 0.20)" }}>
                          <XCircle size={12} /> DIBATALKAN
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full animate-pulse" style={{ background: "rgb(34 197 94 / 0.12)", color: "#4ade80" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> LIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-full" style={{ background: "rgb(249 115 22 / 0.10)", color: "#fb923c", border: "1px solid rgb(249 115 22 / 0.15)" }}>
                          <Clock size={11} /> MENUNGGU
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="p-4" style={{ background: "rgb(0 0 0 / 0.15)" }}>
                  {is2v2 ? (
                    <div className="flex flex-col gap-4">
                      {/* Team A */}
                      <div className="p-3 rounded-xl" style={{ background: duel.winning_team === "A" ? "rgb(234 179 8 / 0.08)" : "rgb(99 102 241 / 0.06)", border: duel.winning_team === "A" ? "1px solid rgb(234 179 8 / 0.25)" : "1px solid rgb(99 102 241 / 0.15)", position: "relative" }}>
                        {duel.winning_team === "A" && (
                          <div className="absolute top-0 right-0 text-[9px] font-black px-2 py-0.5 rounded-bl-lg" style={{ background: "#fbbf24", color: "#1e293b" }}>WINNER</div>
                        )}
                        <div className="flex justify-between mb-2 text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--color-brand-400)" }}>
                          <span>Team A (Host)</span>
                          {isFinished && <span>Total: {scoreA}</span>}
                        </div>
                        {teamA.map((p, idx) => <PlayerRow key={p.ID} p={p} idx={idx} totalPlayers={teamA.length} isMe={p.user_id === user.ID} isFinished={isFinished} mode={duel.mode} />)}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px" style={{ background: "var(--color-surface-700)" }} />
                        <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ background: "var(--color-surface-800)", color: "var(--color-surface-500)", border: "1px solid var(--color-surface-700)" }}>VS</span>
                        <div className="flex-1 h-px" style={{ background: "var(--color-surface-700)" }} />
                      </div>

                      {/* Team B */}
                      <div className="p-3 rounded-xl" style={{ background: duel.winning_team === "B" ? "rgb(234 179 8 / 0.08)" : "rgb(239 68 68 / 0.06)", border: duel.winning_team === "B" ? "1px solid rgb(234 179 8 / 0.25)" : "1px solid rgb(239 68 68 / 0.15)", position: "relative" }}>
                        {duel.winning_team === "B" && (
                          <div className="absolute top-0 right-0 text-[9px] font-black px-2 py-0.5 rounded-bl-lg" style={{ background: "#fbbf24", color: "#1e293b" }}>WINNER</div>
                        )}
                        <div className="flex justify-between mb-2 text-[10px] font-black uppercase tracking-wider" style={{ color: "#f87171" }}>
                          <span>Team B (Challengers)</span>
                          {isFinished && <span>Total: {scoreB}</span>}
                        </div>
                        {teamB.map((p, idx) => <PlayerRow key={p.ID} p={p} idx={idx} totalPlayers={teamB.length} isMe={p.user_id === user.ID} isFinished={isFinished} mode={duel.mode} />)}
                      </div>
                    </div>
                  ) : (
                    sortedParticipants.map((p, idx) => (
                      <PlayerRow key={p.ID} p={p} idx={idx} totalPlayers={sortedParticipants.length} isMe={p.user_id === user.ID} isFinished={isFinished} mode={duel.mode} />
                    ))
                  )}
                </div>

                {/* Footer Actions */}
                {!isFinished && !isRejected && (
                  <div className="px-5 pb-5 pt-3">
                    {myStatus === "pending" && !isMyCreated && (
                      <div className="flex flex-col gap-2">
                        {duel.wager_amount > 0 && (
                          <p className="text-[10px] text-center p-1.5 rounded font-bold" style={{ background: "rgb(234 179 8 / 0.08)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.15)" }}>
                            ⚠️ Menerima akan memotong <b>{duel.wager_amount} Koin</b> dari dompetmu.
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(duel.ID, isRealtime, duel.quiz?.title, duel.creator_id, duel.time_limit || 0)}
                            className="flex-1 py-3 font-black text-sm text-white rounded-xl inline-flex items-center justify-center gap-2 transition-all"
                            style={{ background: "var(--color-brand-500)", boxShadow: "0 4px 16px rgb(99 102 241 / 0.30)" }}
                          >
                            <CheckCircle2 size={16} />
                            {is2v2 ? "Gabung Tim" : t("challenge.accept")}
                          </button>
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, challengeId: duel.ID, challengerName: duel.creator?.name })}
                            className="px-5 py-3 font-black text-sm rounded-xl transition-all"
                            style={{ background: "rgb(239 68 68 / 0.10)", color: "#f87171", border: "1px solid rgb(239 68 68 / 0.20)" }}
                          >
                            {t("challenge.reject")}
                          </button>
                        </div>
                      </div>
                    )}

                    {myStatus === "pending" && isMyCreated && (
                      <button
                        onClick={() => handleEnterLobby(duel.ID)}
                        className="w-full py-3 font-black text-sm text-white rounded-xl inline-flex items-center justify-center gap-2 transition-all"
                        style={{ background: "rgb(59 130 246 / 0.80)", border: "1px solid rgb(59 130 246 / 0.30)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(59 130 246 / 1.0)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(59 130 246 / 0.80)")}
                      >
                        <LogIn size={16} /> {t("challenge.enterLobby")}
                      </button>
                    )}

                    {myStatus === "accepted" && myScore === -1 && (
                      isRealtime ? (
                        isActive ? (
                          <button
                            onClick={() => handleRejoinGame(duel)}
                            className="w-full py-3 font-black text-sm text-white rounded-xl inline-flex items-center justify-center gap-2 animate-pulse"
                            style={{ background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)", boxShadow: "0 4px 16px rgb(22 163 74 / 0.30)" }}
                          >
                            <RefreshCw size={16} /> GAME BERLANGSUNG! MASUK KEMBALI
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnterLobby(duel.ID)}
                            className="w-full py-3 font-black text-sm text-white rounded-xl inline-flex items-center justify-center gap-2"
                            style={{ background: "rgb(59 130 246 / 0.80)", border: "1px solid rgb(59 130 246 / 0.30)" }}
                          >
                            <LogIn size={16} /> {t("challenge.enterLobby")}
                          </button>
                        )
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEnterLobby(duel.ID)}
                            className="px-4 py-3 font-black text-sm text-white rounded-xl inline-flex items-center justify-center gap-2"
                            style={{ background: "rgb(59 130 246 / 0.80)", border: "1px solid rgb(59 130 246 / 0.30)" }}
                          >
                            <LogIn size={16} />
                          </button>
                          {(isActive || allAccepted) && (
                            duel.mode === "survival" ? (
                              <Link
                                to="/play/survival"
                                state={{ isChallenge: true, isRealtime, timeLimit: duel.time_limit || 0, challengeID: duel.ID, seed: duel.seed, mode: "survival" }}
                                className="flex-1 py-3 font-black text-sm text-white rounded-xl inline-flex items-center justify-center gap-2 animate-pulse"
                                style={{ background: "linear-gradient(135deg, #dc2626 0%, #e11d48 100%)", boxShadow: "0 4px 16px rgb(220 38 38 / 0.30)" }}
                              >
                                <Skull size={16} /> SURVIVAL START
                              </Link>
                            ) : (
                              <Link
                                to={`/play/${duel.quiz_id}`}
                                state={{ title: duel.quiz?.title, isChallenge: true, isRealtime, timeLimit: duel.time_limit || 0, challengeID: duel.ID, mode: duel.mode }}
                                className="flex-1 py-3 font-black text-sm text-white rounded-xl inline-flex items-center justify-center gap-2 animate-pulse"
                                style={{ background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)", boxShadow: "0 4px 16px rgb(234 88 12 / 0.30)" }}
                              >
                                <PlayCircle size={16} /> {t("quizList.play")}
                              </Link>
                            )
                          )}
                          {!isActive && !allAccepted && (
                            <div className="flex-1 py-3 font-black text-sm rounded-xl inline-flex items-center justify-center gap-2" style={{ background: "var(--color-surface-800)", color: "var(--color-surface-600)", cursor: "not-allowed" }}>
                              <Clock size={14} /> {t("challenge.waitingForHost")}
                            </div>
                          )}
                        </div>
                      )
                    )}

                    {myScore !== -1 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEnterLobby(duel.ID)}
                          className="flex-1 py-3 font-black text-sm rounded-xl inline-flex items-center justify-center gap-2 transition-all"
                          style={{ background: "var(--color-surface-800)", color: "var(--color-surface-400)", border: "1px solid var(--color-surface-700)" }}
                        >
                          <LogIn size={16} /> Lihat Lobby
                        </button>
                        {isActive && (
                          <div className="flex-1 py-3 font-black text-sm rounded-xl inline-flex items-center justify-center gap-2" style={{ background: "var(--color-surface-800)", color: "var(--color-surface-600)", borderStyle: "dashed", border: "1px dashed var(--color-surface-700)" }}>
                            <Clock size={14} /> Menunggu Lawan...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {isRejected && (
                  <div className="px-5 pb-5 pt-3">
                    <div className="w-full py-3 font-black text-xs rounded-xl inline-flex items-center justify-center gap-2" style={{ background: "rgb(239 68 68 / 0.08)", color: "#f87171", border: "1px solid rgb(239 68 68 / 0.15)" }}>
                      <XCircle size={14} /> Tantangan ini telah dibatalkan.
                    </div>
                  </div>
                )}

                {myStatus === "rejected" && !isRejected && (
                  <div className="px-5 pb-5 pt-2">
                    <div className="w-full py-2 text-center text-xs font-bold rounded-lg" style={{ background: "rgb(239 68 68 / 0.06)", color: "#f87171" }}>
                      Anda telah menolak tantangan ini.
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="py-4 text-center inline-flex items-center justify-center gap-2" style={{ color: "var(--color-surface-500)" }}>
              <Loader2 size={18} className="animate-spin" /> Memuat data...
            </div>
          )}
          {!hasMore && challenges.length > 0 && (
            <p className="py-4 text-center text-sm" style={{ color: "var(--color-surface-600)" }}>Semua data telah dimuat.</p>
          )}
        </div>
      )}

      {/* Confirm Reject Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        maxWidth="max-w-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgb(239 68 68 / 0.12)" }}>
            <AlertTriangle size={22} style={{ color: "#f87171" }} />
          </div>
          <h2 className="text-lg font-black" style={{ color: "var(--color-surface-100)" }}>Tolak Tantangan?</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--color-surface-400)" }}>
          Yakin ingin menolak tantangan dari <span className="font-black" style={{ color: "var(--color-surface-200)" }}>{confirmModal.challengerName}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm transition-colors"
            style={{ background: "var(--color-surface-800)", color: "var(--color-surface-300)", border: "1px solid var(--color-surface-700)" }}
          >
            {t("challenge.cancel")}
          </button>
          <button
            onClick={handleRefuse}
            className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm text-white"
            style={{ background: "#dc2626" }}
          >
            {t("challenge.reject")}
          </button>
        </div>
      </Modal>

      <CreateChallengeModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={handleCreateSuccess} />
      <JoinLobbyModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </div>
  );
};

export default ChallengeList;
