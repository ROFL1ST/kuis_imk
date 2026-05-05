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
  Flame,
  Skull,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import LevelUpModal from "../../components/ui/LevelUpModal";
import StreakSuccessModal from "../../components/ui/StreakSuccessModal";
import ReportModal from "../../components/ui/ReportModal";
import ReviewModal from "../../components/ui/ReviewModal";
import { getToken } from "../../services/auth";
import { EventSourcePolyfill } from "event-source-polyfill";
import { survivalAPI } from "../../services/newFeatures";
import { useLanguage } from "../../context/LanguageContext";
import { aiService } from "../../services/aiService";
import { detectLanguage } from "../../utils/languageDetector";
import { Languages, RotateCcw, Sparkles } from "lucide-react";

const shuffleArray = (array) => {
  if (!array || array.length === 0) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const QuizPlay = ({ isRemedial: propIsRemedial = false }) => {
  const { quizId } = useParams();
  const { t } = useLanguage();
  const isRemedial = propIsRemedial || quizId === "remedial";

  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const assignmentId = location.state?.assignmentId || null;
  const classroomId = location.state?.classroomId || null;
  const classroomName = location.state?.classroomName || null;

  const originalTitle = location.state?.title || "Kuis";
  const quizTitle = isRemedial
    ? t("quiz.remedial")
    : classroomName
      ? `${originalTitle} (${t("quiz.class")}: ${classroomName})`
      : originalTitle;

  const isChallenge = location.state?.isChallenge || false;
  const isRealtime = location.state?.isRealtime || false;
  const timeLimit = location.state?.timeLimit || 0;
  const challengeID = location.state?.challengeID || null;
  const seed = location.state?.seed || "";
  const mode =
    location.state?.mode ||
    (location.pathname.includes("survival") ? "survival" : "classic");

  const isAdaptive =
    location.state?.isAdaptive !== undefined
      ? location.state.isAdaptive
      : !isRemedial && mode !== "survival" && !isChallenge && !isRealtime;
  const [targetDifficulty, setTargetDifficulty] = useState(0.5);
  const [predictionMsg, setPredictionMsg] = useState("");

  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiFeedbackModal, setAiFeedbackModal] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef(null);

  const [isFinished, setIsFinished] = useState(false);
  const [resultData, setResultData] = useState(null);
  const startTime = useRef(Date.now());
  const [duration, setDuration] = useState(0);
  const [historyId, setHistoryId] = useState(null);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelData, setNewLevelData] = useState(0);

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakModalData, setStreakModalData] = useState({ count: 0, type: "extended" });

  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [opponentsProgress, setOpponentsProgress] = useState({});
  const [playersMap, setPlayersMap] = useState({});
  const [finishedPlayers, setFinishedPlayers] = useState({});

  const [translation, setTranslation] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  const [bulkTranslations, setBulkTranslations] = useState({});
  const [isBulkTranslating, setIsBulkTranslating] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [isRated, setIsRated] = useState(false);

  const { language } = useLanguage();

  useEffect(() => {
    setTranslation(null);
    if (questions[currentIndex] && bulkTranslations[questions[currentIndex].ID]) {
      setShowTranslated(true);
    } else {
      setShowTranslated(false);
    }
  }, [currentIndex, questions, bulkTranslations]);

  const isContentSameLanguage = (text, targetLang) => {
    const detected = detectLanguage(text);
    if (detected === targetLang) return true;
    return false;
  };

  const shouldHideTranslate = false;

  const handleTranslate = async () => {
    if (translation || (questions[currentIndex] && bulkTranslations[questions[currentIndex].ID])) {
      setShowTranslated(!showTranslated);
      return;
    }
    setIsTranslating(true);
    try {
      const currentQ = questions[currentIndex];
      const payload = {
        q: currentQ.question,
        h: currentQ.hint || "",
        o: currentQ.options
          ? currentQ.options.map((opt) => {
              if (typeof opt === "string") return opt;
              return (opt.option_text || opt.text || opt.label || JSON.stringify(opt));
            })
          : [],
      };
      const textToTranslate = payload.o.length > 0 ? JSON.stringify(payload) : currentQ.question;
      const res = await aiService.translate(textToTranslate, language);
      if (res.status === "success") {
        let result = res.data.translatedText;
        if (payload.o.length > 0) {
          try {
            const cleanJson = result.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            setTranslation({ question: parsed.q || currentQ.question, hint: parsed.h || currentQ.hint, options: parsed.o || [] });
          } catch (e) {
            setTranslation({ question: result, options: [] });
          }
        } else {
          setTranslation({ question: result, options: [] });
        }
        setShowTranslated(true);
      }
    } catch (err) {
      toast.error(t("modals.aiError"));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleBulkTranslate = async () => {
    setIsBulkTranslating(true);
    const toastId = toast.loading(t("quiz.translating"));
    try {
      const itemsToTranslate = questions.map((q) => ({ id: q.ID, text: q.question, hint: q.hint || "", options: q.options || [] }));
      const res = await aiService.translateBulk(itemsToTranslate, language);
      if (res.status === "success" && res.data.translatedData) {
        let parsedData = [];
        try { parsedData = JSON.parse(res.data.translatedData); } catch (e) { throw new Error("Invalid AI Response"); }
        const newTranslations = {};
        parsedData.forEach((item) => { newTranslations[item.id] = { question: item.text, hint: item.hint, options: item.options }; });
        setBulkTranslations(newTranslations);
        toast.success(t("quiz.translateSuccess"), { id: toastId });
        setShowTranslated(true);
      }
    } catch (err) {
      toast.error(t("modals.aiError"), { id: toastId });
    } finally {
      setIsBulkTranslating(false);
    }
  };

  // --- SSE Realtime ---
  useEffect(() => {
    if (!isRealtime || !challengeID) return;
    const token = getToken();
    const eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_API_URL}/challenges/${challengeID}/lobby-stream`,
      { headers: { "X-API-KEY": import.meta.env.VITE_API_KEY }, withCredentials: true, heartbeatTimeout: 120000 }
    );
    eventSource.onmessage = (event) => { if (event.data === ":keepalive") return; };
    eventSource.addEventListener("player_update", (e) => {
      try {
        const data = JSON.parse(e.data);
        const map = {};
        if (data.players) data.players.forEach((p) => { map[p.user_id] = { name: p.name, team: p.team || "solo" }; });
        setPlayersMap(map);
      } catch (err) {}
    });
    eventSource.addEventListener("opponent_progress", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.user_id !== user.ID) setOpponentsProgress((prev) => ({ ...prev, [data.user_id]: data.progress }));
      } catch (err) {}
    });
    eventSource.addEventListener("player_finished", (e) => {
      try {
        const data = JSON.parse(e.data);
        setFinishedPlayers((prev) => ({ ...prev, [data.user_id]: { score: data.score, username: data.username } }));
        if (data.user_id !== user.ID) {
          setOpponentsProgress((prev) => ({ ...prev, [data.user_id]: 100 }));
          toast.success(`${data.username} telah selesai!`, { icon: "🏁" });
        }
      } catch (err) {}
    });
    return () => eventSource.close();
  }, [isRealtime, challengeID, user.ID]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- Fetch Questions ---
  useEffect(() => {
    let fetchAction;
    if (mode === "survival") {
      setLoading(true);
      survivalAPI.startSurvival(seed)
        .then((res) => {
          if (res.data.status === "success" || res.data.success) {
            const wrapper = res.data.data;
            const q = wrapper.question || wrapper;
            let options = q.options;
            try { options = typeof q.options === "string" ? JSON.parse(q.options) : q.options; } catch (e) { options = ["Yes", "No"]; }
            if (q.type === "mcq" || q.type === "multi_select") options = shuffleArray(options);
            setQuestions([{ ...q, options }]);
            startTime.current = Date.now();
            timerIntervalRef.current = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
          }
        })
        .catch(() => { toast.error(t("quiz.errorLoading")); navigate("/dashboard"); })
        .finally(() => setLoading(false));
      return () => clearInterval(timerIntervalRef.current);
    } else if (isAdaptive) {
      setLoading(true);
      const payload = { quiz_id: parseInt(quizId), answers: [] };
      quizAPI.getQuestions(quizId).then((res) => setTotalQuestions(res.data?.data?.length || 0)).catch(console.error);
      quizAPI.getNextAdaptiveQuestion(payload)
        .then((res) => {
          if (res.data.data) {
            const { question, target_difficulty, prediction_msg } = res.data.data;
            setTargetDifficulty(target_difficulty);
            setPredictionMsg(prediction_msg);
            let options = question.options;
            if (question.type === "mcq" || question.type === "multi_select") options = shuffleArray(options);
            setQuestions([{ ...question, options }]);
            startTime.current = Date.now();
            timerIntervalRef.current = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
          } else {
            setIsFinished(true);
          }
        })
        .catch(() => { toast.error(t("quiz.errorLoading")); navigate("/dashboard"); })
        .finally(() => setLoading(false));
      return () => clearInterval(timerIntervalRef.current);
    } else {
      fetchAction = isRemedial ? quizAPI.getRemedial() : quizAPI.getQuestions(quizId);
      fetchAction
        .then((res) => {
          const rawQuestions = res.data.data || [];
          const processedQuestions = rawQuestions.map((q) => {
            const type = q.type || "mcq";
            let options = q.options;
            if (type === "mcq" || type === "multi_select") options = shuffleArray(q.options);
            return { ...q, type, options };
          });
          setQuestions(processedQuestions);
          setTotalQuestions(processedQuestions.length);
          startTime.current = Date.now();
          timerIntervalRef.current = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
        })
        .catch(() => { toast.error(t("quiz.errorLoading")); navigate("/dashboard"); })
        .finally(() => setLoading(false));
      return () => clearInterval(timerIntervalRef.current);
    }
  }, [quizId, navigate, mode, seed, isRemedial]);

  useEffect(() => {
    if (timeLimit > 0 && !isFinished && !submitting) {
      if (elapsedTime >= timeLimit) {
        clearInterval(timerIntervalRef.current);
        toast.error(`${t("quiz.timeUp")} ${t("quiz.sending")}`);
        handleSubmit();
      }
    }
  }, [elapsedTime, timeLimit, isFinished, submitting]);

  const handleOptionClick = (option) => {
    const currentQId = questions[currentIndex].ID;
    setAnswers({ ...answers, [currentQId]: option });
  };

  const handleTextChange = (e) => {
    const currentQId = questions[currentIndex].ID;
    setAnswers({ ...answers, [currentQId]: e.target.value });
  };

  const handleMultiSelectClick = (option) => {
    const currentQId = questions[currentIndex].ID;
    const currentSelected = Array.isArray(answers[currentQId]) ? answers[currentQId] : [];
    const newSelected = currentSelected.includes(option)
      ? currentSelected.filter((item) => item !== option)
      : [...currentSelected, option];
    setAnswers({ ...answers, [currentQId]: newSelected });
  };

  const handleSurvivalAnswer = async (answerValue) => {
    setSubmitting(true);
    try {
      const currentQ = questions[currentIndex];
      const currentStreak = questions.length - 1;
      const res = await survivalAPI.answerSurvival({ question_id: currentQ.ID, answer: answerValue, streak: currentStreak, seed });
      if (res.data.status === "success") {
        const data = res.data.data;
        if (res.data.message === "Correct!" || data.next_question) {
          toast.success(`${t("quiz.correct")} ${t("challenge.streak")}: ${data.new_streak}`, { icon: "🔥" });
          const q = data.next_question;
          let options = q.options;
          try { options = typeof q.options === "string" ? JSON.parse(q.options) : q.options; } catch (e) { options = ["Yes", "No"]; }
          if (q.type === "mcq" || q.type === "multi_select") options = shuffleArray(options);
          setQuestions((prev) => [...prev, { ...q, options }]);
          setCurrentIndex((prev) => prev + 1);
          if (isRealtime && challengeID) await socialAPI.postProgress(challengeID, { current_index: data.new_streak, total_soal: 999 });
        } else {
          toast.error(`${t("quiz.wrong")} ${t("quiz.gameOver")}`);
          const finalStreak = data.final_streak || currentStreak;
          const score = finalStreak;
          if (isChallenge) {
            const processedSnapshot = {};
            Object.keys(answers).forEach((key) => { const ans = answers[key]; processedSnapshot[key] = Array.isArray(ans) ? JSON.stringify(ans) : ans; });
            const timeTaken = Math.min(Math.floor((Date.now() - startTime.current) / 1000), timeLimit > 0 ? timeLimit : Infinity);
            const resHistory = await quizAPI.submitScore({ quiz_id: 0, quiz_title: "Survival Challenge", score, total_soal: finalStreak, snapshot: processedSnapshot, time_taken: timeTaken, challenge_id: challengeID, mode: "survival" });
            if (resHistory.data.status === "success") { toast.success(t("quiz.saved")); setHistoryId(resHistory.data.data.ID); }
          }
          setResultData({ score, correct: finalStreak, wrong: 1, total: finalStreak + 1 });
          setIsFinished(true);
          setDuration(elapsedTime);
        }
      }
    } catch (err) {
      toast.error(t("quiz.failedSub"));
    } finally {
      setSubmitting(false);
    }
  };

  const sendProgress = async (index) => {
    if (isRealtime && challengeID) {
      try { await socialAPI.postProgress(challengeID, { current_index: index, total_soal: questions.length }); } catch (err) {}
    }
  };

  const handleNext = async () => {
    if (mode === "survival") {
      const currentQ = questions[currentIndex];
      const ans = answers[currentQ.ID];
      if (!ans) { toast.error(t("quiz.selectAnswer")); return; }
      await handleSurvivalAnswer(ans);
    } else if (isAdaptive) {
      if (currentIndex < questions.length - 1) setQuestions((prev) => prev.slice(0, currentIndex + 1));
      const currentQ = questions[currentIndex];
      const currentAnswersPayload = questions.map((q) => {
        const ansVal = answers[q.ID];
        return { question_id: q.ID, user_answer: Array.isArray(ansVal) ? JSON.stringify(ansVal) : (ansVal || "") };
      });
      if (!answers[currentQ.ID]) { toast.error(t("quiz.selectAnswer")); return; }
      setSubmitting(true);
      let res = null;
      try {
        res = await quizAPI.getNextAdaptiveQuestion({ quiz_id: parseInt(quizId), answers: currentAnswersPayload, type: currentQ.type });
        if (!res.data.data || res.data.message === "Quiz Completed") {
          await handleSubmit();
          setSubmitting(false);
        } else {
          const { question, target_difficulty, prediction_msg, last_is_correct, last_essay_score, last_essay_feedback } = res.data.data;
          let options = question.options;
          if (question.type === "mcq" || question.type === "multi_select") options = shuffleArray(options);
          const processedQ = { ...question, options };
          const isCorrect = last_is_correct === true;
          if (currentQ.type === "essay" && last_essay_score !== undefined && last_essay_score !== null) {
            setFeedbackData({ score: last_essay_score, text: last_essay_feedback });
            if (last_essay_score >= 90) { setFeedbackStatus("special"); confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); }
            else setFeedbackStatus(null);
          } else {
            setFeedbackStatus(isCorrect ? "correct" : "wrong");
            setFeedbackData(null);
          }
          setTargetDifficulty(target_difficulty);
          setPredictionMsg(prediction_msg);
          setTimeout(() => {
            setQuestions((prev) => [...prev, processedQ]);
            setCurrentIndex((prev) => prev + 1);
            setShowHint(false);
            setFeedbackStatus(null);
            setFeedbackData(null);
            setSubmitting(false);
          }, 2500);
        }
      } catch (e) {
        toast.error(t("quiz.errorLoading"));
        setSubmitting(false);
      }
    } else {
      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setShowHint(false);
        await sendProgress(nextIndex);
      } else {
        await handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (mode === "survival") return;
    if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); setShowHint(false); sendProgress(currentIndex - 1); }
  };

  const calculateLocalScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const userAns = answers[q.ID];
      const correctAns = q.correct;
      if (!userAns) return;
      if (q.type === "short_answer") {
        if (String(userAns).trim().toLowerCase() === String(correctAns).trim().toLowerCase()) correct++;
      } else if (q.type === "multi_select") {
        try {
          const keyArray = JSON.parse(correctAns || "[]");
          if (Array.isArray(userAns) && Array.isArray(keyArray) && userAns.length === keyArray.length) {
            if ([...userAns].sort().toString() === [...keyArray].sort().toString()) correct++;
          }
        } catch (e) {}
      } else {
        if (userAns === correctAns) correct++;
      }
    });
    return correct;
  };

  const handleSubmit = async () => {
    if (mode === "survival") {
      setResultData({ score: (questions.length - 1) * 10, correct: questions.length - 1, wrong: 1, total: questions.length });
      setIsFinished(true);
      return;
    }
    clearInterval(timerIntervalRef.current);
    setSubmitting(true);
    const endTime = Date.now();
    let timeTaken = Math.floor((endTime - startTime.current) / 1000);
    if (timeLimit > 0 && timeTaken > timeLimit) timeTaken = timeLimit;
    const localCorrectCount = calculateLocalScore();
    const localScore = Math.round((localCorrectCount / questions.length) * 100);
    const processedSnapshot = {};
    Object.keys(answers).forEach((key) => { const ans = answers[key]; processedSnapshot[key] = Array.isArray(ans) ? JSON.stringify(ans) : ans; });
    const payload = {
      quiz_id: parseInt(quizId) || 0,
      quiz_title: isChallenge ? `[DUEL] ${quizTitle}` : quizTitle,
      score: localScore,
      total_soal: questions.length,
      snapshot: processedSnapshot,
      time_taken: timeTaken,
      challenge_id: challengeID ? parseInt(challengeID) : 0,
      question_ids: questions.map((q) => q.ID),
      assignment_id: assignmentId ? parseInt(assignmentId) : null,
      classroom_id: classroomId ? parseInt(classroomId) : null,
    };
    try {
      const currentLevel = user?.level || 1;
      const currentStreak = user?.streak_count || 0;
      const res = await quizAPI.submitScore(payload);
      const finalHistory = res.data.data;
      setHistoryId(finalHistory.ID);
      const backendScore = finalHistory.score;
      const officialCorrectCount = Math.round((backendScore / 100) * questions.length);
      if (backendScore >= 70) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      const userRes = await authAPI.authMe();
      const updatedUser = userRes.data.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updatedUser.streak_count > currentStreak) {
        setStreakModalData({ count: updatedUser.streak_count, type: currentStreak === 0 ? "recovered" : "extended" });
        setShowStreakModal(true);
      } else {
        toast.success(t("quiz.saved"));
      }
      if (updatedUser.level > currentLevel) {
        setNewLevelData(updatedUser.level);
        setTimeout(() => setShowLevelUp(true), 1000);
      }
      setDuration(timeTaken);
      setResultData({ score: backendScore, correct: officialCorrectCount, wrong: questions.length - officialCorrectCount, total: questions.length });
      setIsFinished(true);
    } catch (err) {
      toast.error(t("quiz.failedSub"));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { document.title = `Bermain: ${quizTitle} | QuizzApp Indo`; }, [quizTitle]);

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
    Object.keys(finishedPlayers).forEach((fid) => { if (parseInt(fid) !== user.ID) finishedOpponents++; });
    return totalOpponents > 0 && finishedOpponents >= totalOpponents;
  };

  const goToReview = (historyId) => navigate(`/history/review/${historyId}`);

  // ----------------------------------------------------------------
  // RENDERER INPUT
  // ----------------------------------------------------------------
  const inputBase = `
    w-full rounded-xl border-2 transition-all font-medium outline-none
    focus:ring-2 focus:ring-indigo-500/20
  `;

  const renderAnswerInput = (currentQ) => {
    const currentAnswer = answers[currentQ.ID];

    if (currentQ.type === "short_answer") {
      return (
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              value={currentAnswer || ""}
              onChange={handleTextChange}
              placeholder={t("quiz.placeholderShort") || "Ketik jawabanmu di sini..."}
              className="w-full p-4 pl-12 rounded-xl text-base font-medium outline-none transition-all"
              style={{
                background: "var(--color-surface-800)",
                border: "2px solid var(--color-surface-700)",
                color: "var(--color-surface-100)",
              }}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && currentAnswer?.trim() !== "") handleNext(); }}
            />
            <TypeIcon className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--color-surface-500)" }} />
          </div>
          <p className="text-xs mt-2 ml-1 flex items-center gap-1" style={{ color: "var(--color-surface-500)" }}>
            <CheckCircle2 size={11} /> {t("quiz.insensitive") || "Jawaban tidak sensitif huruf besar/kecil"}
          </p>
        </div>
      );
    }

    if (currentQ.type === "essay") {
      return (
        <div className="mt-4">
          <textarea
            value={currentAnswer || ""}
            onChange={handleTextChange}
            placeholder={t("quiz.placeholderEssay") || "Tulis jawaban esai anda di sini..."}
            className="w-full p-4 rounded-xl text-base font-medium outline-none transition-all min-h-[140px] resize-y"
            style={{
              background: "var(--color-surface-800)",
              border: "2px solid var(--color-surface-700)",
              color: "var(--color-surface-100)",
            }}
            autoFocus
          />
          <p className="text-xs mt-2 ml-1 flex items-center gap-1" style={{ color: "var(--color-surface-500)" }}>
            <TypeIcon size={11} /> {t("quiz.aiGraded") || "Jawaban akan dinilai otomatis oleh AI"}
          </p>
        </div>
      );
    }

    if (currentQ.type === "multi_select") {
      const currentSelected = Array.isArray(currentAnswer) ? currentAnswer : [];
      return (
        <div className="grid grid-cols-1 gap-2.5 mt-4">
          <p className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: "var(--color-surface-500)" }}>
            <CheckSquare size={14} /> {t("quiz.selectAllCorrect") || "Pilih semua jawaban yang benar:"}
          </p>
          {currentQ.options && currentQ.options.map((opt, idx) => {
            const isSelected = currentSelected.includes(opt);
            return (
              <button
                key={idx}
                onClick={() => handleMultiSelectClick(opt)}
                className="relative p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 text-left cursor-pointer"
                style={{
                  background: isSelected ? "rgb(99 102 241 / 0.15)" : "var(--color-surface-800)",
                  borderColor: isSelected ? "var(--color-brand-500)" : "var(--color-surface-700)",
                  color: isSelected ? "var(--color-brand-300)" : "var(--color-surface-300)",
                }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all shrink-0"
                  style={{
                    background: isSelected ? "var(--color-brand-500)" : "transparent",
                    borderColor: isSelected ? "var(--color-brand-500)" : "var(--color-surface-600)",
                    color: "#fff",
                  }}
                >
                  {isSelected && <CheckCircle2 size={13} />}
                </div>
                <span className="text-sm leading-snug font-medium">
                  {showTranslated && ((translation?.options?.[idx]) || (bulkTranslations[currentQ.ID]?.options?.[idx]))
                    ? translation?.options?.[idx] || bulkTranslations[currentQ.ID]?.options?.[idx]
                    : opt}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    const isBoolean = currentQ.type === "boolean";
    return (
      <div className={`grid gap-2.5 ${isBoolean ? "grid-cols-2 mt-4" : "grid-cols-1 mt-3"}`}>
        {currentQ.options && currentQ.options.map((opt, idx) => {
          const isSelected = currentAnswer === opt;
          const label = String.fromCharCode(65 + idx);
          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(opt)}
              className={`relative p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer ${
                isBoolean ? "justify-center text-center flex-col h-20 text-base font-bold" : "justify-between text-left"
              }`}
              style={{
                background: isSelected ? "rgb(99 102 241 / 0.15)" : "var(--color-surface-800)",
                borderColor: isSelected ? "var(--color-brand-500)" : "var(--color-surface-700)",
                color: isSelected ? "var(--color-brand-300)" : "var(--color-surface-300)",
                transform: isSelected ? "scale(1.01)" : "none",
              }}
            >
              <div className={`flex items-center gap-3 ${isBoolean ? "" : "flex-1"}`}>
                {!isBoolean && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-all shrink-0"
                    style={{
                      background: isSelected ? "var(--color-brand-500)" : "var(--color-surface-700)",
                      borderColor: isSelected ? "var(--color-brand-500)" : "var(--color-surface-600)",
                      color: isSelected ? "#fff" : "var(--color-surface-500)",
                    }}
                  >
                    {label}
                  </div>
                )}
                <span className="text-sm leading-snug font-medium">
                  {showTranslated && ((translation?.options?.[idx]) || (bulkTranslations[currentQ.ID]?.options?.[idx]))
                    ? translation?.options?.[idx] || bulkTranslations[currentQ.ID]?.options?.[idx]
                    : opt}
                </span>
              </div>
              {!isBoolean && isSelected && <CheckCircle2 size={18} style={{ color: "var(--color-brand-400)", flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
    );
  };

  // ----------------------------------------------------------------
  // LOADING / EMPTY STATES
  // ----------------------------------------------------------------
  if (loading)
    return (
      <div
        className="h-screen flex items-center justify-center gap-2 font-medium"
        style={{ background: "var(--color-surface-950)", color: "var(--color-surface-400)" }}
      >
        <Loader2 className="animate-spin" style={{ color: "var(--color-brand-400)" }} />
        {t("quiz.loading") || "Memuat Soal..."}
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="text-center mt-20" style={{ color: "var(--color-surface-500)" }}>
        {t("quiz.empty") || "Soal kosong."}
      </div>
    );

  // ----------------------------------------------------------------
  // VIEW 1: RESULT
  // ----------------------------------------------------------------
  if (isFinished && resultData) {
    const isSurvival = mode === "survival";
    const isPass = isSurvival ? resultData.correct > 0 : resultData.score >= 70;
    const allDone = checkAllFinished();

    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4"
        style={{ background: "var(--color-surface-950)" }}
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-[2rem] border overflow-hidden mb-6 text-center p-8 relative"
            style={{
              background: "var(--color-surface-900)",
              borderColor: isPass ? "rgb(34 197 94 / 0.25)" : "rgb(239 68 68 / 0.25)",
              boxShadow: isPass ? "0 0 48px rgb(34 197 94 / 0.10)" : "0 0 48px rgb(239 68 68 / 0.10)",
            }}
          >
            {isChallenge && (
              <div className="absolute top-4 left-0 w-full flex justify-center">
                <span
                  className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 border"
                  style={{ background: "rgb(249 115 22 / 0.15)", color: "#fb923c", borderColor: "rgb(249 115 22 / 0.25)" }}
                >
                  <Swords size={11} /> {isSurvival ? t("review.survivalMode") : t("review.duelMode")}
                </span>
              </div>
            )}

            {/* Score Circle */}
            <div className="mt-6 mb-6 flex justify-center">
              <div
                className="relative w-44 h-44 rounded-full flex flex-col items-center justify-center border-[6px]"
                style={{
                  background: "var(--color-surface-800)",
                  borderColor: isPass ? "rgb(34 197 94 / 0.30)" : "rgb(239 68 68 / 0.30)",
                  boxShadow: isPass ? "inset 0 0 30px rgb(34 197 94 / 0.08)" : "inset 0 0 30px rgb(239 68 68 / 0.08)",
                }}
              >
                <span
                  className="text-5xl font-black tracking-tighter"
                  style={{ color: isPass ? "#4ade80" : "#f87171" }}
                >
                  {isSurvival ? resultData.correct : resultData.score}
                </span>
                <span className="text-xs font-bold tracking-widest mt-1" style={{ color: "var(--color-surface-500)" }}>
                  {isSurvival ? t("quiz.round") : t("quiz.points")}
                </span>
                {isPass && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 p-2 rounded-full border-2"
                    style={{ background: "#fbbf24", borderColor: "var(--color-surface-900)" }}
                  >
                    <Trophy className="text-white" size={20} fill="currentColor" />
                  </motion.div>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-black mb-1" style={{ color: "var(--color-surface-50)" }}>
              {isSurvival
                ? isPass ? t("quiz.excellent") : t("quiz.gameOver")
                : isPass ? t("quiz.greatJob") : t("quiz.keepGoing")}
            </h1>
            <p className="text-sm font-medium mb-6" style={{ color: "var(--color-surface-500)" }}>
              {t("quiz.completedMsg")}
            </p>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-2 p-4 rounded-2xl border mb-6"
              style={{ background: "var(--color-surface-800)", borderColor: "var(--color-surface-700)" }}
            >
              {[
                { label: t("quiz.time"), value: duration > 60 ? formatTime(duration) : `${duration}${t("review.seconds")}`, icon: <Clock size={13} />, color: "var(--color-surface-300)" },
                { label: t("quiz.correctEst"), value: resultData.correct, icon: <CheckCircle2 size={13} />, color: "#4ade80" },
                { label: t("quiz.wrongEst"), value: resultData.wrong, icon: <XCircle size={13} />, color: "#f87171" },
              ].map((stat, i) => (
                <div key={i} className={`text-center ${i === 1 ? "border-l border-r" : ""}`} style={{ borderColor: "var(--color-surface-700)" }}>
                  <div className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--color-surface-500)" }}>{stat.label}</div>
                  <div className="font-bold flex justify-center items-center gap-1" style={{ color: stat.color }}>{stat.icon} {stat.value}</div>
                </div>
              ))}
            </div>

            {isRealtime && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-6 border ${
                  allDone ? "" : "animate-pulse"
                }`}
                style={{
                  background: allDone ? "rgb(34 197 94 / 0.10)" : "rgb(99 102 241 / 0.10)",
                  borderColor: allDone ? "rgb(34 197 94 / 0.25)" : "rgb(99 102 241 / 0.20)",
                  color: allDone ? "#4ade80" : "var(--color-brand-300)",
                }}
              >
                {allDone ? (<><CheckCircle2 size={13} /> {t("quiz.allFinished")}</>) : (<><Loader2 size={13} className="animate-spin" /> {t("quiz.waitingOthers")}</>)}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {isChallenge ? (
                <button
                  onClick={() => navigate("/challenges")}
                  className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 border-none cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", boxShadow: "0 4px 20px rgb(249 115 22 / 0.25)" }}
                >
                  <Swords size={16} /> {t("quiz.backToArena")}
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: "var(--color-surface-700)" }}
                >
                  <Home size={16} /> {t("quiz.backToDashboard")}
                </Link>
              )}
              <button
                onClick={() => goToReview(historyId)}
                className="text-sm font-bold py-2 cursor-pointer"
                style={{ color: "var(--color-surface-500)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--color-surface-300)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--color-surface-500)"}
              >
                {t("quiz.reviewAnswers")}
              </button>
              <button
                onClick={() => !isRated && setShowReviewModal(true)}
                disabled={isRated}
                className="text-sm font-bold py-1 flex items-center justify-center gap-1 cursor-pointer"
                style={{ color: isRated ? "var(--color-surface-600)" : "#fbbf24" }}
              >
                <Flame size={15} /> {isRated ? t("quiz.rated") : t("quiz.rateQuiz")}
              </button>
            </div>
          </motion.div>
        </div>

        <StreakSuccessModal isOpen={showStreakModal} onClose={() => setShowStreakModal(false)} streakCount={streakModalData.count} type={streakModalData.type} />
        <LevelUpModal isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} newLevel={newLevelData} />
        <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} quizId={quizId} onSuccess={() => setIsRated(true)} />
      </div>
    );
  }

  // ----------------------------------------------------------------
  // VIEW 2: GAMEPLAY
  // ----------------------------------------------------------------
  const currentQ = questions[currentIndex];
  const totalCount = totalQuestions > 0 ? totalQuestions : questions.length;
  const progress = ((currentIndex + 1) / totalCount) * 100;
  const remainingTime = timeLimit > 0 ? Math.max(0, timeLimit - elapsedTime) : 0;
  const isUrgent = timeLimit > 0 && remainingTime < 30;
  const currentAnswer = answers[currentQ.ID];
  let isAnswered = false;
  if (Array.isArray(currentAnswer)) isAnswered = currentAnswer.length > 0;
  else isAnswered = typeof currentAnswer === "string" && currentAnswer.trim().length > 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 pt-6 pb-10 transition-colors duration-500"
      style={{
        background: isUrgent
          ? "linear-gradient(180deg, rgb(239 68 68 / 0.08) 0%, var(--color-surface-950) 40%)"
          : "var(--color-surface-950)",
      }}
    >
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition border cursor-pointer"
            style={{
              background: "var(--color-surface-800)",
              borderColor: "var(--color-surface-700)",
              color: "var(--color-surface-400)",
            }}
          >
            <XCircle size={18} />
          </button>
          <div>
            <h2 className="font-bold text-sm leading-tight flex items-center gap-2" style={{ color: "var(--color-surface-200)" }}>
              {isChallenge && <Swords size={13} style={{ color: "#fb923c" }} />}
              {quizTitle}
              {/* Difficulty badge */}
              {currentQ && (
                <span
                  className="text-[9px] uppercase font-black px-2 py-0.5 rounded-md border tracking-wider"
                  style={{
                    background: (currentQ.difficulty || targetDifficulty || 0.5) < 0.4
                      ? "rgb(34 197 94 / 0.15)" : (currentQ.difficulty || targetDifficulty || 0.5) > 0.7
                      ? "rgb(239 68 68 / 0.15)" : "rgb(234 179 8 / 0.15)",
                    color: (currentQ.difficulty || targetDifficulty || 0.5) < 0.4
                      ? "#4ade80" : (currentQ.difficulty || targetDifficulty || 0.5) > 0.7
                      ? "#f87171" : "#fbbf24",
                    borderColor: (currentQ.difficulty || targetDifficulty || 0.5) < 0.4
                      ? "rgb(34 197 94 / 0.25)" : (currentQ.difficulty || targetDifficulty || 0.5) > 0.7
                      ? "rgb(239 68 68 / 0.25)" : "rgb(234 179 8 / 0.25)",
                  }}
                >
                  {(currentQ.difficulty || targetDifficulty || 0.5) < 0.4
                    ? t("difficulty.easy") || "Easy"
                    : (currentQ.difficulty || targetDifficulty || 0.5) > 0.7
                      ? t("difficulty.hard") || "Hard"
                      : t("difficulty.medium") || "Medium"}
                </span>
              )}
            </h2>
            <p className="text-[11px]" style={{ color: "var(--color-surface-500)" }}>
              {t("quiz.questionOf", { current: currentIndex + 1, total: totalQuestions > 0 ? totalQuestions : questions.length })}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs border transition-all ${
            isUrgent ? "animate-pulse" : ""
          }`}
          style={{
            background: isUrgent ? "rgb(239 68 68 / 0.15)" : isRealtime ? "rgb(99 102 241 / 0.12)" : "var(--color-surface-800)",
            borderColor: isUrgent ? "rgb(239 68 68 / 0.30)" : isRealtime ? "rgb(99 102 241 / 0.20)" : "var(--color-surface-700)",
            color: isUrgent ? "#f87171" : isRealtime ? "var(--color-brand-300)" : "var(--color-surface-300)",
          }}
        >
          {isUrgent ? <AlertTriangle size={13} /> : isRealtime ? <Zap size={13} /> : <Clock size={13} />}
          <span className="tabular-nums">{timeLimit > 0 ? formatTime(remainingTime) : `${elapsedTime}s`}</span>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div
          className="w-full rounded-full h-1 mb-7 overflow-hidden"
          style={{ background: "var(--color-surface-800)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: isUrgent ? "#ef4444" : "var(--color-brand-500)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-xl mb-5 flex gap-3 border"
              style={{
                background: "rgb(234 179 8 / 0.08)",
                borderColor: "rgb(234 179 8 / 0.20)",
              }}
            >
              <Lightbulb size={18} className="shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#fbbf24" }}>Bantuan</p>
                <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--color-surface-300)" }}>
                  {showTranslated && ((translation?.hint) || (bulkTranslations[currentQ.ID]?.hint))
                    ? translation?.hint || bulkTranslations[currentQ.ID]?.hint
                    : currentQ.hint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.ID}
            initial={{ x: 20, opacity: 0, scale: 0.97 }}
            animate={
              feedbackStatus === "correct"
                ? { x: 0, opacity: 1, scale: 1.01, borderColor: "rgb(34 197 94 / 0.50)", boxShadow: "0 0 30px rgb(34 197 94 / 0.15)" }
                : feedbackStatus === "wrong"
                  ? { x: [0, -8, 8, -8, 8, 0], opacity: 1, scale: 1, borderColor: "rgb(239 68 68 / 0.50)", boxShadow: "0 0 30px rgb(239 68 68 / 0.15)" }
                  : feedbackStatus === "special"
                    ? { x: 0, opacity: 1, scale: 1.03, borderColor: "rgb(234 179 8 / 0.50)", boxShadow: "0 0 40px rgb(234 179 8 / 0.20)" }
                    : { x: 0, opacity: 1, scale: 1, borderColor: "var(--color-surface-800)" }
            }
            exit={{ x: -20, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-8 rounded-2xl border mb-5 relative overflow-hidden transition-colors duration-300"
            style={{
              background: feedbackStatus === "correct"
                ? "rgb(34 197 94 / 0.07)"
                : feedbackStatus === "wrong"
                  ? "rgb(239 68 68 / 0.07)"
                  : feedbackStatus === "special"
                    ? "rgb(234 179 8 / 0.07)"
                    : "var(--color-surface-900)",
              borderColor: feedbackStatus === "correct"
                ? "rgb(34 197 94 / 0.40)"
                : feedbackStatus === "wrong"
                  ? "rgb(239 68 68 / 0.40)"
                  : feedbackStatus === "special"
                    ? "rgb(234 179 8 / 0.40)"
                    : "var(--color-surface-800)",
            }}
          >
            {/* Feedback Badge */}
            <AnimatePresence>
              {(feedbackStatus || feedbackData) && (
                <div className="absolute top-0 right-0 z-20 flex flex-col items-end pointer-events-none">
                  {feedbackStatus && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, rotate: -20, y: 0 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0, y: 14 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="mr-4 px-5 py-1.5 rounded-full font-black uppercase tracking-wider text-white shadow-xl rotate-12 flex items-center gap-2 text-sm"
                      style={{
                        background: feedbackStatus === "correct" ? "#22c55e"
                          : feedbackStatus === "special" ? "#eab308" : "#ef4444",
                      }}
                    >
                      {feedbackStatus === "correct" ? (<><CheckCircle2 size={16} /> {t("quiz.correct") || "BENAR!"}</>)
                        : feedbackStatus === "special" ? (<><Sparkles size={16} /> {t("quiz.excellent") || "MEMUKAU!"}</>)
                        : (<><XCircle size={16} /> {t("quiz.wrong") || "SALAH!"}</>)}
                    </motion.div>
                  )}

                  {feedbackData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="mt-4 mr-4 p-4 rounded-2xl border-2 max-w-xs text-right relative overflow-hidden"
                      style={{
                        background: feedbackData.score >= 70 ? "rgb(34 197 94 / 0.10)" : "rgb(239 68 68 / 0.10)",
                        borderColor: feedbackData.score >= 70 ? "rgb(34 197 94 / 0.40)" : "rgb(239 68 68 / 0.40)",
                        color: feedbackData.score >= 70 ? "#4ade80" : "#f87171",
                      }}
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-90 mb-0.5">AI Grading Score</div>
                      <div className="text-4xl font-black tracking-tighter mb-1">{feedbackData.score.toFixed(0)}</div>
                      <div className="text-xs italic opacity-80 leading-relaxed border-t border-current/20 pt-2">"{feedbackData.text}"</div>
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>

            {/* Question text + action buttons */}
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl md:text-2xl font-bold leading-snug pr-4" style={{ color: "var(--color-surface-50)" }}>
                {showTranslated && ((translation?.question) || (bulkTranslations[currentQ.ID]?.question)) ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "var(--color-brand-300)" }}>
                    {translation?.question || bulkTranslations[currentQ.ID]?.question}
                  </motion.span>
                ) : currentQ.question}
              </h2>
              <div className="flex gap-2 items-start flex-shrink-0">
                {/* Translate */}
                {!shouldHideTranslate && (
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="p-2 rounded-full transition cursor-pointer border"
                    style={{
                      background: showTranslated ? "rgb(99 102 241 / 0.15)" : "var(--color-surface-800)",
                      borderColor: showTranslated ? "rgb(99 102 241 / 0.30)" : "var(--color-surface-700)",
                      color: showTranslated ? "var(--color-brand-300)" : "var(--color-surface-500)",
                    }}
                    title={showTranslated ? t("quiz.showOriginal") : t("quiz.translate")}
                  >
                    {isTranslating ? <Loader2 size={17} className="animate-spin" /> : showTranslated ? <RotateCcw size={17} /> : <Languages size={17} />}
                  </button>
                )}
                {/* Bulk Translate */}
                {!shouldHideTranslate && Object.keys(bulkTranslations).length === 0 && (
                  <button
                    onClick={handleBulkTranslate}
                    disabled={isBulkTranslating}
                    className="p-2 rounded-full transition cursor-pointer border"
                    style={{ background: "var(--color-surface-800)", borderColor: "var(--color-surface-700)", color: "var(--color-surface-500)" }}
                    title={t("quiz.translateAll")}
                  >
                    {isBulkTranslating ? <Loader2 size={17} className="animate-spin" style={{ color: "#a78bfa" }} /> : <Sparkles size={17} />}
                  </button>
                )}
                {/* Hint */}
                {currentQ.hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="p-2 rounded-full transition cursor-pointer border"
                    style={{
                      background: showHint ? "rgb(234 179 8 / 0.15)" : "var(--color-surface-800)",
                      borderColor: showHint ? "rgb(234 179 8 / 0.25)" : "var(--color-surface-700)",
                      color: showHint ? "#fbbf24" : "var(--color-surface-500)",
                    }}
                    title={t("quiz.hintLabel")}
                  >
                    <Lightbulb size={17} />
                  </button>
                )}
                {/* Report */}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-full transition cursor-pointer border"
                  style={{ background: "var(--color-surface-800)", borderColor: "var(--color-surface-700)", color: "var(--color-surface-500)" }}
                  title={t("quiz.report")}
                >
                  <Flag size={17} />
                </button>
              </div>
            </div>

            {/* Question type badge */}
            <div className="mb-4">
              {currentQ.type === "short_answer" && (
                <span className="text-[9px] uppercase font-bold px-2 py-1 rounded" style={{ background: "rgb(14 165 233 / 0.12)", color: "#38bdf8" }}>
                  {t("quiz.shortAnswer") || "Isian Singkat"}
                </span>
              )}
              {currentQ.type === "boolean" && (
                <span className="text-[9px] uppercase font-bold px-2 py-1 rounded" style={{ background: "rgb(139 92 246 / 0.12)", color: "#c084fc" }}>
                  {t("quiz.boolean") || "Benar / Salah"}
                </span>
              )}
              {currentQ.type === "multi_select" && (
                <span className="text-[9px] uppercase font-bold px-2 py-1 rounded" style={{ background: "rgb(249 115 22 / 0.12)", color: "#fb923c" }}>
                  {t("quiz.multiSelect") || "Pilih Banyak"}
                </span>
              )}
            </div>

            {renderAnswerInput(currentQ)}
          </motion.div>
        </AnimatePresence>

        {/* Realtime Live Arena */}
        {isRealtime && Object.keys(opponentsProgress).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-4 rounded-xl border"
            style={{ background: "var(--color-surface-900)", borderColor: "var(--color-surface-800)" }}
          >
            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--color-surface-500)" }}>
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Live Arena
            </h3>
            <div className="space-y-3">
              {Object.entries(opponentsProgress).map(([oppID, prog]) => {
                const playerInfo = playersMap[oppID];
                const displayName = playerInfo ? playerInfo.name : `Player ${oppID}`;
                const isFriend = isTeammate(oppID);
                const playerFinished = finishedPlayers[oppID];
                return (
                  <div key={oppID} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0"
                      style={{
                        background: isFriend ? "rgb(14 165 233 / 0.12)" : "rgb(239 68 68 / 0.12)",
                        borderColor: isFriend ? "rgb(14 165 233 / 0.25)" : "rgb(239 68 68 / 0.25)",
                        color: isFriend ? "#38bdf8" : "#f87171",
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase" style={{ color: isFriend ? "#38bdf8" : "var(--color-surface-500)" }}>
                        {displayName} {isFriend && "(Rekan)"}
                      </span>
                      {playerFinished ? (
                        <div
                          className="h-5 text-[10px] font-bold px-2 rounded flex items-center gap-1 w-fit border mt-1"
                          style={{ background: "rgb(34 197 94 / 0.12)", color: "#4ade80", borderColor: "rgb(34 197 94 / 0.20)" }}
                        >
                          <Flag size={9} fill="currentColor" /> SELESAI ({playerFinished.score} Poin)
                        </div>
                      ) : (
                        <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: "var(--color-surface-800)" }}>
                          <motion.div
                            className="h-full"
                            style={{ background: isFriend ? "#38bdf8" : "linear-gradient(to right, #f97316, #ef4444)" }}
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

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer border"
            style={{
              background: "var(--color-surface-900)",
              borderColor: "var(--color-surface-800)",
              color: currentIndex === 0 ? "var(--color-surface-700)" : "var(--color-surface-400)",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={18} /> {t("quiz.prev")}
          </button>
          <button
            onClick={handleNext}
            disabled={!isAnswered || submitting}
            className="px-8 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 transition border-none cursor-pointer"
            style={{
              background: !isAnswered || submitting ? "var(--color-surface-800)" : "var(--color-brand-600)",
              color: !isAnswered || submitting ? "var(--color-surface-600)" : "#fff",
              boxShadow: isAnswered && !submitting ? "0 4px 24px rgb(99 102 241 / 0.30)" : "none",
              cursor: !isAnswered || submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> {t("quiz.sending")}</>
            ) : (totalQuestions > 0 ? currentIndex === totalQuestions - 1 : !isAdaptive && currentIndex === questions.length - 1) ? (
              <>{t("quiz.finish")} <CheckCircle2 size={16} /></>
            ) : (
              <>{t("quiz.next")} <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>

      {/* AI Feedback Modal */}
      <AnimatePresence>
        {aiFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl overflow-hidden border"
              style={{ background: "var(--color-surface-900)", borderColor: "var(--color-surface-700)" }}
            >
              <div
                className="p-8 text-center"
                style={{ background: aiFeedbackModal.score >= 70 ? "rgb(34 197 94 / 0.15)" : "rgb(239 68 68 / 0.15)" }}
              >
                <h3 className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--color-surface-500)" }}>AI Grading Score</h3>
                <div
                  className="text-5xl font-black tracking-tighter mb-2"
                  style={{ color: aiFeedbackModal.score >= 70 ? "#4ade80" : "#f87171" }}
                >
                  {aiFeedbackModal.score.toFixed(0)}
                </div>
                <p className="text-sm italic leading-relaxed" style={{ color: "var(--color-surface-300)" }}>
                  "{aiFeedbackModal.feedback}"
                </p>
              </div>
              <div className="p-5">
                <button
                  onClick={() => setAiFeedbackModal(null)}
                  className="w-full py-3 rounded-xl font-bold cursor-pointer border"
                  style={{
                    background: "var(--color-surface-800)",
                    borderColor: "var(--color-surface-700)",
                    color: "var(--color-surface-300)",
                  }}
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} questionId={currentQ?.ID} />
    </div>
  );
};

export default QuizPlay;
