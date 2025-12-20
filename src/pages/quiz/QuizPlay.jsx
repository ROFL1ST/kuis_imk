// src/pages/quiz/QuizPlay.jsx

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI, quizAPI, socialAPI } from "../../services/api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Lightbulb,
  XCircle,
  Clock,
  Trophy,
  Home,
  Swords,
  Zap,
  Loader2,
  ArrowRight,
  AlertTriangle,
  Flag,
  Type as TypeIcon,
  CheckSquare,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import LevelUpModal from "../../components/ui/LevelUpModal";
import { getToken } from "../../services/auth";

// Helper: Shuffle Array (Fisher-Yates Algorithm)
const shuffleArray = (array) => {
  if (!array || array.length === 0) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const QuizPlay = () => {
  const { quizId } = useParams();
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tangkap Data dari Link State
  const quizTitle = location.state?.title || "Kuis";
  const isChallenge = location.state?.isChallenge || false;
  const isRealtime = location.state?.isRealtime || false;
  const timeLimit = location.state?.timeLimit || 0;
  const challengeID = location.state?.challengeID || null;

  // State Data Soal & Jawaban
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Bisa string (MCQ/Short) atau array (Multi)

  // State UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Timer Visual
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef(null);

  // State Result
  const [isFinished, setIsFinished] = useState(false);
  const [resultData, setResultData] = useState(null);
  const startTime = useRef(Date.now());
  const [duration, setDuration] = useState(0);
  const [historyId, setHistoryId] = useState(null);

  // Level Up Modal
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelData, setNewLevelData] = useState(0);

  // Realtime Logic States
  const [opponentsProgress, setOpponentsProgress] = useState({});
  const [playersMap, setPlayersMap] = useState({});
  const [finishedPlayers, setFinishedPlayers] = useState({});

  // ----------------------------------------------------------------
  // 1. LOGIC REALTIME (SSE)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!isRealtime || !challengeID) return;

    const token = getToken();

    document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax`;
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/challenges/${challengeID}/lobby-stream`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      if (event.data === ":keepalive") return;
    };

    eventSource.addEventListener("player_update", (e) => {
      try {
        const data = JSON.parse(e.data);
        const map = {};
        if (data.players) {
          data.players.forEach((p) => {
            map[p.user_id] = { name: p.name, team: p.team || "solo" };
          });
        }
        setPlayersMap(map);
      } catch (err) {
        console.error("Parse player update error:", err);
      }
    });

    eventSource.addEventListener("opponent_progress", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.user_id !== user.ID) {
          setOpponentsProgress((prev) => ({
            ...prev,
            [data.user_id]: data.progress,
          }));
        }
      } catch (err) {
        console.error("Error parsing progress", err);
      }
    });

    eventSource.addEventListener("player_finished", (e) => {
      try {
        const data = JSON.parse(e.data);
        setFinishedPlayers((prev) => ({
          ...prev,
          [data.user_id]: { score: data.score, username: data.username },
        }));

        if (data.user_id !== user.ID) {
          setOpponentsProgress((prev) => ({ ...prev, [data.user_id]: 100 }));
          toast.success(`${data.username} telah selesai!`, { icon: "🏁" });
        }
      } catch (err) {
        console.error("Error parsing finished event", err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [isRealtime, challengeID, user.ID]);

  // ----------------------------------------------------------------
  // 2. FETCH SOAL & TIMER
  // ----------------------------------------------------------------
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    quizAPI
      .getQuestions(quizId)
      .then((res) => {
        const rawQuestions = res.data.data || [];

        // Proses Soal: Shuffle opsi hanya jika MCQ atau Multi Select
        const processedQuestions = rawQuestions.map((q) => {
          const type = q.type || "mcq";
          let options = q.options;

          if (type === "mcq" || type === "multi_select") {
            options = shuffleArray(q.options);
          }

          return {
            ...q,
            type: type,
            options: options,
          };
        });

        setQuestions(processedQuestions);
        startTime.current = Date.now();

        timerIntervalRef.current = setInterval(() => {
          const currentElapsed = Math.floor(
            (Date.now() - startTime.current) / 1000
          );
          setElapsedTime(currentElapsed);
        }, 1000);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat soal.");
        navigate("/");
      })
      .finally(() => setLoading(false));

    return () => clearInterval(timerIntervalRef.current);
  }, [quizId, navigate]);

  useEffect(() => {
    if (timeLimit > 0 && !isFinished && !submitting) {
      if (elapsedTime >= timeLimit) {
        clearInterval(timerIntervalRef.current);
        toast.error("Waktu Habis! Mengirim jawaban otomatis...");
        handleSubmit();
      }
    }
  }, [elapsedTime, timeLimit, isFinished, submitting]);

  // ----------------------------------------------------------------
  // 3. HANDLERS INPUT JAWABAN
  // ----------------------------------------------------------------

  // Handler: Pilihan Ganda / Boolean
  const handleOptionClick = (option) => {
    const currentQId = questions[currentIndex].ID;
    setAnswers({ ...answers, [currentQId]: option });
  };

  // Handler: Isian Singkat
  const handleTextChange = (e) => {
    const currentQId = questions[currentIndex].ID;
    setAnswers({ ...answers, [currentQId]: e.target.value });
  };

  // Handler: Multi Select (Checkbox)
  const handleMultiSelectClick = (option) => {
    const currentQId = questions[currentIndex].ID;
    const currentSelected = Array.isArray(answers[currentQId])
      ? answers[currentQId]
      : [];

    let newSelected;
    if (currentSelected.includes(option)) {
      // Hapus (Uncheck)
      newSelected = currentSelected.filter((item) => item !== option);
    } else {
      // Tambah (Check)
      newSelected = [...currentSelected, option];
    }
    setAnswers({ ...answers, [currentQId]: newSelected });
  };

  // ----------------------------------------------------------------
  // 4. LOGIC NAVIGASI & SUBMIT
  // ----------------------------------------------------------------

  const sendProgress = async (index) => {
    if (isRealtime && challengeID) {
      try {
        await socialAPI.postProgress(challengeID, {
          current_index: index,
          total_soal: questions.length,
        });
      } catch (err) {
        console.error("Gagal kirim progress", err);
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setShowHint(false);
      await sendProgress(nextIndex);
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setShowHint(false);
      sendProgress(prevIndex);
    }
  };

  // Helper: Hitung Skor Lokal (Estimasi Frontend)
  const calculateLocalScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const userAns = answers[q.ID];
      const correctAns = q.correct;

      if (!userAns) return;

      if (q.type === "short_answer") {
        // Case Insensitive
        if (
          String(userAns).trim().toLowerCase() ===
          String(correctAns).trim().toLowerCase()
        ) {
          correct++;
        }
      } else if (q.type === "multi_select") {
        // Array comparison
        try {
          const keyArray = JSON.parse(correctAns || "[]"); // Kunci jawaban dari DB biasanya string JSON
          if (Array.isArray(userAns) && Array.isArray(keyArray)) {
            if (userAns.length === keyArray.length) {
              const sortedUser = [...userAns].sort().toString();
              const sortedKey = [...keyArray].sort().toString();
              if (sortedUser === sortedKey) correct++;
            }
          }
        } catch (e) {
          console.error("Error parsing multi select key", e);
        }
      } else {
        // Exact Match (MCQ / Boolean)
        if (userAns === correctAns) correct++;
      }
    });
    return correct;
  };

  const handleSubmit = async () => {
    clearInterval(timerIntervalRef.current);
    setSubmitting(true);

    const endTime = Date.now();
    let timeTaken = Math.floor((endTime - startTime.current) / 1000);
    if (timeLimit > 0 && timeTaken > timeLimit) {
      timeTaken = timeLimit;
    }

    // 1. Hitung Estimasi Skor Frontend
    const localCorrectCount = calculateLocalScore();
    const localScore = Math.round((localCorrectCount / questions.length) * 100);

    // 2. Siapkan Snapshot (Convert Array MultiSelect ke JSON String)
    const processedSnapshot = {};
    Object.keys(answers).forEach((key) => {
      const ans = answers[key];
      if (Array.isArray(ans)) {
        processedSnapshot[key] = JSON.stringify(ans); // ["A", "B"] -> '["A", "B"]'
      } else {
        processedSnapshot[key] = ans;
      }
    });

    const submissionTitle = isChallenge ? `[DUEL] ${quizTitle}` : quizTitle;

    const payload = {
      quiz_id: parseInt(quizId),
      quiz_title: submissionTitle,
      score: localScore, // Kirim skor estimasi (Backend akan validasi ulang)
      total_soal: questions.length,
      snapshot: processedSnapshot,
      time_taken: timeTaken,
      challenge_id: challengeID,
    };

    try {
      const currentLevel = user?.level || 1;

      const res = await quizAPI.submitScore(payload);
      const finalHistory = res.data.data;

      setHistoryId(finalHistory.ID);

      // Ambil skor resmi dari backend untuk ditampilkan
      const backendScore = finalHistory.score;
      const officialCorrectCount = Math.round(
        (backendScore / 100) * questions.length
      );

      if (backendScore >= 70) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }

      const userRes = await authAPI.authMe();
      const updatedUser = userRes.data.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (updatedUser.level > currentLevel) {
        setNewLevelData(updatedUser.level);
        setTimeout(() => setShowLevelUp(true), 500);
      } else {
        toast.success("Jawaban terkirim!");
      }

      setDuration(timeTaken);
      setResultData({
        score: backendScore,
        correct: officialCorrectCount,
        wrong: questions.length - officialCorrectCount,
        total: questions.length,
      });
      setIsFinished(true);
    } catch (err) {
      console.log(err);
      toast.error("Gagal menyimpan skor.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = `Bermain: ${quizTitle} | QuizApp`;
  }, [quizTitle]);

  const isTeammate = (oppId) => {
    const myTeam = playersMap[user.ID]?.team;
    const oppTeam = playersMap[oppId]?.team;
    if (!myTeam || myTeam === "solo") return false;
    return myTeam === oppTeam;
  };

  const checkAllFinished = () => {
    if (Object.keys(playersMap).length === 0) return false;
    const totalOpponents = Object.keys(playersMap).length - 1;
    let finishedOpponents = 0;
    Object.keys(finishedPlayers).forEach((fid) => {
      if (parseInt(fid) !== user.ID) finishedOpponents++;
    });
    return totalOpponents > 0 && finishedOpponents >= totalOpponents;
  };

  const goToReview = (historyId) => {
    navigate(`/history/review/${historyId}`);
  };

  // ----------------------------------------------------------------
  // 5. RENDERER INPUT (Kunci Tampilan Variasi Soal)
  // ----------------------------------------------------------------
  const renderAnswerInput = (currentQ) => {
    const currentAnswer = answers[currentQ.ID];

    // TIPE 1: ISIAN SINGKAT
    if (currentQ.type === "short_answer") {
      return (
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              value={currentAnswer || ""}
              onChange={handleTextChange}
              placeholder="Ketik jawabanmu di sini..."
              className="w-full p-5 pl-12 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none text-lg font-medium transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentAnswer?.trim() !== "") {
                  handleNext();
                }
              }}
            />
            <TypeIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
          </div>
          <p className="text-xs text-slate-400 mt-3 ml-2 flex items-center gap-1">
            <CheckCircle2 size={12} /> Jawaban tidak sensitif huruf besar/kecil
            (Case Insensitive)
          </p>
        </div>
      );
    }

    // TIPE 2: MULTI SELECT
    if (currentQ.type === "multi_select") {
      const currentSelected = Array.isArray(currentAnswer) ? currentAnswer : [];
      return (
        <div className="grid grid-cols-1 gap-3 mt-4">
          <p className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
            <CheckSquare size={16} /> Pilih semua jawaban yang benar:
          </p>
          {currentQ.options &&
            currentQ.options.map((opt, idx) => {
              const isSelected = currentSelected.includes(opt);
              return (
                <button
                  key={idx}
                  onClick={() => handleMultiSelectClick(opt)}
                  className={`
                  relative p-4 rounded-xl border-2 transition-all flex items-center justify-between group text-left
                  ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-md"
                      : "border-slate-100 hover:border-indigo-300 bg-white text-slate-600 hover:bg-slate-50 font-medium"
                  }
                `}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors shrink-0
                         ${
                           isSelected
                             ? "bg-indigo-600 border-indigo-600 text-white"
                             : "bg-white border-slate-300 group-hover:border-indigo-400"
                         }
                    `}
                    >
                      {isSelected && <CheckCircle2 size={16} />}
                    </div>
                    <span className="leading-snug">{opt}</span>
                  </div>
                </button>
              );
            })}
        </div>
      );
    }

    // TIPE 3: PILIHAN GANDA & BOOLEAN
    const isBoolean = currentQ.type === "boolean";
    return (
      <div
        className={`grid gap-3 ${
          isBoolean ? "grid-cols-2 mt-4" : "grid-cols-1 mt-2"
        }`}
      >
        {currentQ.options &&
          currentQ.options.map((opt, idx) => {
            const isSelected = currentAnswer === opt;
            const label = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                className={`
                relative p-4 rounded-xl border-2 transition-all flex items-center group
                ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-md transform scale-[1.01]"
                    : "border-slate-100 hover:border-indigo-300 bg-white text-slate-600 hover:bg-slate-50 font-medium"
                }
                ${
                  isBoolean
                    ? "justify-center text-center h-20 text-lg"
                    : "justify-between text-left"
                }
              `}
              >
                <div className="flex items-center gap-4">
                  {!isBoolean && (
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors
                         ${
                           isSelected
                             ? "bg-indigo-600 text-white border-indigo-600"
                             : "bg-white text-slate-400 border-slate-200 group-hover:border-indigo-300"
                         }
                    `}
                    >
                      {label}
                    </div>
                  )}
                  <span className="leading-snug">{opt}</span>
                </div>
                {!isBoolean && isSelected && (
                  <CheckCircle2 size={20} className="text-indigo-600" />
                )}
              </button>
            );
          })}
      </div>
    );
  };

  // ----------------------------------------------------------------
  // 6. RENDER MAIN VIEW
  // ----------------------------------------------------------------

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-medium text-slate-500 gap-2">
        <Loader2 className="animate-spin text-indigo-600" /> Memuat Soal...
      </div>
    );
  if (questions.length === 0)
    return <div className="text-center mt-20 text-slate-500">Soal kosong.</div>;

  // VIEW 1: HASIL AKHIR
  if (isFinished && resultData) {
    const isPass = resultData.score >= 70;
    const allDone = checkAllFinished();

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-white rounded-[2rem] shadow-xl border overflow-hidden mb-6 text-center p-8 relative
              ${
                isPass
                  ? "border-green-200 shadow-green-100"
                  : "border-red-200 shadow-red-100"
              }
            `}
          >
            {isChallenge && (
              <div className="absolute top-4 left-0 w-full flex justify-center">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 border border-orange-200">
                  <Swords size={12} /> Duel Mode
                </span>
              </div>
            )}

            {/* Score Circle */}
            <div className="mt-6 mb-6 flex justify-center relative z-10">
              <div
                className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center border-[8px] shadow-inner bg-white
                    ${
                      isPass
                        ? "border-green-100 text-green-600"
                        : "border-red-100 text-red-500"
                    }
               `}
              >
                <span className="text-6xl font-black tracking-tighter">
                  {resultData.score}
                </span>
                <span className="text-xs font-bold tracking-widest opacity-60 mt-1">
                  POIN
                </span>
                {isPass && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    delay={0.3}
                    className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg border-4 border-white"
                  >
                    <Trophy
                      className="text-white"
                      size={24}
                      fill="currentColor"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            <h1
              className={`text-2xl font-black mb-1 ${
                isPass ? "text-slate-800" : "text-slate-700"
              }`}
            >
              {isPass ? "Kerja Bagus!" : "Jangan Menyerah!"}
            </h1>
            <p className="text-slate-400 text-sm font-medium mb-6">
              Kamu telah menyelesaikan kuis ini.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">
                  Waktu
                </div>
                <div className="font-bold text-slate-700 flex justify-center items-center gap-1">
                  <Clock size={14} />{" "}
                  {duration > 60 ? formatTime(duration) : `${duration}s`}
                </div>
              </div>
              <div className="text-center border-l border-r border-slate-200">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">
                  Benar (Est)
                </div>
                <div className="font-bold text-green-600 flex justify-center items-center gap-1">
                  <CheckCircle2 size={14} /> {resultData.correct}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">
                  Salah (Est)
                </div>
                <div className="font-bold text-red-500 flex justify-center items-center gap-1">
                  <XCircle size={14} /> {resultData.wrong}
                </div>
              </div>
            </div>

            {/* Status Menunggu Lawan */}
            {isRealtime && (
              <div
                className={`border p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-6 transition-colors
                  ${
                    allDone
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-blue-50 border-blue-100 text-blue-600 animate-pulse"
                  }
              `}
              >
                {allDone ? (
                  <>
                    <CheckCircle2 size={14} /> Semua pemain selesai!
                  </>
                ) : (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Menunggu
                    lawan lain selesai...
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {isChallenge ? (
                <button
                  onClick={() => navigate("/challenges")}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition flex items-center justify-center gap-2"
                >
                  <Swords size={18} /> KEMBALI KE ARENA
                </button>
              ) : (
                <Link
                  to="/"
                  className="w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition flex items-center justify-center gap-2"
                >
                  <Home size={18} /> Kembali ke Dashboard
                </Link>
              )}
              <button
                onClick={() => goToReview(historyId)}
                className="text-slate-400 text-sm font-bold hover:text-slate-600 py-2"
              >
                Review Jawaban
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // VIEW 2: GAMEPLAY
  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const remainingTime =
    timeLimit > 0 ? Math.max(0, timeLimit - elapsedTime) : 0;
  const isUrgent = timeLimit > 0 && remainingTime < 30;

  // Cek apakah user sudah menjawab (untuk enable tombol Next)
  const currentAnswer = answers[currentQ.ID];
  let isAnswered = false;
  if (Array.isArray(currentAnswer)) {
    isAnswered = currentAnswer.length > 0;
  } else {
    isAnswered =
      typeof currentAnswer === "string" && currentAnswer.trim().length > 0;
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 pt-6 pb-10 transition-colors duration-500 
        ${isUrgent ? "bg-red-50" : "bg-slate-50"}`}
    >
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition"
          >
            <XCircle size={20} />
          </button>
          <div>
            <h2 className="font-bold text-slate-700 text-sm leading-tight flex items-center gap-1">
              {isChallenge && <Swords size={14} className="text-orange-500" />}{" "}
              {quizTitle}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Soal {currentIndex + 1} / {questions.length}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs border shadow-sm transition-all duration-300
            ${
              isUrgent
                ? "bg-red-600 text-white border-red-600 animate-pulse scale-110"
                : isRealtime
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : "bg-white text-slate-600 border-slate-200"
            }
         `}
        >
          {isUrgent ? (
            <AlertTriangle size={14} />
          ) : isRealtime ? (
            <Zap size={14} />
          ) : (
            <Clock size={14} />
          )}
          <span className="tabular-nums">
            {timeLimit > 0 ? formatTime(remainingTime) : `${elapsedTime}s`}
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-8 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isUrgent ? "bg-red-500" : "bg-indigo-600"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Hint Area */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 text-yellow-800 flex gap-3 shadow-sm"
            >
              <Lightbulb
                size={20}
                className="shrink-0 mt-0.5 text-yellow-500"
              />
              <div>
                <p className="text-xs font-bold uppercase opacity-60 mb-1">
                  Bantuan
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  {currentQ.hint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.ID}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 mb-6"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                {currentQ.question}
              </h2>
              {currentQ.hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="p-2 rounded-full bg-slate-50 hover:bg-yellow-50 text-slate-400 hover:text-yellow-500 transition shrink-0"
                  title="Lihat Hint"
                >
                  <Lightbulb size={20} />
                </button>
              )}
            </div>

            {/* Label Jenis Soal */}
            <div className="mb-4">
              {currentQ.type === "short_answer" && (
                <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">
                  Isian Singkat
                </span>
              )}
              {currentQ.type === "boolean" && (
                <span className="text-[10px] uppercase font-bold text-purple-500 bg-purple-50 px-2 py-1 rounded">
                  Benar / Salah
                </span>
              )}
              {currentQ.type === "multi_select" && (
                <span className="text-[10px] uppercase font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">
                  Pilih Banyak
                </span>
              )}
            </div>

            {/* PANGGIL RENDERER INPUT */}
            {renderAnswerInput(currentQ)}
          </motion.div>
        </AnimatePresence>

        {/* Area Progress Lawan (Realtime) */}
        {isRealtime && Object.keys(opponentsProgress).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Live Arena
            </h3>
            <div className="space-y-3">
              {Object.entries(opponentsProgress).map(([oppID, prog]) => {
                const playerInfo = playersMap[oppID];
                const displayName = playerInfo
                  ? playerInfo.name
                  : `Player ${oppID}`;
                const isFriend = isTeammate(oppID);
                const playerFinished = finishedPlayers[oppID];
                return (
                  <div key={oppID} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 capitalize ${
                        isFriend
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}
                    >
                      {displayName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            isFriend ? "text-blue-600" : "text-slate-500"
                          }`}
                        >
                          {displayName} {isFriend && "(Rekan)"}
                        </span>
                      </div>
                      {playerFinished ? (
                        <div className="h-5 bg-green-100 text-green-700 text-[10px] font-bold px-2 rounded-md flex items-center gap-1 w-fit border border-green-200">
                          <Flag size={10} fill="currentColor" /> SELESAI (
                          {playerFinished.score} Poin)
                        </div>
                      ) : (
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          <motion.div
                            className={`h-full shadow-sm ${
                              isFriend
                                ? "bg-blue-500"
                                : "bg-gradient-to-r from-orange-400 to-red-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${prog}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tombol Navigasi */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 transition"
          >
            Sebelumnya
          </button>
          <button
            onClick={handleNext}
            disabled={!isAnswered || submitting}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Memproses...
              </>
            ) : currentIndex === questions.length - 1 ? (
              <>
                Selesai <CheckCircle2 size={18} />
              </>
            ) : (
              <>
                Lanjut <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        newLevel={newLevelData}
      />
    </div>
  );
};

export default QuizPlay;
