import { CheckCircle, XCircle, AlertCircle, Sparkles } from "lucide-react";

/**
 * ScoreArc — SVG semi-circle gauge for SBERT similarity score.
 * Score range: 0.0 – 1.0
 */
function ScoreArc({ score }) {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = Math.PI * r; // half-circle arc length
  const offset = circumference * (1 - Math.max(0, Math.min(1, score)));

  const color =
    score >= 0.75 ? "#22c55e"
    : score >= 0.5  ? "#f59e0b"
    : "#ef4444";

  return (
    <svg
      width="140"
      height="80"
      viewBox="0 0 140 80"
      className="overflow-visible"
      aria-label={`Similarity score: ${Math.round(score * 100)}%`}
    >
      {/* Background track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#1e293b"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Filled score arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
      />
      {/* Score percentage */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="white"
        style={{ fontSize: 22, fontWeight: 700, fontFamily: "Inter, sans-serif" }}
      >
        {Math.round(score * 100)}%
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="#94a3b8"
        style={{ fontSize: 10 }}
      >
        similarity
      </text>
    </svg>
  );
}

/**
 * Verdict badge — shows Correct / Partial / Incorrect based on score.
 */
function Verdict({ score }) {
  if (score >= 0.75)
    return (
      <div className="flex items-center gap-2" style={{ color: "var(--color-success)" }}>
        <CheckCircle size={18} />
        <span className="font-semibold text-sm">Correct</span>
      </div>
    );
  if (score >= 0.5)
    return (
      <div className="flex items-center gap-2" style={{ color: "var(--color-warning)" }}>
        <AlertCircle size={18} />
        <span className="font-semibold text-sm">Partially Correct</span>
      </div>
    );
  return (
    <div className="flex items-center gap-2" style={{ color: "var(--color-danger)" }}>
      <XCircle size={18} />
      <span className="font-semibold text-sm">Incorrect</span>
    </div>
  );
}

/**
 * GradingResult — Full ASAG result card.
 * Displays score arc, verdict, answer comparison, and AI feedback.
 *
 * @param {string} studentAnswer
 * @param {string} referenceAnswer
 * @param {number} score          - 0.0 to 1.0 (SBERT cosine similarity)
 * @param {string} [feedback]     - Optional AI-generated feedback text
 */
export function GradingResult({ studentAnswer, referenceAnswer, score, feedback }) {
  const barColor =
    score >= 0.75
      ? "linear-gradient(90deg, #22c55e, #86efac)"
      : score >= 0.5
      ? "linear-gradient(90deg, #f59e0b, #fcd34d)"
      : "linear-gradient(90deg, #ef4444, #fca5a5)";

  return (
    <div className="card-solid p-6 space-y-5">
      {/* Header */}
      <div
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--color-asag)" }}
      >
        <Sparkles size={14} />
        AI Grading Result — Sentence-BERT
      </div>

      {/* Score + Answer comparison */}
      <div className="flex gap-6 items-start">
        {/* Score arc */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <ScoreArc score={score} />
          <Verdict score={score} />
        </div>

        {/* Answers */}
        <div className="flex-1 space-y-3 min-w-0">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-surface-500)" }}>
              Your Answer
            </p>
            <p className="text-sm leading-relaxed line-clamp-4" style={{ color: "var(--color-surface-200)" }}>
              {studentAnswer}
            </p>
          </div>
          <div
            className="pt-3 space-y-1"
            style={{ borderTop: "1px solid var(--color-surface-800)" }}
          >
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-surface-500)" }}>
              Reference Answer
            </p>
            <p
              className="text-sm leading-relaxed line-clamp-4 italic"
              style={{ color: "var(--color-surface-400)" }}
            >
              {referenceAnswer}
            </p>
          </div>
        </div>
      </div>

      {/* Similarity progress bar */}
      <div
        className="rounded-lg p-3 space-y-2"
        style={{ background: "rgb(30 41 59 / 0.50)" }}
      >
        <div
          className="flex justify-between text-xs"
          style={{ color: "var(--color-surface-400)" }}
        >
          <span>Semantic Distance</span>
          <span className="tabular-nums">{(score * 100).toFixed(1)}% match</span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--color-surface-800)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${score * 100}%`, background: barColor }}
          />
        </div>
      </div>

      {/* AI feedback */}
      {feedback && (
        <p
          className="text-xs leading-relaxed rounded-lg px-4 py-3"
          style={{
            color: "var(--color-surface-400)",
            background: "rgb(30 41 59 / 0.40)",
            borderLeft: "2px solid var(--color-brand-500)",
          }}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
