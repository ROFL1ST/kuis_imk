import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI, quizAPI } from "../../services/api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Lightbulb,
  XCircle,
  Clock,
  Trophy,
  Home,
  RefreshCcw,
  ListChecks,
  Swords,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import LevelUpModal from "../../components/ui/LevelUpModal";

const QuizPlay = () => {
  const { quizId } = useParams();
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tangkap Data dari Link
  const quizTitle = location.state?.title || "Kuis";
  const isChallenge = location.state?.isChallenge || false;

  // State Data
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // State UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // State Result
  const [isFinished, setIsFinished] = useState(false);
  const [resultData, setResultData] = useState(null);

  // Timer
  const startTime = useRef(Date.now());
  const [duration, setDuration] = useState(0);

  // level
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelData, setNewLevelData] = useState(0);

  useEffect(() => {
    quizAPI
      .getQuestions(quizId)
      .then((res) => {
        setQuestions(res.data.data);
        startTime.current = Date.now(); // Mulai timer
      })
      .catch(() => {
        toast.error("Gagal memuat soal.");
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [quizId, navigate]);

  const handleOptionClick = (option) => {
    const currentQId = questions[currentIndex].ID;
    setAnswers({ ...answers, [currentQId]: option });
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowHint(false);
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowHint(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    // 1. Hitung Durasi & Skor Lokal
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime.current) / 1000);

    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.ID] === q.correct) correctCount++;
    });
    const finalScore = Math.round((correctCount / questions.length) * 100);

    // LOGIC: Jika dari challenge, tambahkan prefix "[DUEL]"
    const submissionTitle = isChallenge ? `[DUEL] ${quizTitle}` : quizTitle;

    const payload = {
      quiz_id: parseInt(quizId),
      quiz_title: submissionTitle,
      score: finalScore,
      total_soal: questions.length,
      snapshot: answers,
    };

    try {
      const currentLevel = user?.level || 1;
      await quizAPI.submitScore(payload);

      const userRes = await authAPI.authMe();
      const updatedUser = userRes.data.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (updatedUser.level > currentLevel) {
        setNewLevelData(updatedUser.level);
        setTimeout(() => setShowLevelUp(true), 500);
      } else {
        toast.success("Kuis selesai! XP bertambah.");
      }

      // toast.success("Kuis selesai!");

      setDuration(timeTaken);
      setResultData({
        score: finalScore,
        correct: correctCount,
        wrong: questions.length - correctCount,
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

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-medium text-slate-500">
        Memuat Soal...
      </div>
    );
  if (questions.length === 0)
    return <div className="text-center mt-20 text-slate-500">Soal kosong.</div>;

  // ============================================================
  // TAMPILAN 1: REVIEW HASIL
  // ============================================================
  if (isFinished && resultData) {
    const isPass = resultData.score >= 70;

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-white rounded-3xl shadow-lg border-2 overflow-hidden mb-8 text-center p-8 relative
              ${isPass ? "border-green-100" : "border-red-100"}
            `}
          >
            <div
              className={`absolute top-0 left-0 w-full h-2 ${
                isPass ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>

            <h2 className="text-slate-500 font-medium uppercase tracking-widest mb-4">
              Hasil Kuis
            </h2>

            <div className="flex justify-center items-center mb-6">
              <div
                className={`relative w-40 h-40 rounded-full flex items-center justify-center border-[6px] 
                ${
                  isPass
                    ? "border-green-100 bg-green-50 text-green-600"
                    : "border-red-100 bg-red-50 text-red-500"
                }
              `}
              >
                <div className="text-center">
                  <span className="block text-5xl font-black">
                    {resultData.score}
                  </span>
                  <span className="text-sm font-bold opacity-70">POIN</span>
                </div>
                {isPass && (
                  <Trophy
                    className="absolute -top-2 -right-2 text-yellow-400 fill-current drop-shadow-md"
                    size={48}
                  />
                )}
              </div>
            </div>

            <h1
              className={`text-2xl font-bold mb-2 ${
                isPass ? "text-green-700" : "text-red-600"
              }`}
            >
              {isPass ? "Luar Biasa!" : "Jangan Menyerah!"}
            </h1>

            <div className="grid grid-cols-3 gap-4 border-t pt-6 mt-6">
              <div className="text-center">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                  Waktu
                </p>
                <p className="font-bold text-slate-700 flex justify-center items-center gap-1">
                  <Clock size={16} /> {formatTime(duration)}
                </p>
              </div>
              <div className="text-center border-l border-r border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                  Benar
                </p>
                <p className="font-bold text-green-600 flex justify-center items-center gap-1">
                  <CheckCircle2 size={16} /> {resultData.correct}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                  Salah
                </p>
                <p className="font-bold text-red-500 flex justify-center items-center gap-1">
                  <XCircle size={16} /> {resultData.wrong}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ListChecks className="text-indigo-600" /> Review Jawaban
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const myAnswer = answers[q.ID];
                const isCorrect = myAnswer === q.correct;

                return (
                  <div
                    key={q.ID}
                    className={`bg-white p-5 rounded-xl border-l-4 shadow-sm ${
                      isCorrect ? "border-l-green-500" : "border-l-red-500"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 
                        ${
                          isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 mb-3">
                          {q.question}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              isCorrect
                                ? "bg-green-50 text-green-800"
                                : "bg-red-50 text-red-800"
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                            <span className="font-semibold">
                              Jawabanmu: {myAnswer || "-"}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 text-slate-600">
                              <CheckCircle2
                                size={16}
                                className="text-green-600"
                              />
                              <span>
                                Kunci:{" "}
                                <span className="font-semibold text-slate-800">
                                  {q.correct}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center pb-8">
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              <Home size={20} /> Dashboard
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md transition"
            >
              <RefreshCcw size={20} /> Lihat Riwayat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // TAMPILAN 2: GAMEPLAY
  // ============================================================
  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6 text-slate-600 font-medium">
          <span className="flex items-center gap-2">
            {isChallenge && <Swords className="text-orange-500" size={20} />}
            {isChallenge ? "DUEL MODE" : quizTitle}
          </span>
          <span>
            Soal {currentIndex + 1} dari {questions.length}
          </span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
          <motion.div
            className="bg-indigo-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {currentQ.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-amber-600 font-semibold mb-4 hover:underline"
          >
            <Lightbulb size={20} />
            {showHint ? "Tutup Hint" : "Lihat Hint"}
          </button>
        )}

        {showHint && (
          <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-xl mb-4 text-yellow-700">
            💡 <span className="font-medium">{currentQ.hint}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.ID}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {currentQ.question}
            </h2>

            <div className="grid gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.ID] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
                      ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold"
                          : "border-slate-100 hover:border-indigo-200 bg-slate-50"
                      }`}
                  >
                    {opt}
                    {isSelected && (
                      <CheckCircle2 size={20} className="text-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-xl border font-semibold bg-white hover:bg-slate-100 disabled:opacity-40"
          >
            Sebelumnya
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[currentQ.ID] || submitting}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting
              ? "Menghitung..."
              : currentIndex === questions.length - 1
              ? "Selesai"
              : "Lanjut"}
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
