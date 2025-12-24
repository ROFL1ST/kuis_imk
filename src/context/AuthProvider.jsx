import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI, notificationAPI } from "../services/api";
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser as saveUser,
} from "../services/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { EventSourcePolyfill } from "event-source-polyfill"; // Pastikan import ini ada
import LogoLoader from "../components/ui/LogoLoader";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [token, setTokenState] = useState(getToken());

  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Fungsi fetch notifikasi (Initial Load)
  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await notificationAPI.getList();
      // Hitung manual client-side
      const count = res.data.data.filter((n) => !n.is_read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Gagal load notifikasi:", error);
    }
  };

  // Fungsi refresh profile
  const refreshProfile = async () => {
    try {
      const res = await authAPI.authMe();
      const { user: updatedUser } = res.data.data;

      // Update state & local storage
      setUser(updatedUser);
      saveUser(updatedUser);
    } catch (error) {
      console.error("Gagal refresh profile:", error);
    }
  };

  // --- LOGIC STREAM NOTIFIKASI ---
  useEffect(() => {
    let eventSource = null;
    const savedSettings = localStorage.getItem("settings_notifications");
    const isNotifEnabled =
      savedSettings !== null ? JSON.parse(savedSettings) : true;

    if (token) {
      // Load data awal
      fetchUnreadCount();
      refreshProfile();

      if (isNotifEnabled) {
        const baseURL =
          import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        const url = `${baseURL}/notifications/stream`;

        // [UPDATE] Gunakan EventSourcePolyfill & Header Authorization
        // Tidak perlu document.cookie lagi
        eventSource = new EventSourcePolyfill(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          heartbeatTimeout: 120000, // Timeout 2 menit
        });

        eventSource.onmessage = (event) => {
          // Abaikan keepalive ping
          if (event.data === ":keepalive") return;

          try {
            const data = JSON.parse(event.data);

            // Update Counter Realtime (+1)
            setUnreadCount((prev) => prev + 1);

            // Tampilkan Toast
            toast(
              (t) => (
                <div
                  onClick={() => {
                    toast.dismiss(t.id);
                    if (data.link) navigate(data.link);
                    else navigate("/notifications");
                  }}
                  className="cursor-pointer flex items-center gap-3 w-full"
                >
                  <span className="text-xl">
                    {data.type === "success"
                      ? "🎉"
                      : data.type === "warning"
                      ? "⚠️"
                      : "🔔"}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800">
                      {data.title || "Notifikasi Baru"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {data.message}
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
                  border: "1px solid #f1f5f9",
                  padding: "12px",
                  borderRadius: "16px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                },
              }
            );
          } catch (e) {
            console.error("Gagal parse notifikasi:", e);
          }
        };

        eventSource.onerror = (err) => {
          // Silent error agar tidak spam console jika koneksi putus/token expired
          if (err?.status === 401) {
            // Opsional: logout() jika token expired
          }
          eventSource.close();
        };
      }
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [token, navigate]);

  // Init Auth
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

      const { token: newToken, user: newUser, streak_message } = res.data.data;

      setTokenState(newToken);
      setUser(newUser);
      setToken(newToken);
      saveUser(newUser);

      return {
        success: true,
        streakMessage: streak_message,
      };
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
    setUnreadCount(0);
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
    unreadCount,
    refreshNotifications: fetchUnreadCount,
    refreshProfile,
  };

  if (loading) {
    return <LogoLoader />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
