import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI, notificationAPI } from "../services/api";
import { getUser, setUser as saveUser, removeToken } from "../services/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { EventSourcePolyfill } from "event-source-polyfill";
import LogoLoader from "../components/ui/LogoLoader";
import { aiService } from "../services/aiService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());

  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [MlService, setMlService] = useState(false);


  const fetchMlService = async () => {
    try {
      const res = await aiService.health();
      console.log(res)
      setMlService(res.status === "running");
    } catch (error) {
      console.error("Gagal load ml service:", error);
    }
  };
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getList();
      const count = res.data.data.filter((n) => !n.is_read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Gagal load notifikasi:", error);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authAPI.authMe();
      const { user: updatedUser } = res.data.data;
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

    if (user) {
      fetchUnreadCount();
      fetchMlService();
      if (isNotifEnabled) {
        // Gunakan relative URL /api/* agar lewat Vite proxy (dev) atau Vercel proxy (prod)
        // X-API-KEY diinject oleh proxy — tidak perlu dikirim dari frontend
        eventSource = new EventSourcePolyfill("/api/notifications/stream", {
          withCredentials: true,
          heartbeatTimeout: 120000,
        });

        eventSource.onmessage = (event) => {
          if (event.data === ":keepalive") return;
          try {
            const data = JSON.parse(event.data);
            setUnreadCount((prev) => prev + 1);
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
                    <p className="font-bold text-sm" style={{ color: "var(--color-surface-100)" }}>
                      {data.title || "Notifikasi Baru"}
                    </p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--color-surface-400)" }}>
                      {data.message}
                    </p>
                  </div>
                </div>
              ),
              {
                duration: 5000,
                position: "top-center",
              },
            );
          } catch (e) {
            console.error("Gagal parse notifikasi:", e);
          }
        };

        eventSource.onerror = (err) => {
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
  }, [user?.id, navigate]);

  // Init Auth - Validasi Session via Cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authAPI.authMe();
        const { user: newUser } = res.data.data;
        setUser(newUser);
        saveUser(newUser);
      } catch (error) {
        setUser(null);
        removeToken();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authAPI.login(credentials);
      const { user: newUser, streak_message } = res.data.data;
      setUser(newUser);
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

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error("Logout failed", e);
    }
    setUser(null);
    setUnreadCount(0);
    removeToken();
    window.location.href = "/login";
  };

  const updateUser = (userData) => {
    setUser(userData);
    saveUser(userData);
  };

  const value = {
    user,
    setUser: updateUser,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    unreadCount,
    refreshNotifications: fetchUnreadCount,
    refreshProfile,
  };

  if (loading) {
    return <LogoLoader />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
