// src/pages/dashboard/ReviewPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, XCircle, Calendar, ListChecks,
  Timer, BookOpen, Swords, CheckSquare, Type,
} from "lucide-react";
import { quizAPI } from "../../services/api";
import toast from "react-hot-toast";
import Skeleton from "../../components/ui/Skeleton";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";

/* ── CSS var shortcuts ── */
const BRAND = "var(--color-brand-400)";
const S100  = "var(--color-surface-100)";
const S200  = "var(--color-surface-200)";
const S300  = "var(--color-surface-300)";
const S400  = "var(--color-surface-400)";
const S500  = "var(--color-surface-500)";
const S600  = "var(--color-surface-600)";
const S700  = "var(--color-surface-700)";
const S800  = "var(--color-surface-800)";
const S900  = "var(--color-surface-900)";

/* ── type configs ── */
const QUIZ_TYPE = {
  duel: {
    accent: "#fb923c", bg: "rgb(249 115 22 / 0.10)", border: "rgb(249 115 22 / 0.25)",
    headerBg: "rgb(249 115 22 / 0.07)", headerBorder: "rgb(249 115 22 / 0.20)",
    score: "#f97316", label: "DUEL", icon: <Swords size={12} />,
  },
  survival: {
    accent: "#a78bfa", bg: "rgb(167 139 250 / 0.10)", border: "rgb(167 139 250 / 0.25)",
    headerBg: "rgb(167 139 250 / 0.07)", headerBorder: "rgb(167 139 250 / 0.20)",
    score: "#8b5cf6", label: "SURVIVAL", icon: <Swords size={12} />,
  },
  normal: {
    accent: BRAND, bg: "rgb(99 102 241 / 0.10)", border: "rgb(99 102 241 / 0.25)",
    headerBg: "rgb(99 102 241 / 0.07)", headerBorder: "rgb(99 102 241 / 0.20)",
    score: BRAND, label: "", icon: null,
  },
};

