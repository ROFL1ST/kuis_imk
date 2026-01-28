// src/pages/social/LobbyPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socialAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { EventSourcePolyfill } from "event-source-polyfill";
import toast from "react-hot-toast";
import {
  Users,
  Zap,
  Gamepad2,
  LogOut,
  Copy,
  Settings,
  Clock,
  Swords,
  Crown,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
  PlayCircle,
  UserPlus,
  Coins,
  PlusCircle, // NEW
} from "lucide-react";
import InviteFriendModal from "../../components/ui/InviteFriendModal"; // NEW
import Skeleton from "../../components/ui/Skeleton"; // NEW

const LobbyPage = () => {
  const { t } = useLanguage();
  const { id } = useParams(); // Challenge ID
  const navigate = useNavigate();
  const eventSourceRef = useRef(null);

  // State Data
  const [challenge, setChallenge] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Gameplay
  const [countdown, setCountdown] = useState(null);
  const [status, setStatus] = useState("waiting"); // waiting, counting, starting
  const [startingGame, setStartingGame] = useState(false);

  // State Settings (Host Only)
  const [isHost, setIsHost] = useState(false);
  const [settings, setSettings] = useState({
    mode: "1v1",
    timeLimit: 60,
    isRealtime: false,
    quizId: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false); // NEW
  const [creatorId, setCreatorId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Fetch Challenge Data Awal
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        // Kita bisa reuse getMyChallenges, tapi idealnya ada getChallengeById
        // Workaround: Ambil dari list atau (Better) endpoint detail
        // Karena belum ada endpoint detail public, kita pakai SSE data awal nanti
        // Tapi untuk owner check dsb, kita butuh fetch.
        // Kita pakai getMyChallenges limit 1 filter by ID (kalo ada endpoint search)
        // Atau: Kita assume user sudah accept (krn masuk page ini).

        // Untuk sekarang, kita andalkan data dari SSE 'player_update' + 'settings_update'
        // Tapi kita butuh tau siapa host nya.
        // Kita hit API accept (idempotent) untuk memastikan join + dapet data response
        const res = await socialAPI.acceptChallenge(id);
        // Note: Response acceptChallenge tidak return full object di controller baru,
        // tapi kita bisa modif controller atau pakai data "player_update" pertama.
      } catch (err) {
        console.error("Gagal load lobby", err);
        // toast.error("Gagal memuat lobby");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  // 2. Koneksi SSE Realtime
  useEffect(() => {
    if (!id) return;

    const sseUrl = `${import.meta.env.VITE_API_URL}/challenges/${id}/lobby-stream`;

    // Auth backend menggunakan Cookie HttpOnly, jadi kita harus set withCredentials
    // Header Authorization Bearer tidak lagi dibutuhkan/valid jika token ada di cookie
    const eventSource = new EventSourcePolyfill(sseUrl, {
      withCredentials: true,
      heartbeatTimeout: 120000,
    });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => console.log("✅ Terhubung ke Lobby");

    // Event: Update Pemain + Info Dasar Lobby
    eventSource.addEventListener("player_update", (e) => {
      try {
        const data = JSON.parse(e.data);
        setLobbyPlayers(data.players || []);

        // Cek Host (Creator)
        // Di controller baru, 'player_update' juga kirim 'creator_id' dan 'status'
        if (data.creator_id) {
          const amIHost = data.creator_id === user.ID;
          setIsHost(amIHost);
          setCreatorId(data.creator_id); // Update Creator ID
        }

        // Sync Status (Active/Pending/Etc)
        if (data.status) {
          setStatus(data.status);
        }

        // Jika status cancelled/finished -> tendang player (kecuali finished async)
        if (data.status === "cancelled") {
          toast.error("Lobby dibubarkan oleh host");
          navigate("/challenges");
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Event: Update Settings
    eventSource.addEventListener("settings_update", (e) => {
      try {
        const data = JSON.parse(e.data);
        setSettings((prev) => ({
          ...prev,
          mode: data.mode || prev.mode,
          timeLimit: data.time_limit || prev.timeLimit,
          isRealtime:
            data.is_realtime !== undefined ? data.is_realtime : prev.isRealtime,
          quizId: data.quiz_id || prev.quizId,
          wagerAmount: data.wager_amount || prev.wagerAmount, // Added wagerAmount support
        }));

        // Juga update challenge state lokal buat display (Room Code usually static)
      } catch (err) {
        console.error(err);
      }
    });

    // Event: Update Host
    eventSource.addEventListener("host_migration", (e) => {
      try {
        const data = JSON.parse(e.data);
        toast(data.message, { icon: "👑" });
        if (data.new_host_id === user.ID) {
          setIsHost(true);
          toast.success("Anda sekarang adalah Host!");
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Event: Start Game
    eventSource.addEventListener("start_countdown", (e) => {
      const data = JSON.parse(e.data);
      setStatus("counting");
      setCountdown(data.seconds || 3);
    });

    eventSource.addEventListener("game_start", (e) => {
      const data = JSON.parse(e.data);
      setStatus("starting");
      eventSource.close();

      // Redirect Logic
      setTimeout(() => {
        // Jika Not Realtime -> Redirect ke Challenge List (sesuai request)
        // Check data.is_realtime (backend perlu kirim) atau use local state logic
        // Tapi "start_countdown" sends "mode". Let's assume we check state settings.isRealtime or data
        // Backend StartGameRealtime sends: quiz_id, message, seed, mode, initial_difficulty
        // Kita butuh tau isRealtime dari event data atau settings.
        // Better check settings state (optimistic) OR backend payload.
        // Tapi settings state mungkin belum sync 100% kalau update cepat.
        // Let's rely on settings.isRealtime for now as it syncs via SSE.

        if (!settings.isRealtime) {
          toast.success("Game Dimulai! Silakan kerjakan tantangan.");
          navigate("/challenges");
          return;
        }

        if (data.mode === "survival") {
          navigate("/play/survival", {
            state: {
              isRealtime: true,
              lobbyId: id,
              challengeID: id,
              isChallenge: true,
              seed: data.seed,
              timeLimit: settings.timeLimit,
            },
          });
        } else {
          navigate(`/play/${data.quiz_id}`, {
            state: {
              isRealtime: true,
              lobbyId: id,
              challengeID: id,
              isChallenge: true,
              timeLimit: settings.timeLimit,
              title: "Challenge Match",
            },
          });
        }
      }, 500);
    });

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [id, navigate, user.ID, settings.timeLimit]);

  // Countdown Logic
  useEffect(() => {
    if (status === "counting" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, status]);

  // Actions
  const handleLeave = async () => {
    try {
      await socialAPI.leaveLobby(id);
      navigate("/challenges");
      toast.success("Keluar lobby");
    } catch (err) {
      toast.error("Gagal keluar");
    }
  };

  const handleStart = async () => {
    // ASYNC MODE: Langsung main, gak perlu hit API start
    if (!settings.isRealtime) {
      navigate(`/play/${settings.quizId}`, {
        state: {
          isRealtime: false,
          lobbyId: id,
          challengeID: id,
          isChallenge: true,
          timeLimit: settings.timeLimit,
          title: "Challenge Match",
          mode: settings.mode,
        },
      });
      return;
    }

    setStartingGame(true);
    try {
      await socialAPI.startGame(id);
    } catch (err) {
      toast.error("Gagal memulai game");
      setStartingGame(false);
    }
  };

  const updateSettings = async (newSettings) => {
    // GUARD: Jika sudah aktif, jangan update
    if (status === "active") {
      toast.error("Tidak dapat mengubah settings saat game berlangsung");
      return;
    }

    // Optimistic update
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      // Mapping ke Snake Case untuk Backend
      const payload = {};
      if (newSettings.mode !== undefined) payload.mode = newSettings.mode;
      if (newSettings.timeLimit !== undefined)
        payload.time_limit = newSettings.timeLimit;
      if (newSettings.isRealtime !== undefined)
        payload.is_realtime = newSettings.isRealtime;
      if (newSettings.quizId !== undefined)
        payload.quiz_id = newSettings.quizId;

      await socialAPI.updateLobbySettings(id, payload);
    } catch (err) {
      toast.error("Gagal update setting");
      // Revert logic here if needed, but simple toast is enough for now
    }
  };

  // Copy Room Code (Kita butuh fetch detail buat dapet room code pastinya,
  // Tapi sementara kita bisa ambil dari mana?
  // Di controller `CreateChallenge` return object challenge ada `room_code`.
  // Di `JoinChallenge` return object ada `room_code`.
  // Tapi kalo direct refresh page /lobby/:id, kita ga punya data `room_code` kalau API get detail blm ada.
  // Solusi cepat: Tambahin `room_code` ke payload SSE `player_update` atau `settings_update`.
  // ATAU: Fetch `getMyChallenges` dan filter.
  // Kita coba fetch `getMyChallenges` di awal buat cari code.
  const [roomCode, setRoomCode] = useState("");
  const [isSyncing, setIsSyncing] = useState(true); // NEW: Blokir render sampe sync kelar

  const handleGenerateCode = async () => {
    try {
      const res = await socialAPI.generateRoomCode(id);
      const newCode = res.data.data.room_code;
      setRoomCode(newCode);
      toast.success("Kode Room berhasil dibuat: " + newCode);
    } catch (err) {
      toast.error("Gagal generate room code");
    }
  };

  useEffect(() => {
    const getCode = async () => {
      try {
        // Fetch page 1 (most recent)
        const res = await socialAPI.getMyChallenges(1, 20);
        const found = res.data.data.list.find((c) => c.ID == id);
        if (found) {
          setRoomCode(found.room_code || "");
          setSettings({
            mode: found.mode,
            timeLimit: found.time_limit,
            isRealtime: found.is_realtime,
            quizId: found.quiz_id,
            wagerAmount: found.wager_amount, // Sync wager too
          });
          // Fix: Sync status juga biar ga bisa edit kalo dah active
          if (found.status) setStatus(found.status);
        }
      } catch (e) {
      } finally {
        setIsSyncing(false); // Render UI setelah fetch selesai
      }
    };
    getCode();
  }, [id]);

  if (loading || isSyncing)
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        {/* Navbar Skeleton */}
        <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="w-10 h-10"></div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Room Code Skeleton */}
          <div className="h-40 bg-slate-200 rounded-3xl animate-pulse w-full"></div>

          {/* Settings Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse col-span-2"></div>
            </div>
          </div>

          {/* Player List Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse"></div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-white border border-slate-100 rounded-xl animate-pulse w-full"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );

  // Tampilan Hitung Mundur
  if (status === "counting" || status === "starting") {
    return (
      <div className="fixed inset-0 bg-indigo-900 z-50 flex flex-col items-center justify-center text-white">
        <div className="text-[10rem] font-black animate-pulse">
          {status === "starting" ? "GO!" : countdown}
        </div>
        <p className="text-2xl font-medium opacity-80 mt-4">Bersiaplah!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar Custom */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/challenges")}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
          >
            <ArrowLeft />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-slate-800">{t("challenge.lobby")}</h1>
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Connection
            </p>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* ROOM CODE CARD */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-200 font-bold text-sm tracking-widest uppercase mb-2">
              Room Code
            </p>
            {roomCode ? (
              <div
                onClick={() => {
                  navigator.clipboard.writeText(roomCode);
                  toast.success("Kode disalin!");
                }}
                className="flex justify-center items-center gap-3 cursor-pointer group"
              >
                <h1 className="text-5xl font-black tracking-widest text-white drop-shadow-md font-mono">
                  {roomCode}
                </h1>
                <Copy
                  className="opacity-50 group-hover:opacity-100 transition-opacity text-white"
                  size={24}
                />
              </div>
            ) : isHost ? (
              <button
                onClick={handleGenerateCode}
                className="mx-auto bg-indigo-50/20 hover:bg-indigo-50/30 text-white border border-white/30 px-4 py-2 rounded-xl font-bold transition flex items-center gap-2"
              >
                <PlusCircle size={18} /> GENERATE CODE
              </button>
            ) : (
              <p className="text-white/60 italic text-sm">
                Belum ada kode room
              </p>
            )}
          </div>
          {/* Dekorasi Background */}
          <Gamepad2
            className="absolute -bottom-4 -right-4 text-white opacity-10 rotate-12"
            size={120}
          />
          <Users
            className="absolute -top-4 -left-4 text-white opacity-10 -rotate-12"
            size={100}
          />
        </div>

        {/* SETTINGS PANEL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Settings size={18} className="text-slate-400" />{" "}
              {t("challenge.settings", { defaultValue: "Pengaturan Game" })}
            </h3>
            {isHost && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">
                HOST CONTROLS
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MODE */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">
                {t("createChallenge.selectMode")}
              </label>
              {isHost ? (
                <select
                  value={settings.mode}
                  onChange={(e) => updateSettings({ mode: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-semibold text-slate-700 focus:outline-indigo-500"
                >
                  <option value="1v1">⚔️ Duel 1v1</option>
                  <option value="survival">🏆 Survival</option>
                  <option value="2v2">🛡️ Team 2v2</option>
                </select>
              ) : (
                <div className="font-bold text-slate-700 capitalize flex items-center gap-2">
                  {settings.mode === "survival" ? (
                    <Trophy size={16} className="text-yellow-500" />
                  ) : (
                    <Swords size={16} className="text-indigo-500" />
                  )}
                  {settings.mode}
                </div>
              )}
            </div>

            {/* TIME LIMIT */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">
                {settings.isRealtime
                  ? t("createChallenge.timePerQuestion", {
                      defaultValue: "Waktu per Soal",
                    })
                  : t("createChallenge.timeLimit")}
              </label>
              {isHost && status !== "active" ? (
                <select
                  value={settings.timeLimit}
                  onChange={(e) =>
                    updateSettings({ timeLimit: parseInt(e.target.value) })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-semibold text-slate-700 focus:outline-indigo-500"
                >
                  <option value="30">⚡ 30 {t("review.seconds")}</option>
                  <option value="60">⏱️ 60 {t("review.seconds")}</option>
                  <option value="120">🐢 2 {t("review.minutes")}</option>
                  <option value="0">
                    ♾️{" "}
                    {t("createChallenge.noLimit", {
                      defaultValue: "Tanpa Batas",
                    })}
                  </option>
                </select>
              ) : (
                <div className="font-bold text-slate-700 flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />{" "}
                  {settings.timeLimit === 0
                    ? `∞ ${t("createChallenge.noLimit", { defaultValue: "Tanpa Batas" })}`
                    : `${settings.timeLimit} ${t("review.seconds")}`}
                </div>
              )}
            </div>

            {/* WAGER / BET SETTING */}
            <div
              className={`p-3 rounded-xl border ${settings.wagerAmount > 0 ? "bg-yellow-50 border-yellow-200" : "bg-slate-50 border-slate-100"}`}
            >
              <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">
                {t("createChallenge.wager")}
              </label>
              {isHost && status !== "active" ? (
                <div className="flex items-center gap-2">
                  <Coins size={16} className="text-yellow-500" />
                  <select
                    value={settings.wagerAmount || 0}
                    onChange={(e) =>
                      updateSettings({ wagerAmount: parseInt(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-700 focus:outline-yellow-500"
                  >
                    <option value="0">
                      🚫{" "}
                      {t("settings.noWager", { defaultValue: "Tanpa Taruhan" })}
                    </option>
                    <option value="100">💰 100 {t("shop.coins")}</option>
                    <option value="500">💰 500 {t("shop.coins")}</option>
                    <option value="1000">💎 1000 {t("shop.coins")}</option>
                    <option value="5000">👑 5000 {t("shop.coins")}</option>
                  </select>
                </div>
              ) : (
                <div className="font-bold text-slate-700 flex items-center gap-2">
                  <Coins size={16} className="text-yellow-500" />
                  {settings.wagerAmount > 0
                    ? `${settings.wagerAmount} ${t("shop.coins")}`
                    : t("settings.noWager", { defaultValue: "Tanpa Taruhan" })}
                </div>
              )}
            </div>

            {/* REALTIME TOGGLE */}
            <div
              className={`p-3 rounded-xl border ${settings.isRealtime ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-100"} col-span-1 sm:col-span-2 flex justify-between items-center`}
            >
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-0.5 block">
                  {t("challenge.gameType", { defaultValue: "Tipe Permainan" })}
                </label>
                <div
                  className={`font-bold ${settings.isRealtime ? "text-green-700" : "text-slate-700"} flex items-center gap-2`}
                >
                  {settings.isRealtime ? (
                    <Zap size={16} className="fill-green-600 text-green-600" />
                  ) : (
                    <Clock size={16} />
                  )}
                  {settings.isRealtime
                    ? "Realtime (Live)"
                    : "Asynchronous (Santai)"}
                </div>
              </div>
              {isHost && status !== "active" && (
                <button
                  onClick={() =>
                    updateSettings({ isRealtime: !settings.isRealtime })
                  }
                  className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-colors ${settings.isRealtime ? "bg-white text-green-600 border border-green-200" : "bg-indigo-600 text-white shadow-sm"}`}
                >
                  {t("profile.edit", { defaultValue: "Ubah" }).split(" ")[0]}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PLAYER LIST */}
        <div>
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-indigo-600" />{" "}
              {t("classroom.members", { defaultValue: "Pemain" })} (
              {lobbyPlayers.length})
            </div>

            {status !== "active" && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition flex items-center gap-1"
              >
                <UserPlus size={14} />{" "}
                {t("challenge.inviteFriend").split(" ")[0]}
              </button>
            )}
          </h3>
          <div className="space-y-3">
            {lobbyPlayers.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                {t("challenge.waitingPlayers")}
              </div>
            )}

            {lobbyPlayers.map((p, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar Placeholder */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-bold flex items-center justify-center border-2 border-white shadow-sm relative">
                    {p.name.charAt(0).toUpperCase()}
                    {p.user_id === creatorId && ( // Use localized state
                      <Crown
                        size={14}
                        className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-400"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Player
                    </p>
                  </div>
                </div>

                <div>
                  {p.status === "accepted" ? (
                    // Show Score/Finished for Async
                    p.is_finished ? ( // Check backend flag (need to ensure backend sends this)
                      <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs font-bold">
                        <Trophy size={12} />{" "}
                        {p.score >= 0 ? p.score : t("quiz.finish")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
                        <CheckCircle2 size={12} /> READY
                      </span>
                    )
                  ) : p.status === "rejected" ? (
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold">
                      <XCircle size={12} /> OUT
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-xs font-bold">
                      {t("challenge.pending")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex gap-3">
          {/* CHECK IF USER IS FINISHED */}
          {lobbyPlayers.find((p) => p.user_id === user.ID)?.is_finished ||
          lobbyPlayers.find((p) => p.user_id === user.ID)?.score > -1 ? (
            <div className="w-full py-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-500 font-bold animate-pulse">
              <Clock size={20} />
              {t("quiz.waitingOthers")}
            </div>
          ) : (
            <>
              {status !== "active" && (
                <button
                  onClick={handleLeave}
                  className="flex-1 py-3.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> {t("challenge.leaveLobby")}
                </button>
              )}

              {isHost ? (
                <button
                  onClick={handleStart}
                  disabled={
                    startingGame ||
                    lobbyPlayers.filter((p) => p.status === "accepted").length <
                      (settings.mode === "survival" ? 1 : 2)
                  }
                  className="flex-[2] py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startingGame ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <PlayCircle />
                  )}
                  {startingGame
                    ? t("auth.loading")
                    : settings.isRealtime
                      ? t("challenge.start")
                      : t("challenge.playNow", {
                          defaultValue: "MAIN SEKARANG",
                        })}
                </button>
              ) : (
                <button
                  disabled
                  className="flex-[2] py-3.5 rounded-xl font-bold bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "active" ? (
                    <>
                      <PlayCircle size={18} /> Game Sedang Berjalan
                    </>
                  ) : (
                    <>
                      <Loader2 className="animate-spin" size={18} />{" "}
                      {t("challenge.waitingHost")}
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <InviteFriendModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        challengeId={id}
        currentPlayers={lobbyPlayers}
      />
    </div>
  );
};

export default LobbyPage;
