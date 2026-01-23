// src/pages/social/ChallengeList.jsx

import { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { socialAPI } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import {
  Swords,
  Clock,
  CheckCircle2,
  PlayCircle,
  Crown,
  AlertTriangle,
  Users,
  Zap,
  Medal,
  Skull,
  XCircle,
  Loader2,
  Hourglass,
  Gamepad2,
  RefreshCw,
  LogIn,
  Trophy,
  Target,
  Coins,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
// import { EventSourcePolyfill } from "event-source-polyfill"; // Removed
import { KeyRound } from "lucide-react"; // Added KeyRound
import Skeleton from "../../components/ui/Skeleton";
import CreateChallengeModal from "../../components/ui/CreateChallengeModal";
import JoinLobbyModal from "../../components/ui/JoinLobbyModal"; // NEW
// Moved to QuizList

// --- HELPER COMPONENT: PLAYER ROW ---
const PlayerRow = ({
  p,
  idx,
  totalPlayers,
  isMe,
  isFinished,
  getRankStyle,
  getRankIcon,
  mode,
}) => {
  const { t } = useLanguage();
  const hasPlayed = p.score !== -1;
  const isSurvival = mode === "survival";

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border shadow-sm mb-2 last:mb-0 ${
        isFinished || hasPlayed
          ? getRankStyle(idx, totalPlayers, p.status)
          : "bg-white border-slate-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-6 flex justify-center">
          {isFinished || hasPlayed ? (
            getRankIcon(idx, totalPlayers, p.status)
          ) : (
            <Users size={16} className="text-slate-300" />
          )}
        </div>
        <div>
          <p
            className={`text-sm font-bold ${
              isMe ? "text-indigo-700" : "text-slate-700"
            }`}
          >
            {isMe ? t("challenge.you") : p.user?.name}
          </p>
          <div className="text-[10px] font-medium mt-0.5">
            {p.status === "rejected" ? (
              <span className="text-red-500">{t("challenge.rejected")}</span>
            ) : p.status === "pending" ? (
              <span className="text-orange-500">{t("challenge.pending")}</span>
            ) : hasPlayed ? (
              <span className="text-slate-400">{p.time_taken}s</span>
            ) : p.status === "accepted" ? (
              isFinished || p.status === "rejected" ? (
                <span className="text-slate-400 italic">
                  {t("challenge.cancelled")}
                </span>
              ) : (
                <span className="text-blue-600">{t("challenge.ready")}</span>
              )
            ) : null}
          </div>
        </div>
      </div>
      <div className="font-bold text-slate-700">
        {hasPlayed
          ? isSurvival
            ? `${t("challenge.streak")}: ${p.score}`
            : p.score
          : "-"}
      </div>
    </div>
  );
};

// LobbyModal Logic Moved to /pages/social/LobbyPage.jsx

// --- UTAMA: LIST CHALLENGE (INFINITE SCROLL) ---
const ChallengeList = () => {
  const { t } = useLanguage();
  const [challenges, setChallenges] = useState([]);
  // [BARU] State untuk Statistik & Pagination
  const [stats, setStats] = useState({ total: 0, wins: 0, win_rate: 0 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // [BARU] Observer untuk Infinite Scroll
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [lobbyModal, setLobbyModal] = useState({
    isOpen: false,
    challengeId: null,
    title: "",
    isHost: false,
    timeLimit: 0,
  }); // Unused but kept to avoid too many deleted lines if referenced elsewhere, but logically deprecated. Or just remove usage.

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    challengeId: null,
    challengerName: "",
  });

  // NEW: Handle Navigation after Create
  const handleCreateSuccess = (newChallenge) => {
    // Refresh list to keep it updated too
    handleRefresh();
    // Navigate to Lobby
    if (newChallenge && newChallenge.ID) {
      navigate(`/lobby/${newChallenge.ID}`);
    }
  };

  useEffect(() => {
    document.title = "Arena Duel | QuizApp";
  }, []);

  // [BARU] Fetch Data dengan Pagination
  const fetchData = async (pageNum, reset = false) => {
    setLoading(true);
    try {
      const res = await socialAPI.getMyChallenges(pageNum, 10);
      const { list, stats: serverStats, has_more } = res.data.data;

      // Update List: Append jika scroll, Replace jika reset
      setChallenges((prev) => {
        if (reset) return list || [];
        // Cegah duplikat ID
        const existingIds = new Set(prev.map((c) => c.ID));
        const uniqueList = (list || []).filter((c) => !existingIds.has(c.ID));
        return [...prev, ...uniqueList];
      });

      // Update Stats (Hanya ambil dari page 1 agar konsisten)
      if (pageNum === 1 && serverStats) {
        setStats(serverStats);
      }

      setHasMore(has_more);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data duel");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Trigger saat Page Berubah
  useEffect(() => {
    fetchData(page, page === 1);
  }, [page]);

  // Fungsi Refresh Manual (reset ke page 1)
  const handleRefresh = () => {
    setPage(1);
    fetchData(1, true);
  };

  // NEW: State Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false); // NEW

  const handleAccept = async (id, isRealtime, title, creatorId, timeLimit) => {
    try {
      await socialAPI.acceptChallenge(id);
      toast.success("Tantangan diterima!");
      // handleRefresh(); // No need to refresh list if we navigate away immediately

      // Navigate to Lobby Page
      navigate(`/lobby/${id}`);
    } catch (err) {
      console.log(err);
      const msg = err.response?.data?.message || "Gagal menerima tantangan";
      toast.error(msg);
    }
  };

  const handleEnterLobby = async (id, title, creatorId, timeLimit) => {
    navigate(`/lobby/${id}`);
  };

  const handleRejoinGame = (duel) => {
    if (duel.mode === "survival") {
      navigate("/play/survival", {
        state: {
          isRealtime: duel.is_realtime,
          lobbyId: duel.ID,
          challengeID: duel.ID,
          isChallenge: true,
          seed: duel.seed,
          timeLimit: duel.time_limit || 0,
          rejoining: true,
          mode: "survival",
        },
      });
    } else {
      navigate(`/play/${duel.quiz_id}`, {
        state: {
          isRealtime: duel.is_realtime,
          lobbyId: duel.ID,
          title: duel.quiz?.title,
          timeLimit: duel.time_limit || 0,
          rejoining: true,
          challengeID: duel.ID,
          isChallenge: true,
          mode: duel.mode,
        },
      });
    }
  };

  const handleRefuse = async () => {
    try {
      await socialAPI.refuseChallenge(confirmModal.challengeId);
      toast.success("Tantangan ditolak.");
      handleRefresh();
    } catch (err) {
      console.log(err);
      toast.error("Gagal menolak tantangan");
    } finally {
      setConfirmModal({ challengeId: null, challengerName: "", isOpen: false });
    }
  };

  const getRankStyle = (index, totalPlayers, pStatus) => {
    if (pStatus === "rejected")
      return "bg-red-50/30 border-red-100 opacity-70 grayscale";
    if (pStatus === "pending")
      return "bg-slate-50 border-slate-200 border-dashed";
    if (index === 0)
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200/60";
    if (index === 1 && totalPlayers > 1)
      return "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200";
    if (index === 2 && totalPlayers > 3)
      return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200";
    if (index === totalPlayers - 1 && totalPlayers > 1)
      return "bg-red-50/50 border-red-100 opacity-90";
    return "bg-white border-slate-100";
  };

  const getRankIcon = (index, totalPlayers, pStatus) => {
    if (pStatus === "rejected")
      return <XCircle size={18} className="text-red-300" />;
    if (pStatus === "pending")
      return <Clock size={18} className="text-slate-300" />;
    if (index === 0)
      return <Crown size={18} className="text-yellow-600 fill-yellow-400" />;
    if (index === 1 && totalPlayers > 1)
      return <Medal size={18} className="text-slate-400" />;
    if (index === 2 && totalPlayers > 3)
      return <Medal size={18} className="text-orange-500" />;
    if (index === totalPlayers - 1 && totalPlayers > 1)
      return <Skull size={16} className="text-red-300" />;
    return (
      <span className="text-slate-400 font-bold text-xs w-5 text-center">
        #{index + 1}
      </span>
    );
  };

  if (initialLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* 1. Header: Title & Button Create */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" /> {/* Title "Duel" */}
            <Skeleton className="h-4 w-48" /> {/* Subtitle */}
          </div>
          {/* Tombol Buat Tantangan */}
          <Skeleton className="h-10 w-10 sm:w-36 rounded-xl" />
        </div>

        {/* 2. Tabs Navigation (Open / Active / History) */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Skeleton className="h-9 w-24 rounded-full flex-shrink-0" />
          <Skeleton className="h-9 w-24 rounded-full flex-shrink-0" />
          <Skeleton className="h-9 w-24 rounded-full flex-shrink-0" />
        </div>

        {/* 3. List Challenges Cards */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Kiri: Info Tantangan */}
              <div className="flex items-center gap-4">
                {/* Icon Topik / VS Icon */}
                <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />

                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" /> {/* Judul Topik */}
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" /> {/* Bet/Coin */}
                    <Skeleton className="h-4 w-20" /> {/* Status */}
                  </div>
                </div>
              </div>

              {/* Kanan: Info Lawan / Button Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-0 border-slate-50 pt-3 sm:pt-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />{" "}
                  {/* Avatar Lawan */}
                  <Skeleton className="h-4 w-20 sm:hidden" />{" "}
                  {/* Nama Lawan (Mobile) */}
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />{" "}
                {/* Button Terima/Main */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* --- HEADER & STATS (Dari Server) --- */}
      {/* --- HEADER & STATS (Dari Server) --- */}
      <div className="space-y-6">
        {/* Row 1: Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Swords className="text-orange-600" /> {t("challenge.arenaTitle")}
            </h1>
            <p className="text-slate-500 mt-1">{t("challenge.arenaDesc")}</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowJoinModal(true)} // Updated
              className="px-6 py-3 flex-1 md:flex-none bg-white text-indigo-600 font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-5 h-5" />
              {t("challenge.enterCode")?.split(" ")[0] || "Masuk Code"}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 flex-1 md:flex-none bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <Swords className="w-5 h-5" />
              {t("challenge.createChallenge")}
            </button>
          </div>
        </div>

        {/* Row 2: Quick Stats */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Target size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {t("challenge.totalDuel")}
              </p>
              <p className="text-sm font-bold text-slate-800">
                {stats.total} {t("challenge.played")}
              </p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {t("challenge.won")}
              </p>
              <p className="text-sm font-bold text-slate-800">
                {stats.wins}x ({stats.win_rate}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- LIST CARD --- */}
      {challenges.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="inline-flex bg-slate-50 p-4 rounded-full mb-4">
            <Swords size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            {t("challenge.noActiveDuel")}
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            {t("challenge.noDuelDesc")}
          </p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transition text-sm"
          >
            {t("challenge.findOpponent")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {challenges.map((duel, index) => {
            // [BARU] Ref untuk elemen terakhir agar trigger load more
            const isLastElement = index === challenges.length - 1;

            const participants = duel.participants || [];
            const myParticipant = participants.find(
              (p) => p.user_id === user.ID,
            );
            const myStatus = myParticipant?.status || "pending";
            const myScore = myParticipant?.score ?? -1;

            const isFinished = duel.status === "finished";
            const isActive = duel.status === "active";
            const isRejected = duel.status === "rejected";

            const allAccepted = participants.every(
              (p) => p.status === "accepted" || p.status === "finished",
            );
            const isRealtime = duel.is_realtime;
            const isBattleRoyale = duel.mode === "battleroyale";
            const isMyCreated = duel.creator_id === user.ID;
            const is2v2 = duel.mode === "2v2";
            // const timeLimit = duel.time_limit; // in seconds
            // Sorting
            const sortedParticipants = [...participants].sort((a, b) => {
              if (a.score !== -1 && b.score === -1) return -1;
              if (a.score === -1 && b.score !== -1) return 1;
              if (a.score !== -1 && b.score !== -1) {
                if (b.score !== a.score) return b.score - a.score;
                return a.time_taken - b.time_taken;
              }
              if (a.status === "rejected" && b.status !== "rejected") return 1;
              if (b.status === "rejected" && a.status !== "rejected") return -1;
              return 0;
            });

            // Filter Teams
            const teamA = participants.filter((p) => p.team === "A");
            const teamB = participants.filter((p) => p.team === "B");
            const scoreA = teamA.reduce(
              (acc, curr) => acc + (curr.score > -1 ? curr.score : 0),
              0,
            );
            const scoreB = teamB.reduce(
              (acc, curr) => acc + (curr.score > -1 ? curr.score : 0),
              0,
            );

            // LOGIC TEXT PEMENANG
            let winnerText = null;
            let winnerColorClass =
              "bg-slate-100 text-slate-500 border-slate-200";

            if (isFinished) {
              if (is2v2) {
                if (duel.winning_team === "A")
                  winnerText = t("challenge.winnerTeamA");
                else if (duel.winning_team === "B")
                  winnerText = t("challenge.winnerTeamB");
                else if (duel.winning_team === "DRAW")
                  winnerText = t("challenge.winnerDraw");

                if (myParticipant?.team === duel.winning_team) {
                  winnerColorClass =
                    "bg-yellow-100 text-yellow-700 border-yellow-300";
                }
              } else {
                if (duel.winner_id === user.ID) {
                  winnerText = t("challenge.winnerYou");
                  winnerColorClass =
                    "bg-yellow-100 text-yellow-700 border-yellow-300";
                } else if (duel.winner_id) {
                  const winnerP = participants.find(
                    (p) => p.user_id === duel.winner_id,
                  );
                  winnerText = `${winnerP?.user?.name || "Lawan"} ${t(
                    "challenge.won",
                  ).toUpperCase()}!`;
                } else {
                  winnerText = t("challenge.winnerDraw");
                }
              }
            }

            return (
              <div
                key={duel.ID}
                // [BARU] Pasang Ref di elemen terakhir
                ref={isLastElement ? lastElementRef : null}
                className={`relative overflow-hidden rounded-3xl shadow-sm border-2 transition-all duration-300 hover:shadow-md
                  ${
                    isFinished
                      ? // Jika 2v2 dan tim kita menang, ATAU 1v1 dan kita menang
                        (is2v2 && duel.winning_team === myParticipant?.team) ||
                        duel.winner_id === user.ID
                        ? "bg-gradient-to-br from-yellow-50/80 to-white border-yellow-300"
                        : "bg-white border-slate-200"
                      : isRejected
                        ? "bg-red-50/20 border-red-100"
                        : "bg-white border-slate-100"
                  }
                `}
              >
                {/* === HEADER CARD === */}
                <div className="p-5 border-b border-slate-100/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* ROOM CODE */}
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tracking-wider">
                          {t("classroom.code")}: {duel.room_code}
                        </span>

                        {duel.mode === "2v2" ? (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Users size={10} />{" "}
                            {t("createChallenge.modes.2v2").toUpperCase()}
                          </span>
                        ) : duel.mode === "battleroyale" ? (
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Users size={10} />{" "}
                            {t(
                              "createChallenge.modes.battleroyale",
                            ).toUpperCase()}
                          </span>
                        ) : duel.mode === "survival" ? (
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Users size={10} />{" "}
                            {t("createChallenge.modes.survival").toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Swords size={10} />{" "}
                            {t("createChallenge.modes.1v1").toUpperCase()}
                          </span>
                        )}

                        {duel.is_realtime && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                            <Zap size={10} className="inline mr-1" />
                            REALTIME
                          </span>
                        )}
                        {duel.time_limit > 0 && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Hourglass size={10} /> {duel.time_limit}s
                          </span>
                        )}
                        {duel.wager_amount > 0 && (
                          <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded flex items-center gap-1 border border-yellow-200 animate-pulse">
                            <Coins
                              size={10}
                              className="fill-yellow-500 text-yellow-600"
                            />
                            POT:{" "}
                            {duel.wager_amount * (duel.mode === "2v2" ? 4 : 2)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
                        {duel.quiz?.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-400 mt-1">
                        Host:{" "}
                        {duel.creator_id === user.ID
                          ? "Kamu"
                          : duel.creator?.name}
                      </p>
                    </div>
                    <div>
                      {isFinished ? (
                        <div
                          className={`px-3 py-1.5 rounded-full text-xs font-black border flex items-center gap-1 shadow-sm ${winnerColorClass}`}
                        >
                          <Crown size={12} /> {winnerText || "SELESAI"}
                        </div>
                      ) : isRejected ? (
                        <span className="flex items-center gap-1 text-red-600 font-bold bg-red-100 px-3 py-1.5 rounded-full text-xs border border-red-200">
                          <XCircle size={14} /> DIBATALKAN
                        </span>
                      ) : isActive ? (
                        <span className="text-green-600 font-bold bg-green-100 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>{" "}
                          LIVE
                        </span>
                      ) : (
                        <span className="text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-full text-xs border border-orange-100 flex items-center gap-1">
                          <Clock size={14} /> MENUNGGU
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* === LIST PESERTA === */}
                <div className="p-4 bg-slate-50/50">
                  {is2v2 ? (
                    // --- TAMPILAN KHUSUS 2v2 ---
                    <div className="flex flex-col gap-4">
                      {/* TIM A */}
                      <div
                        className={`p-3 rounded-xl border relative overflow-hidden transition-all ${
                          duel.winning_team === "A"
                            ? "bg-yellow-50/50 border-yellow-300 ring-1 ring-yellow-200"
                            : "bg-blue-50/50 border-blue-100"
                        }`}
                      >
                        {duel.winning_team === "A" && (
                          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-black px-2 py-0.5 rounded-bl-lg z-10 shadow-sm">
                            WINNER
                          </div>
                        )}
                        <div className="flex justify-between mb-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
                          <span>Team A (Host)</span>
                          {isFinished && <span>Total: {scoreA}</span>}
                        </div>
                        {teamA.map((p, idx) => (
                          <PlayerRow
                            key={p.ID}
                            p={p}
                            idx={idx}
                            totalPlayers={teamA.length}
                            isMe={p.user_id === user.ID}
                            isFinished={isFinished}
                            getRankStyle={getRankStyle}
                            getRankIcon={getRankIcon}
                            mode={duel.mode}
                          />
                        ))}
                      </div>

                      {/* DIVIDER VS */}
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative bg-white px-4 py-1 text-xs font-black text-slate-400 rounded-full border border-slate-200 shadow-sm">
                          VS
                        </div>
                      </div>

                      {/* TIM B */}
                      <div
                        className={`p-3 rounded-xl border relative overflow-hidden transition-all ${
                          duel.winning_team === "B"
                            ? "bg-yellow-50/50 border-yellow-300 ring-1 ring-yellow-200"
                            : "bg-red-50/50 border-red-100"
                        }`}
                      >
                        {duel.winning_team === "B" && (
                          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-black px-2 py-0.5 rounded-bl-lg z-10 shadow-sm">
                            WINNER
                          </div>
                        )}
                        <div className="flex justify-between mb-2 text-xs font-bold text-red-800 uppercase tracking-wider">
                          <span>Team B (Challengers)</span>
                          {isFinished && <span>Total: {scoreB}</span>}
                        </div>
                        {teamB.map((p, idx) => (
                          <PlayerRow
                            key={p.ID}
                            p={p}
                            idx={idx}
                            totalPlayers={teamB.length}
                            isMe={p.user_id === user.ID}
                            isFinished={isFinished}
                            getRankStyle={getRankStyle}
                            getRankIcon={getRankIcon}
                            mode={duel.mode}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    // --- TAMPILAN NORMAL (1v1 / Battle Royale) ---
                    <div className="flex flex-col gap-2">
                      {sortedParticipants.map((p, idx) => (
                        <PlayerRow
                          key={p.ID}
                          p={p}
                          idx={idx}
                          totalPlayers={sortedParticipants.length}
                          isMe={p.user_id === user.ID}
                          isFinished={isFinished}
                          getRankStyle={getRankStyle}
                          getRankIcon={getRankIcon}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* === FOOTER ACTIONS === */}
                {!isFinished && !isRejected && (
                  <div className="px-5 pb-5 pt-2">
                    {/* KONDISI 1: Belum Terima (Pending) */}
                    {myStatus === "pending" && !isMyCreated && (
                      <div className="flex flex-col gap-2">
                        {duel.wager_amount > 0 && (
                          <p className="text-[10px] text-center text-yellow-700 bg-yellow-50 p-1.5 rounded font-medium border border-yellow-100">
                            ⚠️ Menerima akan memotong{" "}
                            <b>{duel.wager_amount} Koin</b> dari dompetmu.
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleAccept(
                                duel.ID,
                                isRealtime,
                                duel.quiz?.title,
                                duel.creator_id,
                                duel.time_limit || 0,
                              )
                            }
                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={18} />
                            {is2v2 ? "Gabung Tim" : t("challenge.accept")}
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                challengeId: duel.ID,
                                challengerName: duel.creator?.name,
                              })
                            }
                            className="px-5 py-3 bg-white border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition"
                          >
                            {t("challenge.reject")}
                          </button>
                        </div>
                      </div>
                    )}
                    {myStatus === "pending" && isMyCreated && (
                      <button
                        onClick={() =>
                          handleEnterLobby(
                            duel.ID,
                            duel.quiz?.title,
                            duel.creator_id,
                            duel.time_limit || 0,
                          )
                        }
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                      >
                        <LogIn size={20} />{" "}
                        {isMyCreated
                          ? t("challenge.enterLobby")
                          : t("challenge.enterLobby")}
                      </button>
                    )}
                    {/* KONDISI 2: Sudah Accepted, Belum Main */}
                    {myStatus === "accepted" && myScore === -1 && (
                      <>
                        {isRealtime ? (
                          isActive ? (
                            <button
                              onClick={() => handleRejoinGame(duel)}
                              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-200 flex items-center justify-center gap-2 transition-all animate-pulse"
                            >
                              <RefreshCw
                                size={20}
                                className="animate-spin-slow"
                              />{" "}
                              GAME BERLANGSUNG! MASUK KEMBALI
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleEnterLobby(
                                  duel.ID,
                                  duel.quiz?.title,
                                  duel.creator_id,
                                  duel.time_limit || 0,
                                )
                              }
                              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                            >
                              <LogIn size={20} />{" "}
                              {isMyCreated
                                ? t("challenge.enterLobby")
                                : t("challenge.enterLobby")}
                            </button>
                          )
                        ) : // NON-REALTIME LOGIC
                        isActive || allAccepted || true ? ( // CHANGE: Allow entering lobby for all accepted (Host decides start)
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEnterLobby(
                                  duel.ID,
                                  duel.quiz?.title,
                                  duel.creator_id,
                                  duel.time_limit || 0,
                                )
                              }
                              className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                            >
                              <LogIn size={20} />
                            </button>

                            {/* Play Button only if Active or All Accepted */}
                            {isActive ||
                            allAccepted ||
                            duel.status === "active" ? (
                              duel.mode === "survival" ? (
                                <Link
                                  to="/play/survival"
                                  state={{
                                    isChallenge: true,
                                    isRealtime: isRealtime,
                                    timeLimit: duel.time_limit || 0,
                                    challengeID: duel.ID,
                                    seed: duel.seed,
                                    mode: "survival",
                                  }}
                                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2 transition-all animate-pulse"
                                >
                                  <Skull size={20} /> SURVIVAL START
                                </Link>
                              ) : (
                                <Link
                                  to={`/play/${duel.quiz_id}`}
                                  state={{
                                    title: duel.quiz?.title,
                                    isChallenge: true,
                                    isRealtime: isRealtime,
                                    timeLimit: duel.time_limit || 0,
                                    challengeID: duel.ID,
                                    mode: duel.mode,
                                  }}
                                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2 transition-all animate-pulse"
                                >
                                  <PlayCircle size={20} /> {t("quizList.play")}
                                </Link>
                              )
                            ) : (
                              <div className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                                <Clock size={16} />{" "}
                                {t("challenge.waitingForHost")}
                              </div>
                            )}
                          </div>
                        ) : isBattleRoyale && !allAccepted ? (
                          <div className="w-full py-3 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                            <Hourglass size={16} /> Menunggu semua pemain
                            menerima...
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-xs">
                            Menunggu konfirmasi server ({duel.status})...
                          </div>
                        )}
                      </>
                    )}

                    {/* KONDISI 3: Sudah Main (Finished) */}
                    {myScore !== -1 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleEnterLobby(
                              duel.ID,
                              duel.quiz?.title,
                              duel.creator_id,
                              duel.time_limit || 0,
                            )
                          }
                          className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 hover:shadow-md flex items-center justify-center gap-2 transition-all border border-slate-200"
                        >
                          <LogIn size={18} /> Lihat Lobby
                        </button>
                        {isActive && (
                          <div className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 border-dashed">
                            <Clock size={14} /> Menunggu Lawan...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* JIKA REJECTED */}
                {isRejected && (
                  <div className="px-5 pb-5 pt-2">
                    <div className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-red-100">
                      <XCircle size={14} /> Tantangan ini telah dibatalkan.
                    </div>
                  </div>
                )}

                {/* Info Tambahan jika Saya Reject */}
                {myStatus === "rejected" && !isRejected && (
                  <div className="px-5 pb-5 pt-2">
                    <div className="w-full py-2 text-center text-red-400 text-xs font-medium bg-red-50/50 rounded-lg">
                      Anda telah menolak tantangan ini.
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* LOADING INDICATOR SAAT SCROLL */}
          {loading && (
            <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={20} /> Memuat data...
            </div>
          )}
          {!hasMore && challenges.length > 0 && (
            <div className="py-4 text-center text-slate-400 text-sm">
              Semua data telah dimuat.
            </div>
          )}
        </div>
      )}

      {/* Modal Konfirmasi Tolak */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        maxWidth="max-w-sm"
      >
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Tolak Tantangan?</h2>
        </div>
        <p className="text-slate-600 mb-6 text-sm">
          Yakin ingin menolak tantangan dari{" "}
          <span className="font-bold">{confirmModal.challengerName}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            className="flex-1 px-4 py-2 bg-slate-100 font-bold rounded-lg text-slate-700"
          >
            {t("challenge.cancel")}
          </button>
          <button
            onClick={handleRefuse}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg"
          >
            {t("challenge.reject")}
          </button>
        </div>
      </Modal>

      {/* LobbyModal Logic Moved to /pages/social/LobbyPage.jsx */}

      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreateSuccess}
      />

      <JoinLobbyModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
};

export default ChallengeList;
