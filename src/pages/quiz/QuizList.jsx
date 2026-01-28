import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  PlayCircle,
  Trophy,
  ArrowLeft,
  Swords,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  UserPlus,
  Coins, // Icon baru untuk 2v2
} from "lucide-react";
import { topicAPI, socialAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import CreateChallengeModal from "../../components/ui/CreateChallengeModal"; // Import New Modal
import { useLanguage } from "../../context/LanguageContext";

const QuizList = () => {
  const { t } = useLanguage();
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State & Settings
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdaptiveModalOpen, setIsAdaptiveModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState("");

  const [selectedAdaptiveQuiz, setSelectedAdaptiveQuiz] = useState(null);

  useEffect(() => {
    Promise.all([topicAPI.getQuizzesBySlug(slug), socialAPI.getFriends()])
      .then(([quizRes, friendRes]) => {
        setQuizzes(quizRes.data.data || []);
        setFriends(friendRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const openChallengeModal = (quizId, quizTitle) => {
    setSelectedQuizId(quizId);
    setSelectedQuizTitle(quizTitle);
    setIsModalOpen(true);
  };

  useEffect(() => {
    document.title = `Kuis di ${slug} | QuizApp`;
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Bar Skeleton */}
        <Skeleton className="h-12 w-full mb-8 rounded-xl" />

        {/* List Quiz */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4"
            >
              <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="w-24 h-10 rounded-lg hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft size={18} /> {t("quizList.backToTopic")}
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 capitalize">
            {t("quiz.question")}: {slug}
          </h1>
          <p className="text-slate-500">{t("quizList.chooseQuiz")}</p>
        </div>
        <Link
          to={`/leaderboard/${slug}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-100 text-yellow-700 rounded-full font-bold hover:bg-yellow-200 transition"
        >
          <Trophy size={18} /> {t("quizList.leaderboard")}
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-slate-500">{t("quizList.empty")}</p>
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

              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => openChallengeModal(quiz.ID, quiz.title)}
                  className="px-3 sm:px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold hover:bg-orange-200 flex items-center justify-center gap-1.5 transition text-sm sm:text-base order-1"
                >
                  <Swords size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="truncate">{t("quizList.challenge")}</span>
                </button>
                <Link
                  to={`/play/${quiz.ID}`}
                  state={{ title: quiz.title }}
                  className="px-3 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-1.5 transition text-sm sm:text-base order-2"
                >
                  <PlayCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                  {t("quizList.play")}
                </Link>
                
              </div>
            </div>
          ))}
        </div>
      )}

      
      {/* === MODAL BUAT TANTANGAN === */}
      <CreateChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedTopicId={selectedQuizId} // Using QuizID as TopicID placeholder as per previous logic, or if mapped correctly.
        // Note: CreateChallengeModal expects Topic ID. QuizList has Quiz ID.
        // My previous thought in CreateChallengeModal was "Topic -> First Quiz".
        // Here we have specific Quiz.
        // CreateChallengeModal needs to handle "Quiz ID" directly if we want specific quiz.
        // I updated CreateChallengeModal to use `preselectedTopicId` to set `selectedTopic`.
        // If I pass QuizID here, CreateChallengeModal treats it as TopicID in my previous code?
        // Let's check CreateChallengeModal logic again.
        // "setSelectedTopic({ id: preselectedTopicId, title: ... })"
        // And submit payload uses "quiz_id: selectedTopic?.id".
        // So yes, passing QuizID as preselectedTopicId works for the payload.
        preselectedQuizTitle={selectedQuizTitle}
      />
    </div>
  );
};

export default QuizList;
