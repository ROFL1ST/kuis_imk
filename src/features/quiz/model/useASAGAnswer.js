import { useState, useCallback, useMemo } from 'react';

const MIN_WORDS = 10;
const MAX_WORDS = 200;
const MAX_CHARS = 1200;

/**
 * Encapsulates all ASAG textarea logic: word count, char count, validation.
 * The UI component (ASAGTextArea) is purely presentational — reads props only.
 */
export function useASAGAnswer() {
  const [answer, setAnswer] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const words = useMemo(() => {
    const trimmed = answer.trim();
    return trimmed === '' ? [] : trimmed.split(/\s+/);
  }, [answer]);

  const wordCount = words.length;
  const charCount = answer.length;
  const charsRemaining = MAX_CHARS - charCount;

  const validation = useMemo(() => {
    if (!isDirty) return { status: 'idle', message: '' };
    if (wordCount < MIN_WORDS)
      return {
        status: 'warn',
        message: `${MIN_WORDS - wordCount} more word${MIN_WORDS - wordCount > 1 ? 's' : ''} needed`,
      };
    if (wordCount > MAX_WORDS)
      return { status: 'error', message: `Exceeds maximum ${MAX_WORDS} words` };
    return { status: 'ok', message: 'Length looks good' };
  }, [wordCount, isDirty]);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setAnswer(val);
      setIsDirty(true);
    }
  }, []);

  const reset = useCallback(() => {
    setAnswer('');
    setIsDirty(false);
  }, []);

  return {
    answer,
    wordCount,
    charCount,
    charsRemaining,
    validation,
    handleChange,
    reset,
    isSubmittable: validation.status === 'ok',
  };
}
