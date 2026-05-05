import axios from "axios";
import api from "./api";

/**
 * ═══════════════════════════════════════════════════════════
 *  QuizzApp Indo — AI Service
 *  Frontend never calls SBERT/AI directly.
 *  All AI requests are proxied through OUR backend.
 *  Backend holds SBERT_API_KEY securely in server .env.
 * ═══════════════════════════════════════════════════════════
 */

// ── Original aiService object (preserved — used by AuthProvider, QuizPlay) ──
export const aiService = {
  translate: async (text, targetLang) => {
    try {
      const response = await api.post("/ai/translate", {
        text,
        target_lang: targetLang,
      });
      return response.data;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  },

  translateBulk: async (items, targetLang) => {
    try {
      const response = await api.post("/ai/translate-bulk", {
        items,
        target_lang: targetLang,
      });
      return response.data;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  },

  health: async () => {
    try {
      // NOTE: VITE_ML_URL should only be a URL, never a secret key
      const response = await axios.get(import.meta.env.VITE_ML_URL);
      return response.data;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  },

  // ── ASAG: Automated Short Answer Grading ──────────────────────────
  // Sends student answer to OUR backend, which calls SBERT internally
  gradeShortAnswer: async (questionId, studentAnswer) => {
    try {
      const response = await api.post("/grading/asag", {
        questionId,
        studentAnswer,
      });
      return response.data;
    } catch (error) {
      console.error("ASAG Grading Error:", error);
      throw error;
    }
  },

  getGradingReview: async (sessionId) => {
    try {
      const response = await api.get(`/grading/review/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Grading Review Error:", error);
      throw error;
    }
  },
};