const ReviewPage = () => {
  const { t, language } = useLanguage();
  const { historyId }   = useParams();
  const navigate        = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await quizAPI.getHistoryById(historyId);
        setData(res.data.data);
      } catch {
        toast.error(t("review.loadError"));
        navigate("/history");
      } finally { setLoading(false); }
    };
    fetchDetail();
  }, [historyId, navigate, t]);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m === 0 ? `${s} ${t("review.seconds")}` : `${m} ${t("review.minutes")} ${s} ${t("review.seconds")}`;
  };

  const formatAnswer = (answer, type) => {
    if (!answer) return <span style={{ color: S600, fontStyle: "italic" }}>{t("review.noAnswer")}</span>;
    if (type === "multi_select") {
      try {
        const arr = Array.isArray(answer) ? answer : JSON.parse(answer);
        if (arr.length === 0) return <span style={{ color: S600, fontStyle: "italic" }}>{t("review.noOptionSelected")}</span>;
        return (
          <div className="flex flex-wrap gap-2">
            {arr.map((item, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-sm font-black" style={{ background: "rgb(255 255 255 / 0.08)", border: "1px solid currentColor" }}>{item}</span>
            ))}
          </div>
        );
      } catch { return answer; }
    }
    return answer;
  };

  /* ───────────── SKELETON ───────────── */
  if (loading) return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6 px-4">
      <Skeleton className="h-6 w-32 rounded-lg" />
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
    </div>
  );

  if (!data) return null;

  const { quiz_title, score, created_at, time_taken, questions = [], snapshot = {}, essay_submissions = [] } = data;
  const isPass    = score >= 70;
  const isDuel    = quiz_title.includes("[DUEL]");
  const isSurvival = quiz_title.includes("Survival") || (data.quiz_id === 0 && !isDuel);
  const cleanTitle = quiz_title.replace("[DUEL]", "").trim();
  const qType     = isDuel ? "duel" : isSurvival ? "survival" : "normal";
  const cfg       = QUIZ_TYPE[qType];

  const localeMap  = { id: "id-ID", en: "en-US", jp: "ja-JP" };
  const locale     = localeMap[language] || "id-ID";

  const essayMap = {};
  (essay_submissions || []).forEach(sub => { essayMap[sub.question_id] = sub; });

  let correctCount = 0;
  const detailedAnswers = (questions || []).map(q => {
    const userAnswer = snapshot[String(q.ID)];
    let isCorrect = false;
    let aiData    = null;

    if (!userAnswer) {
      isCorrect = false;
    } else if (q.type === "short_answer") {
      isCorrect = String(userAnswer).trim().toLowerCase() === String(q.correct).trim().toLowerCase();
    } else if (q.type === "multi_select") {
      try {
        const uArr = typeof userAnswer === "string" ? JSON.parse(userAnswer) : userAnswer;
        const cArr = JSON.parse(q.correct || "[]");
        if (Array.isArray(uArr) && Array.isArray(cArr) && uArr.length === cArr.length)
          isCorrect = [...uArr].sort().toString() === [...cArr].sort().toString();
      } catch { isCorrect = false; }
    } else if (q.type === "essay") {
      const sub = essayMap[q.ID];
      if (sub) { aiData = { score: sub.ai_score, feedback: sub.ai_feedback }; isCorrect = sub.ai_score >= 70; }
    } else {
      isCorrect = userAnswer === q.correct;
    }

    if (isCorrect) correctCount++;
    return { ...q, userAnswer, isCorrect, aiData };
  });

  const wrongCount  = questions.length - correctCount;
  const isAllEssay  = questions.length > 0 && questions.every(q => q.type === "essay");

  /* ── Q-card helper colors ── */
  const qCardColor = (q) => {
    const isSpecialEssay = q.type === "essay" && q.aiData?.score >= 90;
    if (isSpecialEssay)      return { bg: "rgb(234 179 8 / 0.07)",  border: "rgb(234 179 8 / 0.30)",  accent: "#fbbf24" };
    if (q.type === "essay")  return { bg: "rgb(99 102 241 / 0.06)", border: "rgb(99 102 241 / 0.20)", accent: BRAND };
    if (q.isCorrect)         return { bg: "rgb(34 197 94 / 0.06)",  border: "rgb(34 197 94 / 0.20)",  accent: "#4ade80" };
    return                          { bg: "rgb(239 68 68 / 0.06)",  border: "rgb(239 68 68 / 0.20)",  accent: "#f87171" };
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12 px-4">

      {/* Back button */}
      <button
        onClick={() => navigate("/history")}
        className="flex items-center gap-2 mb-6 text-sm font-black transition-colors"
        style={{ color: S500 }}
        onMouseEnter={e => e.currentTarget.style.color = BRAND}
        onMouseLeave={e => e.currentTarget.style.color = S500}
      >
        <ArrowLeft size={18} /> {t("review.backToHistory")}
      </button>

      {/* ═══ SUMMARY CARD ═══ */}
      <div
        className="rounded-3xl overflow-hidden mb-8 relative"
        style={{ background: S900, border: `1px solid ${cfg.border}` }}
      >
        {/* bg icon */}
        <div className="absolute -right-8 -top-8 pointer-events-none" style={{ opacity: 0.04, color: cfg.accent }}>
          <Swords size={220} strokeWidth={1} />
        </div>

        {/* Header strip */}
        <div
          className="p-6 sm:p-8 relative z-10"
          style={{ borderBottom: `1px solid ${cfg.headerBorder}`, background: cfg.headerBg }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
            <div>
              {(isDuel || isSurvival) && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-2"
                  style={{ background: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
                >
                  {cfg.icon} {cfg.label}
                </span>
              )}
              <h1 className="text-2xl font-black" style={{ color: S100 }}>{cleanTitle}</h1>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black shrink-0"
              style={{ background: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
            >
              <Timer size={16} /> {formatDuration(time_taken)}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full"
              style={{ background: S800, color: S400, border: `1px solid ${S700}` }}
            >
              <Calendar size={12} />
              {new Date(created_at).toLocaleDateString(locale, { dateStyle: "long" })}
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full"
              style={{ background: S800, color: S400, border: `1px solid ${S700}` }}
            >
              <ListChecks size={12} />
              {questions.length} {t("review.questionsCount")}
            </span>
          </div>
        </div>

        {/* Stat grid */}
        <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {/* Score */}
          <div className="col-span-2 md:col-span-1 p-5 rounded-2xl flex flex-col items-center justify-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <span className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: cfg.accent, opacity: 0.7 }}>
              {isSurvival ? t("review.rounds") : t("review.yourScore")}
            </span>
            <span className="text-5xl font-black" style={{ color: cfg.score }}>{score}</span>
          </div>

          {/* Status */}
          {isSurvival ? (
            <div className="col-span-2 md:col-span-1 p-5 rounded-2xl flex flex-col items-center justify-center" style={{ background: "rgb(167 139 250 / 0.08)", border: "1px solid rgb(167 139 250 / 0.20)" }}>
              <span className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#a78bfa", opacity: 0.7 }}>{t("review.result")}</span>
              <span className="text-base font-black flex items-center gap-2" style={{ color: "#c4b5fd" }}>
                <CheckCircle size={20} /> {t("review.finished")}
              </span>
            </div>
          ) : isPass ? (
            <div className="col-span-2 md:col-span-1 p-5 rounded-2xl flex flex-col items-center justify-center" style={{ background: "rgb(34 197 94 / 0.08)", border: "1px solid rgb(34 197 94 / 0.20)" }}>
              <span className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#4ade80", opacity: 0.7 }}>{t("review.status")}</span>
              <span className="text-base font-black flex items-center gap-2" style={{ color: "#4ade80" }}>
                <CheckCircle size={20} /> {t("review.passed")}
              </span>
            </div>
          ) : (
            <div className="col-span-2 md:col-span-1 p-5 rounded-2xl flex flex-col items-center justify-center" style={{ background: "rgb(239 68 68 / 0.08)", border: "1px solid rgb(239 68 68 / 0.20)" }}>
              <span className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#f87171", opacity: 0.7 }}>{t("review.status")}</span>
              <span className="text-base font-black flex items-center gap-2" style={{ color: "#f87171" }}>
                <XCircle size={20} /> {t("review.failed")}
              </span>
            </div>
          )}

          {/* Correct */}
          <div className="p-5 rounded-2xl flex flex-col items-center justify-center" style={{ background: S800, border: `1px solid ${S700}` }}>
            <span className="text-[10px] font-black uppercase tracking-wider mb-1 text-center" style={{ color: S600 }}>{isAllEssay ? "Memuaskan" : t("review.correct")}</span>
            <span className="text-3xl font-black" style={{ color: "#4ade80" }}>{correctCount}</span>
          </div>

          {/* Wrong */}
          <div className="p-5 rounded-2xl flex flex-col items-center justify-center" style={{ background: S800, border: `1px solid ${S700}` }}>
            <span className="text-[10px] font-black uppercase tracking-wider mb-1 text-center" style={{ color: S600 }}>{isAllEssay ? "Kurang" : t("review.wrong")}</span>
            <span className="text-3xl font-black" style={{ color: "#f87171" }}>{wrongCount}</span>
          </div>
        </div>
      </div>

      {/* ═══ DETAIL PEMBAHASAN ═══ */}
      <h2 className="text-xl font-black flex items-center gap-2 px-1 mb-5" style={{ color: S100 }}>
        <BookOpen size={20} style={{ color: BRAND }} /> {t("review.detailedAnswers")}
      </h2>

      <div className="space-y-4">
        {detailedAnswers.map((q, index) => {
          const isSpecialEssay = q.type === "essay" && q.aiData?.score >= 90;
          const col = qCardColor(q);

          return (
            <motion.div
              key={q.ID}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: Math.min(index * 0.04, 0.4) }}
              className="p-6 rounded-2xl"
              style={{ background: col.bg, border: `2px solid ${col.border}` }}
            >
              {/* Header */}
              <div className="flex justify-between gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black px-3 py-1 rounded-lg" style={{ background: S800, color: S400 }}>
                    {t("review.number")} {index + 1}
                  </span>

                  {/* Type badge */}
                  {q.type === "mcq" && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1" style={{ background: "rgb(99 102 241 / 0.10)", color: BRAND, border: `1px solid rgb(99 102 241 / 0.20)` }}>
                      <ListChecks size={11} /> {t("review.typeMCQ")}
                    </span>
                  )}
                  {q.type === "essay" && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1" style={{ background: "rgb(236 72 153 / 0.10)", color: "#f472b6", border: "1px solid rgb(236 72 153 / 0.20)" }}>
                      <Type size={11} /> {t("review.typeRealEssay")}
                    </span>
                  )}
                  {q.type === "multi_select" && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1" style={{ background: "rgb(249 115 22 / 0.10)", color: "#fb923c", border: "1px solid rgb(249 115 22 / 0.20)" }}>
                      <CheckSquare size={11} /> {t("review.typeMulti")}
                    </span>
                  )}
                  {q.type === "short_answer" && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1" style={{ background: "rgb(6 182 212 / 0.10)", color: "#22d3ee", border: "1px solid rgb(6 182 212 / 0.20)" }}>
                      <Type size={11} /> {t("review.typeShort")}
                    </span>
                  )}
                  {q.type === "boolean" && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1" style={{ background: "rgb(20 184 166 / 0.10)", color: "#2dd4bf", border: "1px solid rgb(20 184 166 / 0.20)" }}>
                      <CheckCircle size={11} /> {t("review.typeBoolean")}
                    </span>
                  )}
                </div>

                {/* Status badge */}
                {q.type === "essay" ? (
                  isSpecialEssay ? (
                    <span className="flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full" style={{ background: "rgb(234 179 8 / 0.15)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.30)" }}>
                      ✨ MEMUKAU! {q.aiData ? `(${q.aiData.score.toFixed(1)})` : ""}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full" style={{ background: "rgb(99 102 241 / 0.10)", color: BRAND, border: `1px solid rgb(99 102 241 / 0.20)` }}>
                      📝 Dinilai {q.aiData ? `(${q.aiData.score.toFixed(1)})` : ""}
                    </span>
                  )
                ) : q.isCorrect ? (
                  <span className="flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full" style={{ background: "rgb(34 197 94 / 0.12)", color: "#4ade80", border: "1px solid rgb(34 197 94 / 0.20)" }}>
                    <CheckCircle size={12} /> {t("review.correct")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full" style={{ background: "rgb(239 68 68 / 0.12)", color: "#f87171", border: "1px solid rgb(239 68 68 / 0.20)" }}>
                    <XCircle size={12} /> {t("review.wrong")}
                  </span>
                )}
              </div>

              {/* Question text */}
              <p className="text-base font-medium mb-5 leading-relaxed" style={{ color: S200 }}>{q.question}</p>

              {/* Answer boxes */}
              <div className="grid gap-3">
                {/* User answer */}
                <div
                  className="p-4 rounded-xl flex justify-between items-start gap-4"
                  style={{
                    background: q.type === "essay" ? (isSpecialEssay ? "rgb(234 179 8 / 0.08)" : "rgb(99 102 241 / 0.08)") : q.isCorrect ? "rgb(34 197 94 / 0.08)" : "rgb(239 68 68 / 0.08)",
                    border:     q.type === "essay" ? (isSpecialEssay ? "1px solid rgb(234 179 8 / 0.25)" : "1px solid rgb(99 102 241 / 0.20)") : q.isCorrect ? "1px solid rgb(34 197 94 / 0.20)" : "1px solid rgb(239 68 68 / 0.20)",
                    color:      q.type === "essay" ? (isSpecialEssay ? "#fef08a" : "#c7d2fe") : q.isCorrect ? "#86efac" : "#fca5a5",
                  }}
                >
                  <div className="w-full">
                    <span className="text-[10px] font-black uppercase tracking-wider block mb-2" style={{ opacity: 0.6 }}>{t("review.yourAnswer")}</span>
                    <div className="font-black text-base leading-snug">{formatAnswer(q.userAnswer, q.type)}</div>
                  </div>
                  <div className="shrink-0 mt-1">
                    {q.type === "essay" ? (isSpecialEssay ? <span className="text-2xl">🌟</span> : <Type size={22} />) : q.isCorrect ? <CheckCircle size={22} /> : <XCircle size={22} />}
                  </div>
                </div>

                {/* Correct answer (if wrong, non-essay) */}
                {!q.isCorrect && q.type !== "essay" && (
                  <div
                    className="p-4 rounded-xl flex justify-between items-start gap-4"
                    style={{ background: S800, border: `1px solid ${S700}`, color: S300 }}
                  >
                    <div className="w-full">
                      <span className="text-[10px] font-black uppercase tracking-wider block mb-2" style={{ color: S600 }}>{t("review.correctAnswer")}</span>
                      <div className="font-black text-base leading-snug" style={{ color: "#4ade80" }}>{formatAnswer(q.correct, q.type)}</div>
                    </div>
                    <CheckCircle size={22} style={{ color: "#4ade80", flexShrink: 0, marginTop: 4 }} />
                  </div>
                )}

                {/* AI Feedback */}
                {q.type === "essay" && q.aiData && (
                  <div
                    className="mt-2 p-5 rounded-2xl relative overflow-hidden"
                    style={{
                      background: isSpecialEssay ? "rgb(234 179 8 / 0.07)" : "rgb(99 102 241 / 0.07)",
                      border:     isSpecialEssay ? "1px solid rgb(234 179 8 / 0.25)" : `1px solid rgb(99 102 241 / 0.20)`,
                    }}
                  >
                    <div className="absolute top-0 right-0 p-4 pointer-events-none" style={{ opacity: 0.06, color: isSpecialEssay ? "#fbbf24" : BRAND }}>
                      <Swords size={60} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1" style={{ color: isSpecialEssay ? "#fbbf24" : BRAND }}>
                          <Swords size={11} /> AI Assessment
                        </span>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-black"
                          style={{
                            background: isSpecialEssay ? "rgb(234 179 8 / 0.15)" : q.aiData.score >= 70 ? "rgb(34 197 94 / 0.12)" : "rgb(249 115 22 / 0.12)",
                            color:      isSpecialEssay ? "#fbbf24"             : q.aiData.score >= 70 ? "#4ade80"                 : "#fb923c",
                            border:     isSpecialEssay ? "1px solid rgb(234 179 8 / 0.30)" : q.aiData.score >= 70 ? "1px solid rgb(34 197 94 / 0.20)" : "1px solid rgb(249 115 22 / 0.20)",
                          }}
                        >
                          Score: {q.aiData.score.toFixed(1)}
                        </span>
                      </div>
                      <p className="font-medium italic leading-relaxed text-sm" style={{ color: isSpecialEssay ? "#fef08a" : "#c7d2fe" }}>
                        "{q.aiData.feedback}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hint */}
              {q.hint && (
                <div
                  className="mt-4 p-3 text-sm rounded-xl flex gap-2 items-start"
                  style={{ background: "rgb(245 158 11 / 0.08)", color: "#fcd34d", border: "1px solid rgb(245 158 11 / 0.20)" }}
                >
                  <span className="mt-0.5">💡</span>
                  <div>
                    <span className="font-black text-[10px] uppercase tracking-wider block mb-1" style={{ opacity: 0.7 }}>{t("review.explanation")}</span>
                    {q.hint}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ReviewPage;
