// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI } from "../services/api";
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser as saveUser,
} from "../services/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [token, setTokenState] = useState(getToken());
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let eventSource = null;

    const savedSettings = localStorage.getItem("settings_notifications");
    const isNotifEnabled = savedSettings !== null ? JSON.parse(savedSettings) : true;

    if (token && isNotifEnabled) {
      const baseURL =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const url = `${baseURL}/notifications/stream?token=${token}`;

      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          toast(
            (t) => (
              <div
                onClick={() => {
                  toast.dismiss(t.id);
                  if (data.url) navigate(data.url);
                }}
                className="cursor-pointer flex items-center gap-2 w-full"
              >
                <span className="text-lg">
                  {data.type === "success"
                    ? "🎉"
                    : data.type === "warning"
                    ? "⚔️"
                    : "🔔"}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{data.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Klik untuk melihat
                  </p>
                </div>
              </div>
            ),
            {
              duration: 5000,
              position: "top-center",
              style: {
                background: "#fff",
                color: "#333",
                border: "1px solid #e2e8f0",
                padding: "12px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }
          );
        } catch (e) {
          console.error("Gagal parse notifikasi:", e);
        }
      };

      eventSource.onerror = (err) => {
        eventSource.close();
      };
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [token, navigate]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();

      if (storedToken) {
        try {
          const res = await authAPI.authMe();
          const { token: newToken, user: newUser } = res.data.data;

          setTokenState(newToken);
          setUser(newUser);
          setToken(newToken);
          saveUser(newUser);
        } catch (error) {
          console.error("Sesi tidak valid:", error);
          logout();
        }
      } else {
        logout();
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authAPI.login(credentials);
      const { token: newToken, user: newUser } = res.data.data;

      setTokenState(newToken);
      setUser(newUser);
      setToken(newToken);
      saveUser(newUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login gagal",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setTokenState(null);
    setUser(null);
    removeToken();
  };

  const updateUser = (userData) => {
    setUser(userData);
    saveUser(userData);
  };

  const value = {
    user,
    setUser: updateUser,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};