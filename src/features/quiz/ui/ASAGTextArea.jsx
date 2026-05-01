import { useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const statusConfig = {
  idle:  { bar: 'bg-ring',        icon: null,         text: 'text-ghost'   },
  warn:  { bar: 'bg-amber-400',   icon: AlertCircle,  text: 'text-amber-600' },
  error: { bar: 'bg-red-500',     icon: AlertCircle,  text: 'text-red-500'  },
  ok:    { bar: 'bg-emerald-500', icon: CheckCircle2, text: 'text-emerald-600' },
};

/**
 * Premium ASAG text area — purely presentational.
 * All logic lives in useASAGAnswer hook.
 */
export function ASAGTextArea({
  value,
  onChange,
  wordCount,
  charCount,
  charsRemaining,
  validation,
  questionNumber,
  totalQuestions,
  disabled = false,
}) {
  const textareaRef = useRef(null);

  // Auto-resize to content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const cfg = statusConfig[validation.status];
  const StatusIcon = cfg.icon;
  const fillPct = Math.min(100, (wordCount / 200) * 100);

  return (
    <div className="space-y-3">

      {/* Header label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ink flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full
                           bg-brand-50 text-brand-600 text-2xs font-semibold tabular">
            {questionNumber}
          </span>
          Your Answer
        </label>
        <span className="text-xs text-sub tabular">
          {questionNumber}/{totalQuestions}
        </span>
      </div>

      {/* Textarea wrapper */}
      <div className={cn(
        'relative rounded-xl border bg-surface transition-all duration-150',
        validation.status === 'error'
          ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.10)]'
          : validation.status === 'ok'
          ? 'border-emerald-400 shadow-[0_0_0_3px_rgba(5,150,105,0.08)]'
          : 'border-ring focus-within:border-brand-400 focus-within:shadow-[0_0_0_3px_rgba(79,84,216,0.10)]'
      )}>

        {/* Top progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl overflow-hidden">
          <div
            className={cn('h-full transition-all duration-500', cfg.bar)}
            style={{ width: `${fillPct}%` }}
          />
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder="Write your answer here. Be specific and explain your reasoning…"
          className={cn(
            'w-full min-h-[160px] resize-none bg-transparent rounded-xl',
            'px-4 pt-5 pb-3 text-sm text-ink leading-relaxed',
            'placeholder:text-ghost',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-150'
          )}
          aria-label="Short answer input"
          aria-describedby="asag-meta"
        />

        {/* Bottom meta bar */}
        <div
          id="asag-meta"
          className="flex items-center justify-between px-4 py-2
                     border-t border-ring/60 bg-canvas/40 rounded-b-xl"
        >
          <div className={cn('flex items-center gap-1.5 text-xs', cfg.text)}>
            {StatusIcon && <StatusIcon size={13} strokeWidth={2.5} />}
            <span>{validation.message || 'Aim for 10–200 words'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs tabular text-ghost">
            <span>
              <span className={cn(wordCount > 0 ? 'text-sub' : '')}>{wordCount}</span> words
            </span>
            <span className="text-ring">|</span>
            <span className={cn(charsRemaining < 100 ? 'text-amber-500' : '')}>
              {charsRemaining} chars left
            </span>
          </div>
        </div>
      </div>

      {/* Tip */}
      <p className="flex items-start gap-1.5 text-xs text-ghost">
        <Info size={12} className="mt-0.5 shrink-0" />
        Your answer is graded by an AI model (Sentence-BERT) that measures semantic
        similarity to the reference. Write clearly — paraphrasing is fine.
      </p>
    </div>
  );
}
