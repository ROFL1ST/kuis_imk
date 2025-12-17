import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  PlayCircle,
  Trophy,
  ArrowLeft,
  Swords,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  UserPlus, // Icon baru untuk 2v2
} from "lucide-react";
import { topicAPI, socialAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";

const QuizList = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State & Settings
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  const [challengeSettings, setChallengeSettings] = useState({
    mode: "1v1", // '1v1', '2v2', or 'battleroyale'
    timeLimit: 0, // Minutes
    isRealtime: false,
    selectedOpponents: [], // Array of usernames
  });

  useEffect(() => {
    Promise.all([topicAPI.getQuizzesBySlug(slug), socialAPI.getFriends()])
      .then(([quizRes, friendRes]) => {
        setQuizzes(quizRes.data.data || []);
        setFriends(friendRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const openChallengeModal = (quizId) => {
    setSelectedQuizId(quizId);
    setChallengeSettings({
      mode: "1v1",
      timeLimit: 0,
      isRealtime: false,
      selectedOpponents: [],
    });
    setIsModalOpen(true);
  };

  const toggleOpponent = (username) => {
    const { mode, selectedOpponents } = challengeSettings;
    let updated = [...selectedOpponents];

    if (updated.includes(username)) {
      // Hapus jika sudah ada
      updated = updated.filter((u) => u !== username);
    } else {
      // Logic Limitasi berdasarkan Mode
      if (mode === "1v1") {
        updated = [username]; // Replace (Max 1)
      } else if (mode === "2v2") {
        if (updated.length < 3) {
          updated.push(username); // Append (Max 3)
        } else {
          toast.error("Mode 2v2 maksimal 3 orang (1 Teman + 2 Lawan)");
        }
      } else {
        updated.push(username); // Battle Royale (Unlimited)
      }
    }
    setChallengeSettings({ ...challengeSettings, selectedOpponents: updated });
  };

  // Ubah mode -> Reset pilihan
  const changeMode = (newMode) => {
    setChallengeSettings({
      ...challengeSettings,
      mode: newMode,
      selectedOpponents: [],
    });
  };

  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const handleSendChallenge = async () => {
    // Validasi Akhir
    if (challengeSettings.selectedOpponents.length === 0) {
      toast.error("Pilih minimal 1 lawan!");
      return;
    }
    if (
      challengeSettings.mode === "2v2" &&
      challengeSettings.selectedOpponents.length !== 3
    ) {
      toast.error("Mode 2v2 harus memilih 3 orang (1 Teman, 2 Lawan)");
      return;
    }

    try {
      setLoadingChallenge(true);
      const payload = {
        quiz_id: selectedQuizId,
        opponent_usernames: challengeSettings.selectedOpponents,
        mode: challengeSettings.mode,
        time_limit: parseInt(challengeSettings.timeLimit) * 60, // Convert to seconds
        is_realtime: challengeSettings.isRealtime,
      };

      await socialAPI.createChallenge(payload);
      toast.success("Tantangan berhasil dibuat!");
      setIsModalOpen(false);
    } catch (err) {
      console.log(err);
      toast.error("Gagal membuat tantangan.");
    } finally {
      setLoadingChallenge(false);
    }
  };

  useEffect(() => {
    document.title = `Kuis di ${slug} | QuizApp`;
  }, [slug]);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft size={18} /> Kembali ke Topik
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 capitalize">
            Kuis: {slug}
          </h1>
          <p className="text-slate-500">
            Pilih kuis untuk mulai mengerjakan atau menantang teman.
          </p>
        </div>
        <Link
          to={`/leaderboard/${slug}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-100 text-yellow-700 rounded-full font-bold hover:bg-yellow-200 transition"
        >
          <Trophy size={18} /> Leaderboard
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">Memuat Kuis...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-slate-500">Belum ada kuis di topik ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.ID}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-md transition"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {quiz.title}
                </h3>
                <p className="text-slate-500">{quiz.description}</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => openChallengeModal(quiz.ID)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold hover:bg-orange-200 flex items-center justify-center gap-2 transition"
                >
                  <Swords size={18} /> Tantang
                </button>
                <Link
                  to={`/play/${quiz.ID}`}
                  state={{ title: quiz.title }}
                  className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition"
                >
                  <PlayCircle size={18} /> Main
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === MODAL BUAT TANTANGAN === */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <>
            <Swords className="text-orange-500" /> Buat Tantangan Baru
          </>
        }
        maxWidth="max-w-lg"
      >
        <div className="space-y-6">
          {/* 1. Pilih Mode */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Pilih Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* MODE 1v1 */}
              <button
                onClick={() => changeMode("1v1")}
                className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition text-sm
                  ${
                    challengeSettings.mode === "1v1"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-100 hover:border-slate-300"
                  }
                `}
              >
                <Swords size={20} />
                <span className="font-bold">1 VS 1</span>
              </button>

              {/* MODE 2v2 */}
              <button
                onClick={() => changeMode("2v2")}
                className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition text-sm
                  ${
                    challengeSettings.mode === "2v2"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-100 hover:border-slate-300"
                  }
                `}
              >
                <UserPlus size={20} />
                <span className="font-bold">2 VS 2</span>
              </button>

              {/* MODE BATTLE ROYALE */}
              <button
                onClick={() => changeMode("battleroyale")}
                className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition text-sm
                  ${
                    challengeSettings.mode === "battleroyale"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-slate-100 hover:border-slate-300"
                  }
                `}
              >
                <Users size={20} />
                <span className="font-bold">Battle Royale</span>
              </button>
            </div>
            {/* Helper Text untuk 2v2 */}
            {challengeSettings.mode === "2v2" && (
              <p className="text-xs text-blue-600 mt-2 font-medium bg-blue-50 p-2 rounded-lg border border-blue-100">
                ℹ️ Pilih 3 orang: Urutan pertama akan jadi <b>Teman Setim</b>,
                dua berikutnya jadi <b>Lawan</b>.
              </p>
            )}
          </div>

          {/* 2. Pengaturan Waktu */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Batas Waktu (Menit)
            </label>
            <div className="relative">
              <Clock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="number"
                min="0"
                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="0 = Tidak ada batas"
                value={challengeSettings.timeLimit}
                onChange={(e) =>
                  setChallengeSettings({
                    ...challengeSettings,
                    timeLimit: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* 3. Realtime Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="realtime"
              checked={challengeSettings.isRealtime}
              onChange={(e) =>
                setChallengeSettings({
                  ...challengeSettings,
                  isRealtime: e.target.checked,
                })
              }
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label
              htmlFor="realtime"
              className="text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer select-none"
            >
              <Zap size={16} className="text-yellow-500" /> Mode Realtime (Main
              Bareng)
            </label>
          </div>

          {/* 4. Pilih Teman */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Pilih Lawan/Tim
              {challengeSettings.mode === "1v1"
                ? " (Pilih 1)"
                : challengeSettings.mode === "2v2"
                ? ` (${challengeSettings.selectedOpponents.length}/3)`
                : ""}
            </label>

            {friends.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg text-center">
                Belum punya teman.{" "}
                <Link to="/friends" className="text-indigo-600 font-bold">
                  Tambah teman dulu!
                </Link>
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar border rounded-xl p-2">
                {friends.map((friend) => {
                  const isSelected =
                    challengeSettings.selectedOpponents.includes(
                      friend.username
                    );
                  const selectedIndex =
                    challengeSettings.selectedOpponents.indexOf(
                      friend.username
                    );

                  // Label khusus mode 2v2
                  let roleLabel = "";
                  if (isSelected && challengeSettings.mode === "2v2") {
                    if (selectedIndex === 0) roleLabel = "TEAMMATE";
                    else roleLabel = "ENEMY";
                  }

                  return (
                    <button
                      key={friend.ID}
                      onClick={() => toggleOpponent(friend.username)}
                      className={`w-full text-left p-2.5 rounded-lg border flex justify-between items-center group transition
                        ${
                          isSelected
                            ? challengeSettings.mode === "2v2" &&
                              selectedIndex === 0
                              ? "bg-blue-50 border-blue-200" // Teammate Style
                              : "bg-indigo-50 border-indigo-200" // Normal/Enemy Style
                            : "bg-white border-transparent hover:bg-slate-50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                          ${
                            isSelected
                              ? challengeSettings.mode === "2v2" &&
                                selectedIndex === 0
                                ? "bg-blue-500 text-white"
                                : "bg-indigo-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          }
                        `}
                        >
                          {friend.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-bold ${
                                isSelected
                                  ? "text-indigo-700"
                                  : "text-slate-700"
                              }`}
                            >
                              {friend.name}
                            </p>
                            {/* Role Badge 2v2 */}
                            {roleLabel && (
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                  roleLabel === "TEAMMATE"
                                    ? "bg-blue-200 text-blue-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {roleLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            @{friend.username}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2
                          size={18}
                          className={
                            challengeSettings.mode === "2v2" &&
                            selectedIndex === 0
                              ? "text-blue-600"
                              : "text-indigo-600"
                          }
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tombol Aksi */}
          <button
            onClick={handleSendChallenge}
            disabled={
              challengeSettings.selectedOpponents.length === 0 ||
              loadingChallenge ||
              (challengeSettings.mode === "2v2" &&
                challengeSettings.selectedOpponents.length !== 3)
            }
            className={`w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 ${
              loadingChallenge ? "cursor-not-allowed" : ""
            }`}
          >
            <Swords size={20} />
            {loadingChallenge
              ? "Membuat Tantangan..."
              : challengeSettings.mode === "2v2"
              ? challengeSettings.selectedOpponents.length === 3
                ? "KIRIM TANTANGAN (2 vs 2)"
                : `Pilih ${3 - challengeSettings.selectedOpponents.length} lagi`
              : "KIRIM TANTANGAN"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default QuizList;