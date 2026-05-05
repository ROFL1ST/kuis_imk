// src/pages/quiz/QuizList.jsx

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  PlayCircle,
  Trophy,
  ArrowLeft,
  Swords,
  BookOpen,
  Layers,
} from "lucide-react";
import { topicAPI, socialAPI } from "../../services/api";
import toast from "react-hot-toast";
import Skeleton from "../../components/ui/Skeleton";
import CreateChallengeModal from "../../components/ui/CreateChallengeModal";
import { useLanguage } from "../../context/LanguageContext";

const QuizList = () => {
  const { t } = useLanguage();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState("");

  useEffect(() => {
    Promise.all([topicAPI.getQuizzesBySlug(slug), socialAPI.getFriends()])
      .then(([quizRes]) => {
        setQuizzes(quizRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    document.title = `Kuis di ${slug} | QuizApp`;
  }, [slug]);

  const openChallengeModal = (quizId, quizTitle) => {
    setSelectedQuizId(quizId);
    setSelectedQuizTitle(quizTitle);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8 rounded-xl" style={{ background: "var(--color-surface-800)" }} />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border flex items-center gap-4"
              style={{
                background: "var(--color-surface-900)",
                borderColor: "var(--color-surface-800)",
              }}
            >
              <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" style={{ background: "var(--color-surface-800)" }} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" style={{ background: "var(--color-surface-800)" }} />
                <Skeleton className="h-3 w-2/3" style={{ background: "var(--color-surface-800)" }} />
              </div>
              <Skeleton className="w-24 h-9 rounded-xl hidden sm:block" style={{ background: "var(--color-surface-800)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 mb-6 text-sm font-bold transition-colors group"
        style={{ color: "var(--color-surface-500)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-surface-200)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-surface-500)")}
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        {t("quizList.backToTopic")}
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers size={14} style={{ color: "var(--color-surface-500)" }} />
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--color-surface-500)" }}>
              Topik
            </span>
          </div>
          <h1
            className="text-3xl font-black tracking-tight capitalize"
            style={{ color: "var(--color-surface-50)" }}
          >
            {slug}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-surface-500)" }}>
            {t("quizList.chooseQuiz")}
          </p>
        </div>

        <Link
          to={`/leaderboard/${slug}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all border shrink-0"
          style={{
            background: "rgb(234 179 8 / 0.12)",
            borderColor: "rgb(234 179 8 / 0.25)",
            color: "#fbbf24",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgb(234 179 8 / 0.20)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgb(234 179 8 / 0.12)"; }}
        >
          <Trophy size={16} fill="#fbbf24" />
          {t("quizList.leaderboard")}
        </Link>
      </div>

      {/* Count badge */}
      {quizzes.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-[11px] font-black px-3 py-1 rounded-full border uppercase tracking-wider"
            style={{
              background: "var(--color-surface-800)",
              borderColor: "var(--color-surface-700)",
              color: "var(--color-surface-400)",
            }}
          >
            {quizzes.length} Kuis Tersedia
          </span>
        </div>
      )}

      {/* Empty state */}
      {quizzes.length === 0 ? (
        <div
          className="text-center py-24 rounded-2xl border"
          style={{
            background: "var(--color-surface-900)",
            borderColor: "var(--color-surface-800)",
          }}
        >
          <BookOpen size={40} className="mx-auto mb-3" style={{ color: "var(--color-surface-700)" }} />
          <p className="font-bold" style={{ color: "var(--color-surface-500)" }}>
            {t("quizList.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz, key) => (
            <ItemQuiz
              key={key}
              quiz={quiz}
              t={t}
              openChallengeModal={openChallengeModal}
            />
          ))}
        </div>
      )}

      <CreateChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedTopicId={selectedQuizId}
        preselectedQuizTitle={selectedQuizTitle}
      />
    </div>
  );
};

const ItemQuiz = ({ quiz, openChallengeModal, t }) => {
  return (
    <div
      className="p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all group"
      style={{
        background: "var(--color-surface-900)",
        borderColor: "var(--color-surface-800)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-surface-700)";
        e.currentTarget.style.background = "var(--color-surface-850, var(--color-surface-800))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-surface-800)";
        e.currentTarget.style.background = "var(--color-surface-900)";
      }}
    >
      {/* Left: icon + info */}
      <div className="flex items-center gap-4">
        {/* Icon box */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, rgb(99 102 241 / 0.15), rgb(99 102 241 / 0.05))",
            border: "1px solid rgb(99 102 241 / 0.20)",
          }}
        >
          <BookOpen size={20} style={{ color: "#818cf8" }} />
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="text-base font-black"
              style={{ color: "var(--color-surface-50)" }}
            >
              {quiz.title}
            </h3>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full border"
              style={{
                background: "var(--color-surface-800)",
                borderColor: "var(--color-surface-700)",
                color: "var(--color-surface-400)",
              }}
            >
              {quiz.questions?.length || "?"} {t("classroom.questions")}
            </span>
          </div>
          {quiz.description && (
            <p
              className="text-sm mt-0.5 line-clamp-1"
              style={{ color: "var(--color-surface-500)" }}
            >
              {quiz.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex gap-2 w-full sm:w-auto shrink-0">
        <button
          onClick={() => openChallengeModal(quiz.ID, quiz.title)}
          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border text-sm"
          style={{
            background: "rgb(249 115 22 / 0.10)",
            borderColor: "rgb(249 115 22 / 0.25)",
            color: "#fb923c",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgb(249 115 22 / 0.18)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgb(249 115 22 / 0.10)"; }}
        >
          <Swords size={15} />
          {t("quizList.challenge")}
        </button>

        <Link
          to={`/play/${quiz.ID}`}
          state={{ title: quiz.title }}
          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all text-sm border-none"
          style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            color: "#fff",
            boxShadow: "0 4px 16px rgb(99 102 241 / 0.25)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 24px rgb(99 102 241 / 0.40)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgb(99 102 241 / 0.25)"; }}
        >
          <PlayCircle size={16} />
          {t("quizList.play")}
        </Link>
      </div>
    </div>
  );
};

export default QuizList;
