// src/features/quiz/ui/QuizPlay.jsx
// Premium ASAG (Automated Short Answer Grading) quiz play view.
// Handles both MCQ and short-answer (essay) question types.
import { useState, useRef, useEffect } from 'react';
import {
  Clock, ChevronRight, ChevronLeft, Send,
  CheckCircle2, AlertCircle, BookOpen, Lightbulb,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function useCountdown(seconds) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const pct  = Math.round((timeLeft / seconds) * 100);
  const danger = timeLeft < 60;
  return { mins, secs, pct, danger, timeLeft };
}

function wordCount(str) {
  return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
}

// ---------------------------------------------------------------------------
// Timer ring
// ---------------------------------------------------------------------------
function TimerRing({ pct, mins, secs, danger }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="60" height="60" className="-rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" strokeWidth="3"
          className="stroke-ring" />
        <circle cx="30" cy="30" r={r} fill="none" strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-1000',
            danger ? 'stroke-red-500' : 'stroke-brand-500'
          )}
        />
      </svg>
      <span className={cn(
        'absolute text-xs font-mono font-semibold tabular-nums',
        danger ? 'text-red-600' : 'text-ink'
      )}>
        {mins}:{secs}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MCQ option grid
// ---------------------------------------------------------------------------
const OPTION_KEYS = ['A', 'B', 'C', 'D'];
function MCQOptionGrid({ options = [], selected, onSelect, submitted }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
      {options.map((opt, i) => {
        const key    = OPTION_KEYS[i];
        const isSel  = selected === key;
        const isCorr = submitted && opt.correct;
        const isWrong= submitted && isSel && !opt.correct;
        return (
          <button
            key={key}
            onClick={() => !submitted && onSelect(key)}
            disabled={submitted}
            className={cn(
              'group relative flex items-start gap-3 w-full text-left',
              'px-4 py-3.5 rounded-xl border transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
              !submitted && !isSel &&
                'border-ring bg-surface hover:border-brand-300 hover:bg-brand-50 hover:shadow-card',
              !submitted && isSel &&
                'border-brand-500 bg-brand-50 shadow-[0_0_0_3px_rgba(79,77,232,0.12)]',
              isCorr &&
                'border-green-500 bg-green-50',
              isWrong &&
                'border-red-400 bg-red-50',
            )}
          >
            <span className={cn(
              'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
              'text-xs font-bold transition-colors',
              !submitted && !isSel && 'bg-canvas text-sub group-hover:bg-brand-100 group-hover:text-brand-700',
              !submitted && isSel  && 'bg-brand-500 text-white',
              isCorr  && 'bg-green-500 text-white',
              isWrong && 'bg-red-400  text-white',
            )}>
              {key}
            </span>
            <span className="text-sm text-ink leading-snug pt-0.5">{opt.text}</span>
            {isCorr  && <CheckCircle2 size={16} className="absolute right-3 top-3.5 text-green-500" />}
            {isWrong && <AlertCircle  size={16} className="absolute right-3 top-3.5 text-red-400"  />}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ASAG textarea with word/char counter
// ---------------------------------------------------------------------------
function ASAGTextarea({ value, onChange, minWords = 10, maxChars = 500, disabled }) {
  const words   = wordCount(value);
  const chars   = value.length;
  const tooShort= words < minWords && value.length > 0;
  const atLimit = chars >= maxChars;

  return (
    <div className="mt-6 space-y-2">
      <label className="text-sm font-medium text-ink">
        Jawaban Kamu
        <span className="ml-2 text-2xs font-normal text-ghost">
          (min. {minWords} kata)
        </span>
      </label>

      {/* Textarea wrapper */}
      <div className={cn(
        'relative rounded-xl border-2 transition-all duration-200',
        'bg-surface shadow-xs',
        disabled
          ? 'border-ring opacity-60'
          : tooShort
            ? 'border-yellow-400 focus-within:border-yellow-500'
            : value.length > 0
              ? 'border-green-400 focus-within:border-green-500'
              : 'border-ring focus-within:border-brand-400 focus-within:shadow-focus',
      )}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
          disabled={disabled}
          placeholder="Tuliskan jawabanmu di sini..."
          rows={6}
          className="w-full px-4 py-3.5 bg-transparent resize-none
                     text-sm text-ink placeholder:text-ghost
                     focus:outline-none leading-relaxed
                     rounded-xl"
          aria-describedby="asag-stats"
        />

        {/* Gradient fade at bottom */}
        {!disabled && (
          <div className="absolute bottom-0 left-0 right-0 h-6 rounded-b-xl
                          pointer-events-none
                          bg-gradient-to-t from-surface to-transparent" />
        )}
      </div>

      {/* Stats row */}
      <div id="asag-stats" className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          {/* Word count pill */}
          <span className={cn(
            'inline-flex items-center gap-1.5 text-2xs font-medium px-2 py-0.5 rounded-full',
            words >= minWords
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          )}>
            <span className="font-mono font-bold">{words}</span>
            <span>/ {minWords}+ kata</span>
          </span>

          {tooShort && (
            <span className="text-2xs text-yellow-600">
              Tambah {minWords - words} kata lagi
            </span>
          )}
        </div>

        {/* Char counter */}
        <span className={cn(
          'text-2xs font-mono tabular-nums',
          atLimit ? 'text-red-500 font-semibold' : 'text-ghost'
        )}>
          {chars}/{maxChars}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------
function QuizProgress({ current, total }) {
  const pct = Math.round(((current) / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ghost font-medium tabular-nums w-12 text-right">
        {current}/{total}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-ring overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-gradient transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-ghost font-mono w-8">{pct}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main QuizPlay component
// ---------------------------------------------------------------------------
export function QuizPlay({
  quiz,            // { title, description, questions: [...] }
  onSubmitAnswer,  // (questionId, answer) => Promise<void>
  onFinish,        // () => void
  totalSeconds = 1800,
}) {
  const questions = quiz?.questions ?? [];
  const [index, setIndex]       = useState(0);
  const [answers, setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState({});
  const [hint, setHint]         = useState(false);
  const { mins, secs, pct, danger } = useCountdown(totalSeconds);
  const textareaRef = useRef(null);

  const q = questions[index];
  if (!q) return null;

  const isASAG  = q.type === 'essay' || q.type === 'short_answer';
  const isMCQ   = q.type === 'mcq';
  const ans     = answers[q.id] ?? '';
  const isDone  = !!submitted[q.id];
  const isLast  = index === questions.length - 1;
  const canSubmit = isASAG
    ? wordCount(ans) >= (q.minWords ?? 10)
    : !!ans;

  function handleAnswer(val) {
    setAnswers((a) => ({ ...a, [q.id]: val }));
  }

  async function handleSubmitQuestion() {
    if (!canSubmit) return;
    await onSubmitAnswer?.(q.id, ans);
    setSubmitted((s) => ({ ...s, [q.id]: true }));
    setHint(false);
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md
                         border-b border-ring/70 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ghost truncate mb-1">{quiz?.title}</p>
            <QuizProgress current={index + 1} total={questions.length} />
          </div>
          <TimerRing pct={pct} mins={mins} secs={secs} danger={danger} />
        </div>
      </header>

      {/* ── Question body ── */}
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Question number + type badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700
                             text-2xs font-semibold uppercase tracking-wider">
              {isASAG ? 'Essay ASAG' : 'Pilihan Ganda'}
            </span>
            <span className="text-2xs text-ghost">
              Soal {index + 1} dari {questions.length}
            </span>
            {q.points && (
              <span className="ml-auto text-2xs font-semibold text-brand-600
                               bg-brand-50 px-2 py-0.5 rounded-full">
                {q.points} poin
              </span>
            )}
          </div>

          {/* Question card */}
          <div className="bg-surface rounded-2xl border border-ring shadow-card p-6">
            <p className="text-base font-semibold text-ink leading-relaxed">
              {q.text}
            </p>

            {/* MCQ */}
            {isMCQ && (
              <MCQOptionGrid
                options={q.options}
                selected={ans}
                onSelect={handleAnswer}
                submitted={isDone}
              />
            )}

            {/* ASAG */}
            {isASAG && (
              <ASAGTextarea
                value={ans}
                onChange={handleAnswer}
                minWords={q.minWords ?? 10}
                maxChars={q.maxChars ?? 500}
                disabled={isDone}
              />
            )}

            {/* Hint toggle */}
            {q.hint && !isDone && (
              <div className="mt-4">
                <button
                  onClick={() => setHint((h) => !h)}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-600
                             hover:text-brand-800 transition-colors"
                >
                  <Lightbulb size={13} />
                  {hint ? 'Sembunyikan petunjuk' : 'Tampilkan petunjuk'}
                </button>
                {hint && (
                  <div className="mt-2 px-3 py-2.5 rounded-lg bg-yellow-50
                                   border border-yellow-200 text-xs text-yellow-800
                                   leading-relaxed">
                    {q.hint}
                  </div>
                )}
              </div>
            )}

            {/* ASAG submitted feedback */}
            {isASAG && isDone && (
              <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-lg
                               bg-green-50 border border-green-200">
                <CheckCircle2 size={15} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-800">
                  Jawaban terkirim. Sedang dianalisis oleh AI grader...
                </p>
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-between mt-6">
            {/* Back */}
            <button
              onClick={() => { setIndex((i) => i - 1); setHint(false); }}
              disabled={index === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                         border border-ring text-sm text-sub font-medium
                         hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all"
            >
              <ChevronLeft size={16} />
              Sebelumnya
            </button>

            <div className="flex items-center gap-2">
              {/* Submit question */}
              {!isDone && (
                <button
                  onClick={handleSubmitQuestion}
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl
                             bg-brand-gradient text-white text-sm font-semibold
                             shadow-card hover:shadow-panel hover:scale-[1.02]
                             disabled:opacity-40 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:shadow-card
                             transition-all"
                >
                  <Send size={15} />
                  Kirim Jawaban
                </button>
              )}

              {/* Next / Finish */}
              {isDone && (
                <button
                  onClick={isLast ? onFinish : () => { setIndex((i) => i + 1); setHint(false); }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl
                             bg-brand-gradient text-white text-sm font-semibold
                             shadow-card hover:shadow-panel hover:scale-[1.02] transition-all"
                >
                  {isLast ? (
                    <><BookOpen size={15} /> Lihat Hasil</>
                  ) : (
                    <>Lanjut <ChevronRight size={16} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
