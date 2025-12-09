import axios from "axios";
import { getToken, removeToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
console.log("API Base URL:", BASE_URL);
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor Request: Sisipkan Token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor Response: Handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);



// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post("/login", credentials),
  register: (userData) => api.post("/register", userData),
  adminLogin: (credentials) => api.post("/admin/login", credentials), //
};

// Topic & Quiz Endpoints
export const topicAPI = {
  getAllTopics: () => api.get("/topics"), //
  getQuizzesBySlug: (slug) => api.get(`/topics/${slug}/quizzes`), //
};

// Gameplay Endpoints
export const quizAPI = {
  getQuestions: (quizId) => api.get(`/quizzes/${quizId}/questions`), //
  submitScore: (historyData) => api.post("/history", historyData), //
  getMyHistory: () => api.get("/history"), //
  getHistoryById: (historyId) => api.get(`/history/${historyId}`), //
};

// Social & Leaderboard Endpoints
export const socialAPI = {
  getFriends: () => api.get("/friends"),
  getFriendRequests: () => api.get("/friends/requests"),
  getSentRequests: () => api.get("/friends/sent"), // <--- BARU: Ambil request terkirim
  
  addFriend: (username) => api.post("/friends/request", { username }),
  confirmFriend: (requesterId) => api.post("/friends/confirm", { requester_id: requesterId }),
  refuseFriend: (requesterId) => api.post("/friends/refuse", { requester_id: requesterId }),
  
  removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
  cancelRequest: (friendId) => api.delete(`/friends/cancel/${friendId}`), // <--- BARU: Cancel request
  
  getLeaderboard: (slug) => api.get(`/leaderboard/${slug}`),
};

export default api;