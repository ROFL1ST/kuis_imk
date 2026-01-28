import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  ListChecks,
  Timer,
  BookOpen,
  Swords,
  CheckSquare,
  Type,
} from "lucide-react";
import { quizAPI } from "../../services/api";
import toast from "react-hot-toast";
import Skeleton from "../../components/ui/Skeleton";
import { useLanguage } from "../../context/LanguageContext";

const ReviewPage = () => {
  const { t, language } = useLanguage();
  const { historyId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await quizAPI.getHistoryById(historyId);
        setData(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error(t("review.loadError"));
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [historyId, navigate, t]);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} ${t("review.seconds")}`;
    return `${m} ${t("review.minutes")} ${s} ${t("review.seconds")}`;
  };

  const formatAnswer = (answer, type) => {
    if (!answer)
      return (
        <span className="text-slate-400 italic">{t("review.noAnswer")}</span>
      );

    if (type === "multi_select") {
      try {
        const ansArray = Array.isArray(answer) ? answer : JSON.parse(answer);

        if (ansArray.length === 0)
          return (
            <span className="text-slate-400 italic">
              {t("review.noOptionSelected")}
            </span>
          );

        return (
          <div className="flex flex-wrap gap-2">
            {ansArray.map((item, idx) => (
              <span
                key={idx}
                className="bg-white/50 border border-current px-2 py-0.5 rounded-md text-sm font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        );
      } catch (e) {
        console.error("Error parsing multi select answer", e);
        return answer;
      }
    }

    return answer;
  };

  // --- SKELETON LOADING UI ---
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-12 space-y-8 px-4 md:px-0">
        {/* Back Button Skeleton */}
        <Skeleton className="h-6 w-32 rounded-lg" />

        {/* Summary Card Skeleton */}
        <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 rounded-xl" /> {/* Title */}
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-32 rounded-full" /> {/* Date */}
                  <Skeleton className="h-6 w-24 rounded-full" />{" "}
                  {/* Question Count */}
                </div>
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" /> {/* Timer Badge */}
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Detail List Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 rounded-lg" />{" "}
          {/* Header "Detail Jawaban" */}
          {/* Loop Question Skeletons */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-slate-100 bg-white space-y-4"
            >
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16 rounded-lg" /> {/* Number */}
                <Skeleton className="h-6 w-20 rounded-full" />{" "}
                {/* Status Badge */}
              </div>
              <Skeleton className="h-6 w-full" /> {/* Question Line 1 */}
              <Skeleton className="h-6 w-3/4" /> {/* Question Line 2 */}
              <Skeleton className="h-24 w-full rounded-xl mt-4" />{" "}
              {/* Answer Box */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    quiz_title,
    score,
    created_at,
    time_taken,
    questions = [],
    snapshot = {},
    essay_submissions = [], // New field from backend
  } = data;
  const isPass = score >= 70;

  const isDuel = quiz_title.includes("[DUEL]");
  const isSurvival =
    quiz_title.includes("Survival") || (data.quiz_id === 0 && !isDuel);
  const cleanTitle = quiz_title.replace("[DUEL]", "").trim();

  let correctCount = 0;

  // Create map for easy lookup
  const essayMap = {};
  if (essay_submissions) {
    essay_submissions.forEach((sub) => {
      essayMap[sub.question_id] = sub;
    });
  }

  const detailedAnswers = (questions || []).map((q) => {
    const userAnswer = snapshot[String(q.ID)];
    let isCorrect = false;
    let aiData = null;

    if (!userAnswer) {
      isCorrect = false;
    } else if (q.type === "short_answer") {
      isCorrect =
        String(userAnswer).trim().toLowerCase() ===
        String(q.correct).trim().toLowerCase();
    } else if (q.type === "multi_select") {
      try {
        const userArr =
          typeof userAnswer === "string" ? JSON.parse(userAnswer) : userAnswer;
        const correctArr = JSON.parse(q.correct || "[]");

        if (Array.isArray(userArr) && Array.isArray(correctArr)) {
          if (userArr.length === correctArr.length) {
            const sortedUser = [...userArr].sort().toString();
            const sortedCorrect = [...correctArr].sort().toString();
            if (sortedUser === sortedCorrect) isCorrect = true;
          }
        }
      } catch (e) {
        console.error("Error comparing multi select", e);
        isCorrect = false;
      }
    } else if (q.type === "essay") {
      // Logic for Essay
      const sub = essayMap[q.ID];
      if (sub) {
        aiData = {
          score: sub.ai_score,
          feedback: sub.ai_feedback,
        };
        // Define correct if score >= 70 (or based on your logic)
        isCorrect = sub.ai_score >= 70;
      } else {
        // Fallback if no submission record found but snapshot exists
        isCorrect = false;
      }
    } else {
      isCorrect = userAnswer === q.correct;
    }

    if (isCorrect) correctCount++;

    return { ...q, userAnswer, isCorrect, aiData };
  });

  const wrongCount = questions.length - correctCount;

  // Locale for date
  const localeMap = {
    id: "id-ID",
    en: "en-US",
    jp: "ja-JP",
  };
  const currentLocale = localeMap[language] || "id-ID";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Tombol Back */}
      <button
        onClick={() => navigate("/history")}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={20} /> {t("review.backToHistory")}
      </button>

      {/* 1. Summary Card */}
      <div
        className={`rounded-3xl shadow-sm border overflow-hidden mb-8 relative 
          ${
            isDuel
              ? "bg-gradient-to-br from-orange-50 to-white border-orange-200"
              : isSurvival
                ? "bg-gradient-to-br from-purple-50 to-white border-purple-200"
                : "bg-white border-slate-200"
          }`}
      >
        {isDuel && (
          <div className="absolute right-0 top-0 text-orange-500/10 -translate-y-1/4 translate-x-1/4 pointer-events-none">
            <Swords size={200} strokeWidth={1} />
          </div>
        )}
        {isSurvival && (
          <div className="absolute right-0 top-0 text-purple-500/10 -translate-y-1/4 translate-x-1/4 pointer-events-none">
            <Swords size={200} strokeWidth={1} />
          </div>
        )}

        <div
          className={`p-6 sm:p-8 border-b text-center sm:text-left relative z-10
            ${
              isDuel
                ? "border-orange-100 bg-orange-50/50"
                : isSurvival
                  ? "border-purple-100 bg-purple-50/50"
                  : "border-slate-100 bg-slate-50/50"
            }`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-2">
            <div>
              {isDuel && (
                <span className="inline-flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider mb-2 shadow-sm">
                  <Swords size={12} /> {t("review.duelMode")}
                </span>
              )}
              {isSurvival && (
                <span className="inline-flex items-center gap-1 bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider mb-2 shadow-sm">
                  <Swords size={12} /> {t("review.survivalMode")}
                </span>
              )}
              <h1 className="text-2xl font-bold text-slate-900">
                {cleanTitle}
              </h1>
            </div>

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm
                  ${
                    isDuel
                      ? "bg-white border-orange-200 text-orange-600 shadow-sm"
                      : isSurvival
                        ? "bg-white border-purple-200 text-purple-600 shadow-sm"
                        : "bg-white border-indigo-200 text-indigo-600 shadow-sm"
                  }`}
            >
              <Timer size={18} />
              {formatDuration(time_taken)}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500 mt-2">
            <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
              <Calendar size={14} />
              {new Date(created_at).toLocaleDateString(currentLocale, {
                dateStyle: "long",
              })}
            </span>
            <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
              <ListChecks size={14} />
              {questions.length} {t("review.questionsCount")}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
          {/* Skor */}
          <div
            className={`col-span-2 md:col-span-1 p-4 rounded-2xl border flex flex-col items-center justify-center
               ${
                 isDuel
                   ? "bg-white border-orange-100 shadow-sm"
                   : isSurvival
                     ? "bg-white border-purple-100 shadow-sm"
                     : "bg-indigo-50 border-indigo-100"
               }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                isDuel
                  ? "text-orange-400"
                  : isSurvival
                    ? "text-purple-400"
                    : "text-indigo-400"
              }`}
            >
              {isSurvival ? t("review.rounds") : t("review.yourScore")}
            </span>
            <span
              className={`text-4xl font-black ${
                isDuel
                  ? "text-orange-500"
                  : isSurvival
                    ? "text-purple-600"
                    : "text-indigo-600"
              }`}
            >
              {score}
            </span>
          </div>

          {/* Status */}
          <div
            className={`col-span-2 md:col-span-1 p-4 rounded-2xl border flex flex-col items-center justify-center ${
              isSurvival
                ? "bg-purple-50 border-purple-100"
                : isPass
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-red-50 border-red-100"
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                isSurvival
                  ? "text-purple-400"
                  : isPass
                    ? "text-emerald-400"
                    : "text-red-400"
              }`}
            >
              {isSurvival ? t("review.result") : t("review.status")}
            </span>
            <span
              className={`text-xl font-bold flex items-center gap-2 ${
                isSurvival
                  ? "text-purple-600"
                  : isPass
                    ? "text-emerald-600"
                    : "text-red-500"
              }`}
            >
              {isSurvival ? (
                <CheckCircle size={24} />
              ) : isPass ? (
                <CheckCircle size={24} />
              ) : (
                <XCircle size={24} />
              )}
              {isSurvival
                ? t("review.finished")
                : isPass
                  ? t("review.passed")
                  : t("review.failed")}
            </span>
          </div>

          {/* Benar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t("review.correct")}
            </span>
            <span className="text-2xl font-bold text-emerald-500">
              {correctCount}
            </span>
          </div>

          {/* Salah */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t("review.wrong")}
            </span>
            <span className="text-2xl font-bold text-red-500">
              {wrongCount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Detail Pembahasan */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
          <BookOpen className="text-indigo-600" /> {t("review.detailedAnswers")}
        </h2>

        {detailedAnswers.map((q, index) => {
          return (
            <div
              key={q.ID}
              className={`p-6 rounded-2xl border-2 transition-all ${
                q.isCorrect
                  ? "bg-white border-slate-100 hover:border-emerald-100"
                  : "bg-white border-slate-100 hover:border-red-100"
              }`}
            >
              {/* Header Soal */}
              <div className="flex justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-lg h-fit">
                    {t("review.number")} {index + 1}
                  </span>
                  {/* Badge Tipe Soal */}
                  {q.type === "mcq" && (
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                      <ListChecks size={12} /> {t("review.typeMCQ")}
                    </span>
                  )}
                  {q.type === "essay" && (
                    <span className="text-[10px] font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded border border-pink-100 flex items-center gap-1">
                      <Type size={12} /> {t("review.typeRealEssay")}
                    </span>
                  )}
                  {q.type === "multi_select" && (
                    <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 flex items-center gap-1">
                      <CheckSquare size={12} /> {t("review.typeMulti")}
                    </span>
                  )}
                  {q.type === "short_answer" && (
                    <span className="text-[10px] font-bold bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded border border-cyan-100 flex items-center gap-1">
                      <Type size={12} /> {t("review.typeShort")}
                    </span>
                  )}
                  {q.type === "boolean" && (
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-600 px-2 py-0.5 rounded border border-teal-100 flex items-center gap-1">
                      <CheckCircle size={12} /> {t("review.typeBoolean")}
                    </span>
                  )}
                </div>

                {q.isCorrect ? (
                  <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                    <CheckCircle size={14} /> {t("review.correct")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full">
                    <XCircle size={14} /> {t("review.wrong")}
                  </span>
                )}
              </div>

              {/* Pertanyaan */}
              <p className="text-lg font-medium text-slate-800 mb-6 leading-relaxed">
                {q.question}
              </p>

              {/* Opsi Jawaban */}
              <div className="grid gap-3">
                {/* Jawaban User */}
                <div
                  className={`p-4 rounded-xl border flex justify-between items-start gap-4 ${
                    q.isCorrect
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="w-full">
                    <span className="text-xs font-bold uppercase opacity-60 block mb-2">
                      {t("review.yourAnswer")}
                    </span>
                    <div className="font-semibold text-lg leading-snug">
                      {formatAnswer(q.userAnswer, q.type)}
                    </div>
                  </div>
                  <div className="shrink-0 mt-1">
                    {q.isCorrect ? (
                      <CheckCircle size={24} />
                    ) : (
                      <XCircle size={24} />
                    )}
                  </div>
                </div>

                {/* Kunci Jawaban (Jika Salah) */}
                {!q.isCorrect && q.type !== "essay" && (
                  <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 flex justify-between items-start gap-4">
                    <div className="w-full">
                      <span className="text-xs font-bold uppercase opacity-60 block mb-2 text-slate-500">
                        {t("review.correctAnswer")}
                      </span>
                      <div className="font-semibold text-lg leading-snug text-emerald-600">
                        {formatAnswer(q.correct, q.type)}
                      </div>
                    </div>
                    <CheckCircle
                      size={24}
                      className="text-emerald-500 shrink-0 mt-1"
                    />
                  </div>
                )}

                {/* AI Grading Feedback (Only for Essay) */}
                {q.type === "essay" && q.aiData && (
                  <div className="mt-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Swords size={60} className="text-indigo-600" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                          <Swords size={12} /> AI Assessment
                        </span>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            q.aiData.score >= 70
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          Score: {q.aiData.score.toFixed(1)}
                        </div>
                      </div>

                      <p className="text-indigo-900 font-medium italic leading-relaxed">
                        "{q.aiData.feedback}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hint / Penjelasan */}
              {q.hint && (
                <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-100 flex gap-2 items-start">
                  <span className="mt-0.5">💡</span>
                  <div>
                    <span className="font-bold block text-xs uppercase opacity-70 mb-0.5">
                      {t("review.explanation")}
                    </span>
                    {q.hint}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewPage;
