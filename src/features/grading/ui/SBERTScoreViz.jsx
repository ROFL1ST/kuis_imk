import { useMemo } from 'react';
import { BrainCircuit, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/**
 * Data-visualization component for Sentence-BERT cosine similarity scores.
 *
 * Props:
 *   score: number (0.0 – 1.0)
 *   referenceAnswer: string
 *   studentAnswer: string
 */
export function SBERTScoreViz({ score, referenceAnswer, studentAnswer }) {
  const zone = useMemo(() => {
    if (score >= 0.85) return { label: 'Excellent match', color: 'teal',    Icon: CheckCircle2,  grade: 'A' };
    if (score >= 0.65) return { label: 'Good match',      color: 'emerald', Icon: CheckCircle2,  grade: 'B' };
    if (score >= 0.40) return { label: 'Partial match',   color: 'amber',   Icon: AlertTriangle, grade: 'C' };
    return               { label: 'Low similarity',    color: 'red',     Icon: XCircle,       grade: 'D' };
  }, [score]);

  const pct = Math.round(score * 100);
  const markerPos = `${pct}%`;

  const zoneStyles = {
    teal:    { badge: 'bg-teal-50 text-teal-700 border-teal-200',       ring: 'ring-teal-200',    numBg: 'bg-teal-50 text-teal-700 border-teal-300'    },
    emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'ring-emerald-200', numBg: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    amber:   { badge: 'bg-amber-50 text-amber-700 border-amber-200',    ring: 'ring-amber-200',   numBg: 'bg-amber-50 text-amber-700 border-amber-300'   },
    red:     { badge: 'bg-red-50 text-red-700 border-red-200',          ring: 'ring-red-200',     numBg: 'bg-red-50 text-red-700 border-red-300'         },
  };
  const st = zoneStyles[zone.color];

  return (
    <div className="card p-5 space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50">
          <BrainCircuit size={18} className="text-brand-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">Sentence-BERT Similarity</h3>
          <p className="text-xs text-ghost">Cosine similarity of semantic embeddings</p>
        </div>
      </div>

      {/* Main score display */}
      <div className="flex items-end gap-4">
        <div
          className={cn(
            'flex items-center justify-center w-20 h-20 rounded-2xl border-2 font-mono font-semibold tabular',
            'text-2xl ring-4 transition-all duration-500',
            st.ring,
            st.numBg
          )}
        >
          {score.toFixed(2)}
        </div>
        <div className="flex-1 space-y-1">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
              'text-xs font-semibold border',
              st.badge
            )}
          >
            <zone.Icon size={12} strokeWidth={2.5} />
            Grade {zone.grade} — {zone.label}
          </span>
          <p className="text-xs text-sub">
            {pct}th percentile of expected similarity for this question
          </p>
        </div>
      </div>

      {/* Score spectrum bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-2xs text-ghost tabular">
          <span>0.0</span>
          <span>0.40</span>
          <span>0.65</span>
          <span>0.85</span>
          <span>1.0</span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden bg-ring">
          <div className="absolute inset-0 bg-score-gradient opacity-80" />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                       w-4 h-4 rounded-full bg-white border-2 border-ink/30
                       shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-all duration-700"
            style={{ left: markerPos }}
            role="presentation"
          />
        </div>
        <div className="grid grid-cols-4 gap-px">
          {[
            { range: '0–0.40',    label: 'Low',       active: pct < 40,              clr: 'text-red-500'     },
            { range: '0.40–0.65', label: 'Partial',   active: pct >= 40 && pct < 65, clr: 'text-amber-500'   },
            { range: '0.65–0.85', label: 'Good',      active: pct >= 65 && pct < 85, clr: 'text-emerald-500' },
            { range: '0.85–1.0',  label: 'Excellent', active: pct >= 85,             clr: 'text-teal-500'    },
          ].map((z) => (
            <div
              key={z.range}
              className={cn(
                'text-center text-2xs py-1 px-1 rounded',
                z.active ? `${z.clr} font-semibold bg-canvas` : 'text-ghost'
              )}
            >
              <div className="font-mono">{z.range}</div>
              <div>{z.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer comparison */}
      <div className="grid grid-cols-1 gap-3 pt-1">
        <AnswerBlock label="Reference Answer" text={referenceAnswer} variant="reference" />
        <AnswerBlock label="Your Answer"       text={studentAnswer}   variant="student"   />
      </div>

      {/* Disclaimer */}
      <p className="flex items-start gap-1.5 text-2xs text-ghost leading-relaxed">
        <Info size={11} className="mt-0.5 shrink-0" />
        Scores above 0.65 are generally considered a correct response. Your teacher may
        override this score after manual review.
      </p>
    </div>
  );
}

function AnswerBlock({ label, text, variant }) {
  const styles = {
    reference: 'bg-brand-50/60 border-brand-200/60',
    student:   'bg-canvas border-ring',
  };
  return (
    <div className={cn('rounded-lg border p-3 space-y-1', styles[variant])}>
      <p className="text-2xs font-semibold uppercase tracking-widest text-ghost">{label}</p>
      <p className="text-sm text-ink leading-relaxed">{text}</p>
    </div>
  );
}
