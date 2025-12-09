import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { quizAPI } from "../../services/api";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, Lightbulb } from "lucide-react"; // ← ICON HINT
import { motion } from "framer-motion";

const QuizPlay = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const quizTitle = location.state?.title || "Kuis";

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // NEW: control hint
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    quizAPI.getQuestions(quizId)
      .then((res) => {
        setQuestions(res.data.data);
      })
      .catch(() => {
        toast.error("Gagal memuat soal. Coba lagi.");
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
      setShowHint(false);  // reset hint tiap ganti soal
    } else {
      await handleSubmit();
    }
  };

  // NEW: tombol previous
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowHint(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.ID] === q.correct) correctCount++;
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);

    const payload = {
      quiz_id: parseInt(quizId),
      quiz_title: quizTitle,
      score: finalScore,
      total_soal: questions.length,
      snapshot: answers,
    };

    try {
      await quizAPI.submitScore(payload);
      toast.success(`Selesai! Skor kamu: ${finalScore}`);
      navigate("/history");
    } catch (err) {
      console.log(err);
      toast.error("Gagal menyimpan skor.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Memuat Soal...</div>;
  if (questions.length === 0) return <div className="text-center mt-20">Soal kosong.</div>;

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 text-slate-600 font-medium">
          <span>{quizTitle}</span>
          <span>Soal {currentIndex + 1} dari {questions.length}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
          <motion.div 
            className="bg-indigo-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* HINT BUTTON */}
        {currentQ.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-amber-600 font-semibold mb-4 hover:underline"
          >
            <Lightbulb size={20} />
            {showHint ? "Tutup Hint" : "Lihat Hint"}
          </button>
        )}

        {/* HINT BOX */}
        {showHint && (
          <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-xl mb-4 text-yellow-700">
            💡 <span className="font-medium">{currentQ.hint}</span>
          </div>
        )}

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.ID}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{currentQ.question}</h2>

            <div className="grid gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.ID] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
                      ${isSelected 
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold" 
                        : "border-slate-100 hover:border-indigo-200 bg-slate-50"
                      }`}
                  >
                    {opt}
                    {isSelected && <CheckCircle2 size={20} className="text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Buttons */}
        <div className="mt-8 flex justify-between">

          {/* Previous */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-xl border font-semibold bg-white hover:bg-slate-100 disabled:opacity-40"
          >
            Sebelumnya
          </button>

          {/* Next / Submit */}
          <button
            onClick={handleNext}
            disabled={!answers[currentQ.ID] || submitting}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting
              ? "Menyimpan..."
              : currentIndex === questions.length - 1
                ? "Selesai"
                : "Lanjut"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default QuizPlay;
