import axios from "axios";

/**
 * Centralized Axios API Client — QuizzApp Indo
 *
 * Base URL is /api — proxied to the backend in development (via vite.config.js),
 * and resolved to the real backend URL in production via VITE_API_URL.
 *
 * SECURITY: No API keys live here or anywhere in the frontend.
 * All third-party service keys (SBERT, etc.) are stored on the backend only.
 */
const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor: Attach JWT auth token ────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Normalize errors globally ───────────────
apiClient.interceptors.response.use(
  // On success: unwrap .data so callers don't need response.data
  (response) => response.data,

  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "An unexpected error occurred.";

    // Auto-logout on 401 Unauthorized (expired/invalid token)
    if (status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    // Return a normalized, predictable error shape
    return Promise.reject({
      status,
      message,
      raw: error,
    });
  }
);

export default apiClient;
