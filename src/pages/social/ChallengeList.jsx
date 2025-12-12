import { useEffect, useState, useRef } from "react";
import { socialAPI } from "../../services/api"; // Sesuaikan path ini
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
  RefreshCw, // Icon baru untuk Rejoin
  LogIn, // Icon baru untuk Masuk Lobby
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal"; // Sesuaikan path ini

// --- KOMPONEN LOBBY & COUNTDOWN (SSE) ---
const LobbyModal = ({ isOpen, onClose, challengeId, quizTitle, isHost }) => {
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [status, setStatus] = useState("waiting"); // waiting | counting | starting
  const [startingGame, setStartingGame] = useState(false);
  const eventSourceRef = useRef(null);
  const navigate = useNavigate();

  // Koneksi SSE ke Backend
  useEffect(() => {
    if (!isOpen || !challengeId) return;

    const sseUrl = `${
      import.meta.env.VITE_API_URL
    }/challenges/${challengeId}/lobby-stream`;

    const token = localStorage.getItem("token");
    const eventSource = new EventSource(`${sseUrl}?token=${token}`);

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("✅ Terhubung ke Lobby Realtime");
    };

    // 1. Event Update Player
    eventSource.addEventListener("player_update", (e) => {
      try {
        const data = JSON.parse(e.data);
        setLobbyPlayers(data.players || []);
      } catch (err) {
        console.error("Error parse player_update:", err);
      }
    });

    // 2. Event Hitung Mundur
    eventSource.addEventListener("start_countdown", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatus("counting");
        setCountdown(data.seconds || 3);
      } catch (err) {
        console.error("Error parse start_countdown:", err);
      }
    });

    // 3. Event Game Dimulai
    eventSource.addEventListener("game_start", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatus("starting");
        eventSource.close();
        toast.success(data.message || "Pertandingan Dimulai!");

        navigate(`/play/${data.quiz_id}`, {
          state: {
            isRealtime: true,
            lobbyId: challengeId,
            title: data.quiz_title || quizTitle,
          },
        });
      } catch (err) {
        console.error("Error parse game_start:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setLobbyPlayers([]);
      setStatus("waiting");
      setStartingGame(false);
    };
  }, [isOpen, challengeId, navigate, quizTitle]);

  // Logic Hitung Mundur Lokal
  useEffect(() => {
    if (status === "counting" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, status]);

  // Fungsi Host Mulai Game
  const handleHostStart = async () => {
    setStartingGame(true);
    try {
      await socialAPI.startGame(challengeId);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memulai game");
      setStartingGame(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      noCloseButton={status !== "waiting"}
      onClose={status === "waiting" ? onClose : () => {}}
      maxWidth="max-w-md"
    >
      <div className="text-center">
        {status === "starting" ? (
          <div className="py-10 animate-pulse">
            <Zap size={64} className="mx-auto text-yellow-500 mb-4" />
            <h2 className="text-3xl font-black text-slate-800">GO!</h2>
          </div>
        ) : status === "counting" ? (
          <div className="py-10">
            <div className="text-8xl font-black text-indigo-600 animate-ping mb-4">
              {countdown}
            </div>
            <p className="text-slate-500 font-bold">Game dimulai dalam...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4 relative">
              <div className="bg-blue-100 p-4 rounded-full relative z-10">
                <Users size={32} className="text-blue-600" />
              </div>
              {isHost && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200 shadow-sm z-20">
                  HOST
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {quizTitle}
            </h2>
            <p className="text-sm text-slate-500 mb-6 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {isHost
                ? "Menunggu pemain lain bergabung..."
                : "Menunggu Host Memulai..."}
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left max-h-60 overflow-y-auto border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase">
                  Pemain ({lobbyPlayers.length})
                </h3>
              </div>

              {lobbyPlayers.length === 0 ? (
                <p className="text-center text-slate-400 italic text-sm py-4">
                  Menghubungkan...
                </p>
              ) : (
                <div className="space-y-2">
                  {lobbyPlayers.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white p-2.5 rounded-lg shadow-sm border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-700 text-sm">
                          {p.name}
                        </span>
                      </div>
                      <div>
                        {p.status === "rejected" ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-100 text-red-600">
                            REJECTED
                          </span>
                        ) : p.status === "accepted" ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-600">
                            READY
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-orange-100 text-orange-600">
                            JOINING...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isHost ? (
              <button
                onClick={handleHostStart}
                disabled={
                  startingGame ||
                  lobbyPlayers.filter((p) => p.status === "accepted").length < 2
                }
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {startingGame ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Gamepad2 size={20} />
                )}
                {startingGame ? "Memulai..." : "MULAI GAME"}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-slate-200 text-slate-500 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Loader2 className="animate-spin" size={18} /> Menunggu Host...
              </button>
            )}

            {isHost &&
              lobbyPlayers.filter((p) => p.status === "accepted").length <
                2 && (
                <p className="text-xs text-red-400 mt-2 text-center">
                  Minimal 2 pemain harus READY.
                </p>
              )}
          </>
        )}
      </div>
    </Modal>
  );
};

// --- UTAMA: LIST CHALLENGE ---
const ChallengeList = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // State Lobby Modal
  const [lobbyModal, setLobbyModal] = useState({
    isOpen: false,
    challengeId: null,
    title: "",
    isHost: false,
  });

  const fetchData = () => {
    socialAPI
      .getMyChallenges()
      .then((res) => setChallenges(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Accept
  const handleAccept = async (id, isRealtime, title, creatorId) => {
    try {
      await socialAPI.acceptChallenge(id);
      toast.success("Tantangan diterima!");
      fetchData();

      if (isRealtime) {
        setLobbyModal({
          isOpen: true,
          challengeId: id,
          title: title,
          isHost: user.ID === creatorId,
        });
      }
    } catch (err) {
      console.log(err);
      toast.error("Gagal menerima tantangan");
    }
  };

  // Handle Masuk Lobby (Waiting)
  const handleEnterLobby = (id, title, creatorId) => {
    setLobbyModal({
      isOpen: true,
      challengeId: id,
      title: title,
      isHost: user.ID === creatorId,
    });
  };

  // Handle Rejoin Game (Active / Crash)
  const handleRejoinGame = (duel) => {
    navigate(`/play/${duel.quiz_id}`, {
      state: {
        isRealtime: true,
        lobbyId: duel.ID,
        title: duel.quiz?.title,
        rejoining: true,
      },
    });
  };

  // Handle Refuse
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    challengeId: null,
    challengerName: "",
  });

  const handleRefuse = async () => {
    try {
      await socialAPI.refuseChallenge(confirmModal.challengeId);
      toast.success("Tantangan ditolak.");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Gagal menolak tantangan");
    } finally {
      setConfirmModal({ challengeId: null, challengerName: "", isOpen: false });
    }
  };

  // UI Helpers
  const WinnerBadge = ({ className = "" }) => (
    <div
      className={`flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-black text-xs shadow-sm border border-yellow-200 ${className}`}
    >
      <Crown size={14} fill="currentColor" />
      <span className="tracking-wide">WINNER</span>
    </div>
  );

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

  if (loading)
    return (
      <div className="text-center py-12 text-slate-500">
        Memuat arena duel...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
        <Swords className="text-orange-600" size={32} /> Arena Duel
      </h1>
      <p className="text-slate-500 mb-8">Riwayat dan tantangan aktifmu.</p>

      {challenges.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200">
          <Swords size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">
            Belum ada duel aktif
          </h3>
          <Link
            to="/"
            className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transition"
          >
            Cari Lawan
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {challenges.map((duel) => {
            const participants = duel.participants || [];
            const myParticipant = participants.find(
              (p) => p.user_id === user.ID
            );
            const myStatus = myParticipant?.status || "pending";
            const myScore = myParticipant?.score ?? -1;

            const isFinished = duel.status === "finished";
            const isActive = duel.status === "active";
            const isRejected = duel.status === "rejected";

            const allAccepted = participants.every(
              (p) => p.status === "accepted" || p.status === "finished"
            );
            const isRealtime = duel.is_realtime;
            const isBattleRoyale = duel.mode === "battleroyale";
            const isMyCreated = duel.creator_id === user.ID;

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

            const validPlayers = sortedParticipants.filter(
              (p) => p.score !== -1
            );
            const winner = validPlayers.length > 0 ? validPlayers[0] : null;
            const amIWinner = isFinished && winner?.user_id === user.ID;
            const isDraw =
              isFinished &&
              validPlayers.length > 1 &&
              validPlayers[0].score === validPlayers[1].score;

            return (
              <div
                key={duel.ID}
                className={`relative overflow-hidden rounded-3xl shadow-sm border-2 transition-all duration-300 hover:shadow-md
                  ${
                    isFinished
                      ? amIWinner
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
                        {duel.mode === "battleroyale" ? (
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Users size={10} /> BATTLE ROYALE
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Swords size={10} /> 1 VS 1
                          </span>
                        )}
                        {duel.is_realtime && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                            <Zap size={10} className="inline mr-1" />
                            REALTIME
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
                        amIWinner ? (
                          <WinnerBadge />
                        ) : isDraw ? (
                          <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                            DRAW
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-full text-xs">
                            SELESAI
                          </span>
                        )
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
                <div className="p-4 bg-white/40">
                  <div className="flex flex-col gap-2">
                    {sortedParticipants.map((p, idx) => {
                      const isMe = p.user_id === user.ID;
                      const hasPlayed = p.score !== -1;
                      return (
                        <div
                          key={p.ID}
                          className={`flex items-center justify-between p-3 rounded-xl border shadow-sm ${
                            isFinished || hasPlayed
                              ? getRankStyle(
                                  idx,
                                  sortedParticipants.length,
                                  p.status
                                )
                              : "bg-white border-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 flex justify-center">
                              {isFinished || hasPlayed ? (
                                getRankIcon(
                                  idx,
                                  sortedParticipants.length,
                                  p.status
                                )
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
                                {isMe ? "KAMU" : p.user?.name}
                              </p>
                              <div className="text-[10px] font-medium mt-0.5">
                                {p.status === "rejected" ? (
                                  <span className="text-red-500">Menolak</span>
                                ) : p.status === "pending" ? (
                                  <span className="text-orange-500">
                                    Menunggu...
                                  </span>
                                ) : hasPlayed ? (
                                  <span className="text-slate-400">
                                    {p.time_taken}s
                                  </span>
                                ) : p.status === "accepted" ? (
                                  isFinished || isRejected ? (
                                    <span className="text-slate-400 italic">
                                      Tidak jadi main
                                    </span>
                                  ) : (
                                    <span className="text-blue-600">
                                      Siap / Mengerjakan...
                                    </span>
                                  )
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-slate-700">
                            {hasPlayed ? p.score : "-"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* === FOOTER ACTIONS === */}
                {!isFinished && !isRejected && (
                  <div className="px-5 pb-5 pt-2">
                    {/* KONDISI 1: Belum Terima (Pending) */}
                    {myStatus === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleAccept(
                              duel.ID,
                              isRealtime,
                              duel.quiz?.title,
                              duel.creator_id
                            )
                          }
                          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={18} /> Terima Tantangan
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
                          Tolak
                        </button>
                      </div>
                    )}

                    {/* KONDISI 2: Sudah Accepted, Belum Main */}
                    {myStatus === "accepted" && myScore === -1 && (
                      <>
                        {/* A. LOGIC REALTIME */}
                        {isRealtime ? (
                          <>
                            {/* CASE: GAME SUDAH JALAN (REJOIN GAME) */}
                            {isActive ? (
                              <button
                                onClick={() => handleRejoinGame(duel)}
                                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-200 flex items-center justify-center gap-2 transition-all animate-pulse"
                              >
                                <RefreshCw
                                  size={20}
                                  className="animate-spin-slow"
                                />
                                GAME BERLANGSUNG! MASUK KEMBALI
                              </button>
                            ) : (
                              /* CASE: MASIH DI LOBBY (MASUK/REJOIN LOBBY) */
                              <button
                                onClick={() =>
                                  handleEnterLobby(
                                    duel.ID,
                                    duel.quiz?.title,
                                    duel.creator_id
                                  )
                                }
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                              >
                                <LogIn size={20} />
                                {isMyCreated
                                  ? "BUKA LOBBY (HOST)"
                                  : "MASUK LOBBY"}
                              </button>
                            )}
                          </>
                        ) : /* B. LOGIC ASYNC (BATTLE ROYALE / 1v1 BIASA) */
                        isActive ? (
                          <Link
                            to={`/play/${duel.quiz_id}`}
                            state={{
                              title: duel.quiz?.title,
                              isChallenge: true,
                            }}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2 transition-all animate-pulse"
                          >
                            <PlayCircle size={20} /> MAINKAN SEKARANG
                          </Link>
                        ) : isBattleRoyale && !allAccepted ? (
                          <div className="w-full py-3 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                            <Hourglass size={16} /> Menunggu semua pemain
                            menerima...
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-xs">
                            Menunggu konfirmasi server...
                          </div>
                        )}
                      </>
                    )}

                    {/* KONDISI 3: Sudah Main, Nunggu Teman */}
                    {myScore !== -1 && isActive && (
                      <div className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 border-dashed">
                        <Clock size={14} /> Menunggu Lawan Lain Selesai...
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
            Batal
          </button>
          <button
            onClick={handleRefuse}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg"
          >
            Tolak
          </button>
        </div>
      </Modal>

      {/* Modal Lobby Realtime */}
      <LobbyModal
        isOpen={lobbyModal.isOpen}
        challengeId={lobbyModal.challengeId}
        quizTitle={lobbyModal.title}
        isHost={lobbyModal.isHost}
        onClose={() =>
          setLobbyModal({
            isOpen: false,
            challengeId: null,
            title: "",
            isHost: false,
          })
        }
      />
    </div>
  );
};

export default ChallengeList;