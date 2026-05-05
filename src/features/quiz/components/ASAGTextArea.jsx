import { useState } from "react";
import { clsx } from "clsx";
import { Sparkles } from "lucide-react";

const MAX_WORDS = 200;

function countWords(str) {
  return str.trim() === "" ? 0 : str.trim().split(/\s+/).length;
}

/**
 * ASAGTextArea — Professional short-answer input for AI grading.
 * Features: word/char counter, progress bar, over-limit warning.
 *
 * @param {string}   value      - Controlled input value
 * @param {function} onChange   - Value change handler (string) => void
 * @param {boolean}  disabled   - Disable input (e.g. after submission)
 * @param {string}   [placeholder]
 */
export function ASAGTextArea({
  value,
  onChange,
  disabled = false,
  placeholder = "Write your answer here. Be specific and use your own words — the AI evaluates meaning, not just keywords.",
}) {
  const wordCount = countWords(value);
  const charCount = value.length;
  const isOverLimit = wordCount > MAX_WORDS;
  const isNearLimit = wordCount > MAX_WORDS * 0.85;
  const progressPct = Math.min((wordCount / MAX_WORDS) * 100, 100);

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-surface-200">
          Your Answer
        </label>
        <span
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            color: "var(--color-asag)",
            background: "rgb(6 182 212 / 0.10)",
            border: "1px solid rgb(6 182 212 / 0.20)",
          }}
        >
          <Sparkles size={10} />
          AI-Graded
        </span>
      </div>

      {/* Textarea container */}
      <div
        className={clsx(
          "relative rounded-[var(--radius-card)] border transition-all duration-200",
          isOverLimit
            ? "border-danger/60"
            : "border-surface-700 focus-within:border-brand-500"
        )}
        style={isOverLimit
          ? { boxShadow: "0 0 0 1px rgb(239 68 68 / 0.30)" }
          : undefined
        }
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={6}
          placeholder={placeholder}
          className={clsx(
            "w-full resize-none bg-transparent px-4 pt-4 pb-12 text-sm leading-relaxed",
            "text-surface-50 placeholder:text-surface-600",
            "focus:outline-none rounded-[var(--radius-card)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Bottom status bar */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 rounded-b-[var(--radius-card)]"
          style={{ borderTop: "1px solid var(--color-surface-800)" }}
        >
          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div
              className="h-1 w-24 rounded-full overflow-hidden"
              style={{ background: "var(--color-surface-800)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                  background: isOverLimit
                    ? "var(--color-danger)"
                    : isNearLimit
                    ? "var(--color-warning)"
                    : "var(--color-brand-500)",
                }}
              />
            </div>
            <span
              className="text-xs tabular-nums font-medium"
              style={{
                color: isOverLimit
                  ? "var(--color-danger)"
                  : "var(--color-surface-500)",
              }}
            >
              {wordCount} / {MAX_WORDS} words
            </span>
          </div>
          <span className="text-xs tabular-nums" style={{ color: "var(--color-surface-600)" }}>
            {charCount} chars
          </span>
        </div>
      </div>

      {/* Over-limit warning */}
      {isOverLimit && (
        <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-danger)" }}>
          <span>⚠</span> Answer exceeds the {MAX_WORDS}-word limit.
        </p>
      )}
    </div>
  );
}
