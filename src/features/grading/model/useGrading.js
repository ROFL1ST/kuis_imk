import { useState, useCallback, useMemo } from 'react';

/**
 * Manages state for the ASAG grading view.
 * Abstracts all API calls — containers/UI never call fetch directly.
 *
 * Usage:
 *   const { submissions, activeSubmission, loadSubmissions, gradeSubmission, ... } = useGrading(quizId);
 */
export function useGrading(quizId) {
  const [submissions, setSubmissions] = useState([]);
  const [activeId, setActiveId]       = useState(null);
  const [status, setStatus]           = useState('idle'); // 'idle' | 'loading' | 'grading' | 'error'
  const [error, setError]             = useState(null);

  const loadSubmissions = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      // Replace with real gradingService call
      // const data = await gradingService.getSubmissions(quizId);
      const data = [];
      setSubmissions(data);
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [quizId]);

  const gradeSubmission = useCallback(async (submissionId, manualScore = null) => {
    setStatus('grading');
    try {
      // Replace with real gradingService call
      // const updated = await gradingService.grade(submissionId, manualScore);
      const updated = { id: submissionId, status: 'graded', manualScore };
      setSubmissions(prev =>
        prev.map(s => (s.id === submissionId ? { ...s, ...updated } : s))
      );
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  const activeSubmission = useMemo(
    () => submissions.find(s => s.id === activeId) ?? null,
    [submissions, activeId]
  );

  return {
    submissions,
    activeSubmission,
    activeId,
    setActiveId,
    status,
    error,
    loadSubmissions,
    gradeSubmission,
  };
}
