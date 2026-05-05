import axios from "axios";

/**
 * ═══════════════════════════════════════════════════════════
 *  QuizzApp Indo — Centralized API Client
 *
 *  SECURITY ARCHITECTURE:
 *  Frontend → /api/* → Vercel Proxy (api/proxy.js) → Backend
 *
 *  X-API-KEY di-inject oleh Vercel proxy di server-side.
 *  Frontend tidak menyimpan atau mengirim API key sama sekali.
 *  API_KEY disimpan di Vercel Environment Variables (bukan VITE_*).
 * ═══════════════════════════════════════════════════════════
 */

const api = axios.create({
  /**
   * Di production (Vercel): /api → Vercel proxy → backend
   * Di development (local): /api → vite.config.js proxy → localhost:8080
   * Tidak perlu baseURL absolut — relative URL cukup.
   */
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    // ❌ X-API-KEY dihapus dari sini
    // ✅ Vercel proxy (api/proxy.js) yang inject X-API-KEY server-side
  },
});

// ── Request Interceptor: Attach JWT jika ada ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Redirect ke /login saat 401 ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post("/login", credentials),
  register: (userData) => api.post("/register", userData),
  adminLogin: (credentials) => api.post("/admin/login", credentials),
  logout: () => api.post("/logout"),
  authMe: () => api.get("/auth/me"),
};

// ── Topic & Quiz ─────────────────────────────────────────────────────
export const topicAPI = {
  getAllTopics: () => api.get("/topics"),
  getQuizzesBySlug: (slug) => api.get(`/topics/${slug}/quizzes`),
};

export const quizAPI = {
  getQuestions: (quizId) => api.get(`/quizzes/${quizId}/questions`),
  getNextAdaptiveQuestion: (data) => api.post("/quiz/adaptive/next", data),
  submitScore: (historyData) => api.post("/history", historyData),
  getMyHistory: (page = 1, limit = 10) =>
    api.get(`/history?page=${page}&limit=${limit}`),
  getHistoryById: (historyId) => api.get(`/history/${historyId}`),
  getRemedial: () => api.get("/quizzes/remedial/start"),
  getCommunityQuizzes: () => api.get("/community/quizzes"),
  getMyCommunityQuizzes: () => api.get("/community/quizzes/my"),
  createCommunityQuiz: (data) => api.post("/community/quizzes", data),
};

// ── Social & Leaderboard ─────────────────────────────────────────────
export const socialAPI = {
  getFriends: () => api.get("/friends"),
  getFriendRequests: () => api.get("/friends/requests"),
  getSentRequests: () => api.get("/friends/sent"),
  addFriend: (username) => api.post("/friends/request", { username }),
  confirmFriend: (requesterId) =>
    api.post("/friends/confirm", { requester_id: requesterId }),
  refuseFriend: (requesterId) =>
    api.post("/friends/refuse", { requester_id: requesterId }),
  removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
  cancelRequest: (friendId) => api.delete(`/friends/cancel/${friendId}`),
  getLeaderboard: (slug) => api.get(`/leaderboard/${slug}`),
  getFeed: () => api.get("/feed"),
  createChallenge: (data) => api.post("/challenges", data),
  getMyChallenges: (page = 1, limit = 10) =>
    api.get(`/challenges?page=${page}&limit=${limit}`),
  acceptChallenge: (challengeId) =>
    api.post(`/challenges/${challengeId}/accept`),
  refuseChallenge: (challengeId) =>
    api.post(`/challenges/${challengeId}/refuse`),
  startGame: (challengeId) => api.post(`/challenges/${challengeId}/start`),
  postProgress: (challengeId, progressData) =>
    api.post(`/challenges/${challengeId}/progress`, progressData),
  leaveLobby: (id) => api.post(`/challenges/${id}/leave`),
  joinChallengeByCode: (roomCode) =>
    api.post("/challenges/join", { room_code: roomCode }),
  updateLobbySettings: (id, data) =>
    api.put(`/challenges/${id}/settings`, data),
  generateRoomCode: (id) => api.post(`/challenges/${id}/code`),
  inviteToLobby: (challengeId, username) =>
    api.post(`/challenges/${challengeId}/invite`, { username }),
};

// ── User Profile ─────────────────────────────────────────────────────
export const userAPI = {
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  shareProfile: () => api.post(`/users/share`),
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.put("/users/me", data),
  getUserProfile: (username) => api.get(`/users/${username}`),
  getAchievements: () => api.get("/users/achievements"),
  getSmartAnalytics: () => api.get("/users/analytics/smart"),
  getActivityCalendar: () => api.get("/users/activity/calendar"),
};

// ── Standalone helpers ──────────────────────────────────────────────
export const updateProfile = async (data) => {
  const response = await api.put("/users/me", data);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.post("/verify-email", { token });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post("/reset-password", {
    token,
    new_password: newPassword,
  });
  return response.data;
};

// ── Notifications ─────────────────────────────────────────────────────
export const notificationAPI = {
  getList: () => api.get("/notifications"),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
  clearAll: () => api.delete("/notifications"),
  getAnnouncements: () => api.get("/announcements"),
};

// ── Shop ──────────────────────────────────────────────────────────────
export const shopAPI = {
  getItems: () => api.get("/shop/items"),
  buyItem: (itemId) => api.post("/shop/buy", { item_id: itemId }),
  getInventory: () => api.get("/shop/inventory"),
  equipItem: (itemId) => api.post("/shop/equip", { item_id: itemId }),
};

// ── Daily Missions ───────────────────────────────────────────────────
export const dailyAPI = {
  getInfo: () => api.get("/daily/info"),
  claimLogin: () => api.post("/daily/claim-login"),
  claimMission: (missionId) =>
    api.post("/daily/claim-mission", { mission_id: missionId }),
};

// ── Translation ───────────────────────────────────────────────────────
export const translationAPI = {
  getPublic: () => api.get("/public/translations"),
  sync: (data) => api.post("/admin/translations/sync", data),
};

// ── ASAG Grading ───────────────────────────────────────────────────
export const gradingAPI = {
  gradeShortAnswer: (questionId, studentAnswer) =>
    api.post("/grading/asag", { questionId, studentAnswer }),
  getReview: (sessionId) => api.get(`/grading/review/${sessionId}`),
};

export default api;
