// src/pages/social/LobbyPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socialAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { EventSourcePolyfill } from "event-source-polyfill";
import toast from "react-hot-toast";
import {
  Users, Zap, Gamepad2, LogOut, Copy, Settings, Clock, Swords,
  Crown, Loader2, CheckCircle2, XCircle, Trophy, ArrowLeft,
  PlayCircle, UserPlus, Coins, PlusCircle,
} from "lucide-react";
import InviteFriendModal from "../../components/ui/InviteFriendModal";
import Skeleton from "../../components/ui/Skeleton";

const LobbyPage = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const eventSourceRef = useRef(null);

  const [challenge, setChallenge]       = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [countdown, setCountdown]       = useState(null);
  const [status, setStatus]             = useState("waiting");
  const [startingGame, setStartingGame] = useState(false);
  const [isHost, setIsHost]             = useState(false);
  const [settings, setSettings]         = useState({ mode: "1v1", timeLimit: 60, isRealtime: false, quizId: 0, wagerAmount: 0 });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [creatorId, setCreatorId]       = useState(null);
  const [roomCode, setRoomCode]         = useState("");
  const [isSyncing, setIsSyncing]       = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // Accept + load
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        await socialAPI.acceptChallenge(id);
      } catch (err) {
        console.error("Gagal load lobby", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  // Sync room code + settings from list
  useEffect(() => {
    const getCode = async () => {
      try {
        const res = await socialAPI.getMyChallenges(1, 20);
        const found = res.data.data.list.find((c) => c.ID == id);
        if (found) {
          setRoomCode(found.room_code || "");
          setSettings({ mode: found.mode, timeLimit: found.time_limit, isRealtime: found.is_realtime, quizId: found.quiz_id, wagerAmount: found.wager_amount });
          if (found.status) setStatus(found.status);
        }
      } catch (e) {}
      finally { setIsSyncing(false); }
    };
    getCode();
  }, [id]);

  // SSE — gunakan /api/* proxy, X-API-KEY diinject oleh proxy
  useEffect(() => {
    if (!id) return;
    const eventSource = new EventSourcePolyfill(`/api/challenges/${id}/lobby-stream`, {
      withCredentials: true,
      heartbeatTimeout: 120000,
    });
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("player_update", (e) => {
      try {
        const data = JSON.parse(e.data);
        setLobbyPlayers(data.players || []);
        if (data.creator_id) { setIsHost(data.creator_id === user.ID); setCreatorId(data.creator_id); }
        if (data.status) setStatus(data.status);
        if (data.status === "cancelled") { toast.error("Lobby dibubarkan oleh host"); navigate("/challenges"); }
      } catch (err) { console.error(err); }
    });

    eventSource.addEventListener("settings_update", (e) => {
      try {
        const data = JSON.parse(e.data);
        setSettings((prev) => ({ ...prev, mode: data.mode || prev.mode, timeLimit: data.time_limit || prev.timeLimit, isRealtime: data.is_realtime !== undefined ? data.is_realtime : prev.isRealtime, quizId: data.quiz_id || prev.quizId, wagerAmount: data.wager_amount || prev.wagerAmount }));
      } catch (err) { console.error(err); }
    });

    eventSource.addEventListener("host_migration", (e) => {
      try {
        const data = JSON.parse(e.data);
        toast(data.message, { icon: "👑" });
        if (data.new_host_id === user.ID) { setIsHost(true); toast.success("Anda sekarang adalah Host!"); }
      } catch (err) { console.error(err); }
    });

    eventSource.addEventListener("start_countdown", (e) => {
      const data = JSON.parse(e.data);
      setStatus("counting");
      setCountdown(data.seconds || 3);
    });

    eventSource.addEventListener("game_start", (e) => {
      const data = JSON.parse(e.data);
      setStatus("starting");
      eventSource.close();
      setTimeout(() => {
        if (!settings.isRealtime) { toast.success("Game Dimulai!"); navigate("/challenges"); return; }
        if (data.mode === "survival") {
          navigate("/play/survival", { state: { isRealtime: true, lobbyId: id, challengeID: id, isChallenge: true, seed: data.seed, timeLimit: settings.timeLimit } });
        } else {
          navigate(`/play/${data.quiz_id}`, { state: { isRealtime: true, lobbyId: id, challengeID: id, isChallenge: true, timeLimit: settings.timeLimit, title: "Challenge Match" } });
        }
      }, 500);
    });

    return () => { if (eventSourceRef.current) eventSourceRef.current.close(); };
  }, [id, navigate, user.ID, settings.timeLimit]);

  useEffect(() => {
    if (status === "counting" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, status]);

  const handleLeave = async () => {
    try { await socialAPI.leaveLobby(id); navigate("/challenges"); toast.success("Keluar lobby"); }
    catch (err) { toast.error("Gagal keluar"); }
  };

  const handleStart = async () => {
    if (!settings.isRealtime) {
      navigate(`/play/${settings.quizId}`, { state: { isRealtime: false, lobbyId: id, challengeID: id, isChallenge: true, timeLimit: settings.timeLimit, title: "Challenge Match", mode: settings.mode } });
      return;
    }
    setStartingGame(true);
    try { await socialAPI.startGame(id); }
    catch (err) { toast.error("Gagal memulai game"); setStartingGame(false); }
  };

  const updateSettings = async (newSettings) => {
    if (status === "active") { toast.error("Tidak dapat mengubah settings saat game berlangsung"); return; }
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      const payload = {};
      if (newSettings.mode !== undefined) payload.mode = newSettings.mode;
      if (newSettings.timeLimit !== undefined) payload.time_limit = newSettings.timeLimit;
      if (newSettings.isRealtime !== undefined) payload.is_realtime = newSettings.isRealtime;
      if (newSettings.quizId !== undefined) payload.quiz_id = newSettings.quizId;
      await socialAPI.updateLobbySettings(id, payload);
    } catch (err) { toast.error("Gagal update setting"); }
  };

  const handleGenerateCode = async () => {
    try {
      const res = await socialAPI.generateRoomCode(id);
      setRoomCode(res.data.data.room_code);
      toast.success("Kode Room berhasil dibuat: " + res.data.data.room_code);
    } catch (err) { toast.error("Gagal generate room code"); }
  };

  /* ── Skeleton ────────────────────────────────────────── */
  if (loading || isSyncing) return (
    <div className="min-h-screen pb-24" style={{ background: "var(--color-surface-950)" }}>
      <div className="sticky top-0 z-10 px-4 py-4" style={{ background: "var(--color-surface-950)", borderBottom: "1px solid var(--color-surface-800)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-5 w-32" />
          <div className="w-10" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          {[1,2,3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    </div>
  );

  /* ── Countdown Screen ──────────────────────────────────── */
  if (status === "counting" || status === "starting") return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg, var(--color-brand-700) 0%, #4c1d95 100%)" }}
    >
      <div
        className="text-[10rem] font-black leading-none mb-4 animate-pulse"
        style={{ color: "#fff", textShadow: "0 0 60px rgb(99 102 241 / 0.8)" }}
      >
        {status === "starting" ? "GO!" : countdown}
      </div>
      <p className="text-xl font-black tracking-widest uppercase" style={{ color: "rgb(255 255 255 / 0.70)" }}>
        Bersiaplah!
      </p>
    </div>
  );

  /* ── Main ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--color-surface-950)" }}>

      {/* Top Nav */}
      <div
        className="sticky top-0 z-10 px-4 py-4"
        style={{ background: "var(--color-surface-950)", borderBottom: "1px solid var(--color-surface-800)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/challenges")}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: "var(--color-surface-400)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-surface-800)"; e.currentTarget.style.color = "var(--color-surface-200)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-surface-400)"; }}
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <h1 className="font-black text-sm" style={{ color: "var(--color-surface-100)" }}>
              {t("challenge.lobby")}
            </h1>
            <p className="text-[10px] font-bold flex items-center justify-center gap-1" style={{ color: "var(--color-surface-500)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live Connection
            </p>
          </div>

          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Room Code Card */}
        <div
          className="rounded-3xl p-7 text-white text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--color-brand-600) 0%, #7c3aed 100%)",
            boxShadow: "0 8px 32px rgb(99 102 241 / 0.30)",
          }}
        >
          <Gamepad2 size={110} className="absolute -bottom-4 -right-4 rotate-12" style={{ color: "rgb(255 255 255 / 0.08)" }} />
          <Users size={90} className="absolute -top-4 -left-4 -rotate-12" style={{ color: "rgb(255 255 255 / 0.06)" }} />

          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: "rgb(255 255 255 / 0.65)" }}>
              Room Code
            </p>
            {roomCode ? (
              <div
                className="flex justify-center items-center gap-3 cursor-pointer group"
                onClick={() => { navigator.clipboard.writeText(roomCode); toast.success("Kode disalin!"); }}
              >
                <h1 className="text-5xl font-black tracking-[0.3em] font-mono text-white" style={{ textShadow: "0 2px 20px rgb(0 0 0 / 0.30)" }}>
                  {roomCode}
                </h1>
                <Copy size={22} className="transition-opacity" style={{ color: "rgb(255 255 255 / 0.50)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = ".5")}
                />
              </div>
            ) : isHost ? (
              <button
                onClick={handleGenerateCode}
                className="mx-auto px-4 py-2 rounded-xl font-black text-sm text-white transition-all inline-flex items-center gap-2"
                style={{ background: "rgb(255 255 255 / 0.15)", border: "1px solid rgb(255 255 255 / 0.25)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(255 255 255 / 0.25)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(255 255 255 / 0.15)")}
              >
                <PlusCircle size={16} /> GENERATE CODE
              </button>
            ) : (
              <p className="italic text-sm" style={{ color: "rgb(255 255 255 / 0.50)" }}>Belum ada kode room</p>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--color-surface-900)", border: "1px solid var(--color-surface-800)" }}
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-black text-sm flex items-center gap-2" style={{ color: "var(--color-surface-200)" }}>
              <Settings size={16} style={{ color: "var(--color-surface-500)" }} />
              {t("challenge.settings", { defaultValue: "Pengaturan Game" })}
            </h3>
            {isHost && (
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{ background: "rgb(234 179 8 / 0.12)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.25)" }}
              >
                HOST CONTROLS
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode */}
            <div className="p-3 rounded-xl" style={{ background: "var(--color-surface-800)", border: "1px solid var(--color-surface-700)" }}>
              <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: "var(--color-surface-500)" }}>
                {t("createChallenge.selectMode")}
              </label>
              {isHost ? (
                <select
                  value={settings.mode}
                  onChange={(e) => updateSettings({ mode: e.target.value })}
                  className="w-full rounded-lg px-2 py-1.5 font-black text-sm outline-none"
                  style={{ background: "var(--color-surface-700)", color: "var(--color-surface-100)", border: "1px solid var(--color-surface-600)" }}
                >
                  <option value="1v1">⚔️ Duel 1v1</option>
                  <option value="survival">🏆 Survival</option>
                  <option value="2v2">🛡️ Team 2v2</option>
                </select>
              ) : (
                <div className="font-black text-sm flex items-center gap-2" style={{ color: "var(--color-surface-100)" }}>
                  {settings.mode === "survival"
                    ? <Trophy size={14} style={{ color: "#fbbf24" }} />
                    : <Swords size={14} style={{ color: "var(--color-brand-400)" }} />}
                  {settings.mode}
                </div>
              )}
            </div>

            {/* Time Limit */}
            <div className="p-3 rounded-xl" style={{ background: "var(--color-surface-800)", border: "1px solid var(--color-surface-700)" }}>
              <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: "var(--color-surface-500)" }}>
                {settings.isRealtime ? t("createChallenge.timePerQuestion", { defaultValue: "Waktu per Soal" }) : t("createChallenge.timeLimit")}
              </label>
              {isHost && status !== "active" ? (
                <select
                  value={settings.timeLimit}
                  onChange={(e) => updateSettings({ timeLimit: parseInt(e.target.value) })}
                  className="w-full rounded-lg px-2 py-1.5 font-black text-sm outline-none"
                  style={{ background: "var(--color-surface-700)", color: "var(--color-surface-100)", border: "1px solid var(--color-surface-600)" }}
                >
                  <option value="30">⚡ 30 {t("review.seconds")}</option>
                  <option value="60">⏱️ 60 {t("review.seconds")}</option>
                  <option value="120">🐢 2 {t("review.minutes")}</option>
                  <option value="0">♾️ {t("createChallenge.noLimit", { defaultValue: "Tanpa Batas" })}</option>
                </select>
              ) : (
                <div className="font-black text-sm flex items-center gap-2" style={{ color: "var(--color-surface-100)" }}>
                  <Clock size={13} style={{ color: "var(--color-surface-500)" }} />
                  {settings.timeLimit === 0 ? `∞ ${t("createChallenge.noLimit", { defaultValue: "Tanpa Batas" })}` : `${settings.timeLimit} ${t("review.seconds")}`}
                </div>
              )}
            </div>

            {/* Wager */}
            <div
              className="p-3 rounded-xl"
              style={{
                background: settings.wagerAmount > 0 ? "rgb(234 179 8 / 0.08)" : "var(--color-surface-800)",
                border: settings.wagerAmount > 0 ? "1px solid rgb(234 179 8 / 0.25)" : "1px solid var(--color-surface-700)",
              }}
            >
              <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: "var(--color-surface-500)" }}>
                {t("createChallenge.wager")}
              </label>
              {isHost && status !== "active" ? (
                <div className="flex items-center gap-2">
                  <Coins size={14} style={{ color: "#fbbf24" }} />
                  <select
                    value={settings.wagerAmount || 0}
                    onChange={(e) => updateSettings({ wagerAmount: parseInt(e.target.value) })}
                    className="w-full rounded-lg px-2 py-1.5 font-black text-sm outline-none"
                    style={{ background: "var(--color-surface-700)", color: "var(--color-surface-100)", border: "1px solid var(--color-surface-600)" }}
                  >
                    <option value="0">🛋️ {t("settings.noWager", { defaultValue: "Tanpa Taruhan" })}</option>
                    <option value="100">💰 100 {t("shop.coins")}</option>
                    <option value="500">💰 500 {t("shop.coins")}</option>
                    <option value="1000">💎 1000 {t("shop.coins")}</option>
                    <option value="5000">👑 5000 {t("shop.coins")}</option>
                  </select>
                </div>
              ) : (
                <div className="font-black text-sm flex items-center gap-2" style={{ color: settings.wagerAmount > 0 ? "#fbbf24" : "var(--color-surface-400)" }}>
                  <Coins size={13} style={{ color: "#fbbf24" }} />
                  {settings.wagerAmount > 0 ? `${settings.wagerAmount} ${t("shop.coins")}` : t("settings.noWager", { defaultValue: "Tanpa Taruhan" })}
                </div>
              )}
            </div>

            {/* Realtime Toggle */}
            <div
              className="p-3 rounded-xl sm:col-span-1 flex justify-between items-center"
              style={{
                background: settings.isRealtime ? "rgb(34 197 94 / 0.08)" : "var(--color-surface-800)",
                border: settings.isRealtime ? "1px solid rgb(34 197 94 / 0.25)" : "1px solid var(--color-surface-700)",
              }}
            >
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-0.5 block" style={{ color: "var(--color-surface-500)" }}>
                  {t("challenge.gameType", { defaultValue: "Tipe Permainan" })}
                </label>
                <div className="font-black text-sm flex items-center gap-2" style={{ color: settings.isRealtime ? "#4ade80" : "var(--color-surface-300)" }}>
                  {settings.isRealtime
                    ? <Zap size={13} style={{ fill: "#4ade80", color: "#4ade80" }} />
                    : <Clock size={13} style={{ color: "var(--color-surface-500)" }} />}
                  {settings.isRealtime ? "Realtime (Live)" : "Asynchronous (Santai)"}
                </div>
              </div>
              {isHost && status !== "active" && (
                <button
                  onClick={() => updateSettings({ isRealtime: !settings.isRealtime })}
                  className="px-3 py-1.5 rounded-lg font-black text-xs transition-all"
                  style={{
                    background: settings.isRealtime ? "var(--color-surface-700)" : "var(--color-brand-500)",
                    color: settings.isRealtime ? "#4ade80" : "#fff",
                    border: settings.isRealtime ? "1px solid rgb(34 197 94 / 0.30)" : "none",
                    boxShadow: settings.isRealtime ? "none" : "0 2px 8px rgb(99 102 241 / 0.30)",
                  }}
                >
                  Ubah
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Player List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm flex items-center gap-2" style={{ color: "var(--color-surface-200)" }}>
              <Users size={16} style={{ color: "var(--color-brand-400)" }} />
              {t("classroom.members", { defaultValue: "Pemain" })} ({lobbyPlayers.length})
            </h3>
            {status !== "active" && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-xs font-black px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                style={{ background: "rgb(99 102 241 / 0.12)", color: "var(--color-brand-400)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(99 102 241 / 0.20)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(99 102 241 / 0.12)")}
              >
                <UserPlus size={12} /> {t("challenge.inviteFriend").split(" ")[0]}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {lobbyPlayers.length === 0 && (
              <p className="text-center py-8 text-sm" style={{ color: "var(--color-surface-600)" }}>
                {t("challenge.waitingPlayers")}
              </p>
            )}
            {lobbyPlayers.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--color-surface-900)", border: "1px solid var(--color-surface-800)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full font-black flex items-center justify-center relative shrink-0"
                    style={{
                      background: "linear-gradient(135deg, rgb(99 102 241 / 0.20) 0%, rgb(168 85 247 / 0.20) 100%)",
                      border: "2px solid var(--color-surface-700)",
                      color: "var(--color-brand-400)",
                      fontSize: 16,
                    }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                    {p.user_id === creatorId && (
                      <Crown size={13} className="absolute -top-1.5 -right-1.5" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-sm" style={{ color: "var(--color-surface-100)" }}>{p.name}</p>
                    <p className="text-[10px] font-bold" style={{ color: "var(--color-surface-600)" }}>Player</p>
                  </div>
                </div>

                {p.status === "accepted" ? (
                  p.is_finished ? (
                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg" style={{ background: "rgb(59 130 246 / 0.12)", color: "#60a5fa" }}>
                      <Trophy size={11} /> {p.score >= 0 ? p.score : t("quiz.finish")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg" style={{ background: "rgb(34 197 94 / 0.12)", color: "#4ade80" }}>
                      <CheckCircle2 size={11} /> READY
                    </span>
                  )
                ) : p.status === "rejected" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg" style={{ background: "rgb(239 68 68 / 0.12)", color: "#f87171" }}>
                    <XCircle size={11} /> OUT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg" style={{ background: "rgb(249 115 22 / 0.10)", color: "#fb923c" }}>
                    {t("challenge.pending")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-4"
        style={{
          background: "var(--color-surface-950)",
          borderTop: "1px solid var(--color-surface-800)",
          boxShadow: "0 -8px 32px rgb(0 0 0 / 0.30)",
        }}
      >
        <div className="max-w-2xl mx-auto flex gap-3">
          {lobbyPlayers.find((p) => p.user_id === user.ID)?.is_finished ||
          lobbyPlayers.find((p) => p.user_id === user.ID)?.score > -1 ? (
            <div
              className="w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 animate-pulse"
              style={{ background: "var(--color-surface-800)", color: "var(--color-surface-500)", border: "1px solid var(--color-surface-700)" }}
            >
              <Clock size={18} /> {t("quiz.waitingOthers")}
            </div>
          ) : (
            <>
              {status !== "active" && (
                <button
                  onClick={handleLeave}
                  className="flex-1 py-3.5 rounded-xl font-black text-sm transition-all inline-flex items-center justify-center gap-2"
                  style={{ background: "var(--color-surface-800)", color: "var(--color-surface-400)", border: "1px solid var(--color-surface-700)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgb(239 68 68 / 0.12)"; e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgb(239 68 68 / 0.20)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-surface-800)"; e.currentTarget.style.color = "var(--color-surface-400)"; e.currentTarget.style.borderColor = "var(--color-surface-700)"; }}
                >
                  <LogOut size={16} /> {t("challenge.leaveLobby")}
                </button>
              )}

              {isHost ? (
                <button
                  onClick={handleStart}
                  disabled={startingGame || lobbyPlayers.filter((p) => p.status === "accepted").length < (settings.mode === "survival" ? 1 : 2)}
                  className="flex-[2] py-3.5 rounded-xl font-black text-sm text-white inline-flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, var(--color-brand-600) 0%, #7c3aed 100%)",
                    boxShadow: "0 4px 20px rgb(99 102 241 / 0.35)",
                  }}
                >
                  {startingGame ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                  {startingGame ? t("auth.loading") : settings.isRealtime ? t("challenge.start") : t("challenge.playNow", { defaultValue: "MAIN SEKARANG" })}
                </button>
              ) : (
                <button
                  disabled
                  className="flex-[2] py-3.5 rounded-xl font-black text-sm inline-flex items-center justify-center gap-2 cursor-not-allowed"
                  style={{ background: "var(--color-surface-800)", color: "var(--color-surface-600)", border: "1px solid var(--color-surface-700)" }}
                >
                  {status === "active"
                    ? <><PlayCircle size={16} /> Game Sedang Berjalan</>
                    : <><Loader2 size={16} className="animate-spin" /> {t("challenge.waitingHost")}</>}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <InviteFriendModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} challengeId={id} currentPlayers={lobbyPlayers} />
    </div>
  );
};

export default LobbyPage;
