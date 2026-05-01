// src/features/quiz/ui/GradingReviewPage.jsx
// Premium ASAG grading result page.
// Visualises Sentence-BERT cosine similarity score with a data-viz bar,
// side-by-side answer comparison, and token-level keyword highlighting.
import { useState } from 'react';
import {
  Brain, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Sparkles, Info,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function scoreTier(score) {
  if (score >= 0.85) return { label: 'Sangat Baik', color: 'teal',   icon: CheckCircle2 };
  if (score >= 0.65) return { label: 'Baik',        color: 'green',  icon: CheckCircle2 };
  if (score >= 0.45) return { label: 'Cukup',       color: 'yellow', icon: AlertTriangle };
  return                    { label: 'Perlu Belajar',color: 'red',   icon: XCircle     };
}

const TIER_CLASSES = {
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-300',   text: 'text-teal-700',   bar: 'bg-teal-500'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-700',  bar: 'bg-green-500'  },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  red:    { bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-600',    bar: 'bg-red-500'    },
};

// ---------------------------------------------------------------------------
// SBertScoreGauge — main visual: animated score bar + circular dial
// ---------------------------------------------------------------------------
function SBertScoreGauge({ score }) {
  const pct     = Math.round(score * 100);
  const tier    = scoreTier(score);
  const cls     = TIER_CLASSES[tier.color];
  const TierIcon= tier.icon;

  // Score spectrum stops (reference labels)
  const stops = [
    { pct: 0,   label: '0' },
    { pct: 45,  label: '45' },
    { pct: 65,  label: '65' },
    { pct: 85,  label: '85' },
    { pct: 100, label: '100' },
  ];

  return (
    <div className={cn(
      'rounded-2xl border p-5 space-y-4',
      cls.bg, cls.border
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shadow-xs">
            <Brain size={16} className={cls.text} />
          </div>
          <div>
            <p className="text-xs font-semibold text-ink">Sentence-BERT Similarity</p>
            <p className="text-2xs text-ghost">Cosine similarity vs. referensi</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-3xl font-display font-bold tabular-nums', cls.text)}>
            {pct}<span className="text-lg font-normal">%</span>
          </p>
          <div className={cn(
            'inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full mt-0.5',
            cls.bg, cls.text, 'border', cls.border
          )}>
            <TierIcon size={10} />
            {tier.label}
          </div>
        </div>
      </div>

      {/* Score spectrum bar */}
      <div className="space-y-1.5">
        <div className="relative h-3 rounded-full overflow-hidden"
             style={{ background: 'linear-gradient(90deg,#EF4444 0%,#F97316 22%,#EAB308 44%,#22C55E 66%,#0D9488 100%)' }}>
          {/* Indicator needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-panel
                       transition-all duration-700"
            style={{ left: `calc(${pct}% - 1px)` }}
          />
          {/* Score fill overlay (darkened left side) */}
          <div
            className="absolute top-0 bottom-0 right-0 bg-black/20
                       transition-all duration-700"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Axis labels */}
        <div className="relative h-4">
          {stops.map((s) => (
            <span
              key={s.pct}
              className="absolute -translate-x-1/2 text-2xs text-ghost font-mono"
              style={{ left: `${s.pct}%` }}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* Zone labels */}
        <div className="flex text-2xs font-medium mt-1">
          <span className="flex-[45] text-red-500">Rendah</span>
          <span className="flex-[20] text-center text-yellow-600">Cukup</span>
          <span className="flex-[20] text-center text-green-600">Baik</span>
          <span className="flex-[15] text-right text-teal-600">Sangat Baik</span>
        </div>
      </div>

      {/* Info tooltip */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/60 border border-white/80">
        <Info size={12} className="text-ghost mt-0.5 shrink-0" />
        <p className="text-2xs text-sub leading-relaxed">
          Skor dihitung menggunakan model <strong>Sentence-BERT</strong> yang mengukur
          kemiripan semantik antara jawabanmu dan jawaban referensi.
          Skor ≥ 65 dianggap memadai.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Answer comparison panel
// ---------------------------------------------------------------------------
function AnswerComparison({ studentAnswer, referenceAnswer }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {/* Student answer */}
      <div className="rounded-xl border border-ring bg-surface p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-400" />
          <p className="text-xs font-semibold text-sub uppercase tracking-wider">Jawabanmu</p>
        </div>
        <p className="text-sm text-ink leading-relaxed">{studentAnswer}</p>
      </div>

      {/* Reference answer */}
      <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <p className="text-xs font-semibold text-sub uppercase tracking-wider">Jawaban Referensi</p>
        </div>
        <p className="text-sm text-ink leading-relaxed">{referenceAnswer}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Keyword match chip row
// ---------------------------------------------------------------------------
function KeywordMatches({ matched = [], missing = [] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-sub">Kata Kunci Terdeteksi</p>
      <div className="flex flex-wrap gap-1.5">
        {matched.map((kw) => (
          <span key={kw}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                       bg-green-100 text-green-700 text-2xs font-semibold border border-green-200">
            <CheckCircle2 size={10} /> {kw}
          </span>
        ))}
        {missing.map((kw) => (
          <span key={kw}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                       bg-red-50 text-red-500 text-2xs font-semibold border border-red-200">
            <XCircle size={10} /> {kw}
          </span>
        ))}
      </div>
      {missing.length > 0 && (
        <p className="text-2xs text-ghost">
          Kata kunci yang hilang perlu dimasukkan untuk meningkatkan skor.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single question result card
// ---------------------------------------------------------------------------
function QuestionResultCard({ result, index }) {
  const [open, setOpen] = useState(index === 0);
  const { question, studentAnswer, referenceAnswer, score,
          feedback, matchedKeywords, missingKeywords } = result;
  const isASAG = result.type === 'essay' || result.type === 'short_answer';
  const tier   = scoreTier(score);
  const cls    = TIER_CLASSES[tier.color];

  return (
    <div className="rounded-2xl border border-ring bg-surface shadow-xs overflow-hidden">
      {/* Accordion header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left
                   hover:bg-canvas transition-colors"
      >
        {/* Score badge */}
        <span className={cn(
          'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center',
          'text-sm font-display font-bold tabular-nums',
          cls.bg, cls.text, 'border', cls.border
        )}>
          {Math.round(score * 100)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink truncate">
            {index + 1}. {question}
          </p>
          <p className={cn('text-2xs font-medium mt-0.5', cls.text)}>
            {tier.label} &bull; {isASAG ? 'ASAG' : 'MCQ'}
          </p>
        </div>

        {open
          ? <ChevronUp size={16} className="text-ghost shrink-0" />
          : <ChevronDown size={16} className="text-ghost shrink-0" />}
      </button>

      {/* Accordion body */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-ring">
          {isASAG && score !== undefined && (
            <div className="pt-4">
              <SBertScoreGauge score={score} />
            </div>
          )}

          {isASAG && (
            <AnswerComparison
              studentAnswer={studentAnswer}
              referenceAnswer={referenceAnswer}
            />
          )}

          {(matchedKeywords?.length > 0 || missingKeywords?.length > 0) && (
            <KeywordMatches
              matched={matchedKeywords}
              missing={missingKeywords}
            />
          )}

          {feedback && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg
                             bg-brand-50 border border-brand-100">
              <Sparkles size={13} className="text-brand-500 mt-0.5 shrink-0" />
              <p className="text-xs text-brand-800 leading-relaxed">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary header cards
// ---------------------------------------------------------------------------
function SummaryCards({ results = [] }) {
  const total    = results.length;
  const asagR    = results.filter((r) => r.type === 'essay' || r.type === 'short_answer');
  const avgScore = asagR.length
    ? asagR.reduce((s, r) => s + (r.score ?? 0), 0) / asagR.length
    : null;
  const passed   = results.filter((r) => (r.score ?? 0) >= 0.65).length;

  const stats = [
    { label: 'Total Soal',      value: total,                         unit: '' },
    { label: 'Avg. Similarity', value: avgScore !== null ? `${Math.round(avgScore * 100)}` : '—', unit: avgScore !== null ? '%' : '' },
    { label: 'Soal Lulus',      value: passed,                        unit: `/${total}` },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label}
          className="bg-surface border border-ring rounded-xl p-4 text-center shadow-xs">
          <p className="text-2xl font-display font-bold text-ink tabular-nums">
            {s.value}<span className="text-sm font-normal text-ghost">{s.unit}</span>
          </p>
          <p className="text-2xs text-ghost mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export function GradingReviewPage({ results = [], quizTitle = 'Quiz', onRetry, onHome }) {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Page header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                          bg-brand-100 text-brand-700 text-2xs font-semibold mb-3">
            <Brain size={11} />
            Hasil Grading AI
          </div>
          <h1 className="text-xl font-display font-bold text-ink">{quizTitle}</h1>
          <p className="text-sm text-sub mt-1">
            Berikut analisis Sentence-BERT untuk setiap jawabanmu.
          </p>
        </div>

        {/* Summary cards */}
        <SummaryCards results={results} />

        {/* Question results */}
        <div className="space-y-3">
          {results.map((r, i) => (
            <QuestionResultCard key={r.id ?? i} result={r} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3 pt-2">
          {onHome && (
            <button
              onClick={onHome}
              className="flex-1 py-3 rounded-xl border border-ring text-sm font-semibold
                         text-sub hover:border-brand-300 hover:text-brand-700
                         hover:bg-brand-50 transition-all"
            >
              Kembali ke Dashboard
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-3 rounded-xl bg-brand-gradient text-white text-sm
                         font-semibold shadow-card hover:shadow-panel
                         hover:scale-[1.02] transition-all"
            >
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
