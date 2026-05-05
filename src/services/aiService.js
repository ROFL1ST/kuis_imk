import apiClient from "./api";

/**
 * AI / ASAG Service — QuizzApp Indo
 *
 * The frontend NEVER calls the SBERT/AI service directly.
 * All AI requests go to OUR backend, which securely holds the API keys
 * in its own server-side environment variables.
 *
 * Data flow:
 *   Browser → /api/grading/asag  →  [Backend]  →  SBERT Service
 */

/**
 * Submit a short-answer for Automated Short Answer Grading (ASAG).
 *
 * @param {string} questionId  - The quiz question ID
 * @param {string} studentAnswer - The student's free-text response
 * @returns {Promise<{ score: number, feedback: string, referenceAnswer: string }>}
 */
export async function gradeShortAnswer(questionId, studentAnswer) {
  return apiClient.post("/grading/asag", {
    questionId,
    studentAnswer,
  });
}

/**
 * Fetch a quiz session (questions + metadata) by quiz ID.
 *
 * @param {string} quizId
 * @returns {Promise<{ quiz: object, questions: Array }>}
 */
export async function fetchQuizSession(quizId) {
  return apiClient.get(`/quiz/${quizId}/session`);
}

/**
 * Submit all answers for a completed quiz session.
 *
 * @param {string} quizId
 * @param {Array<{ questionId: string, answer: string }>} answers
 * @returns {Promise<{ sessionId: string, totalScore: number, results: Array }>}
 */
export async function submitQuizSession(quizId, answers) {
  return apiClient.post(`/quiz/${quizId}/submit`, { answers });
}

/**
 * Fetch the grading review for a completed session.
 *
 * @param {string} sessionId
 * @returns {Promise<Array<{ questionId, studentAnswer, referenceAnswer, score, feedback }>>}
 */
export async function fetchGradingReview(sessionId) {
  return apiClient.get(`/grading/review/${sessionId}`);
}
