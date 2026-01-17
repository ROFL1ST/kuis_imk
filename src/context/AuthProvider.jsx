import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI, notificationAPI } from "../services/api";
import { getUser, setUser as saveUser, removeToken } from "../services/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { EventSourcePolyfill } from "event-source-polyfill"; // Pastikan import ini ada
import LogoLoader from "../components/ui/LogoLoader";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());

  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Fungsi fetch notifikasi (Initial Load)
  const fetchUnreadCount = async () => {
    if (!user) return; // Check user instead of token
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

    if (user) {
      // Load data notifikasi awal
      fetchUnreadCount();
      // refreshProfile(); // <--- REMOVED: Redundant and causes infinite loop with initAuth

      if (isNotifEnabled) {
        const baseURL =
          import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        const url = `${baseURL}/notifications/stream`;

        // [UPDATE] Gunakan EventSourcePolyfill
        // Cookie otomatis terkirim jika withCredentials: true
        eventSource = new EventSourcePolyfill(url, {
          withCredentials: true,
          heartbeatTimeout: 120000,
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
    // Depend on user.id/username instead of the whole object to prevent deep equal issues,
    // although removing refreshProfile should fix the main loop.
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
        // Silent fail (not logged in or session expired)
        setUser(null);
        removeToken(); // Clears user from LS
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

      // Backend sets cookie automatically
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
    removeToken(); // Clears user from LS
    window.location.href = "/login"; // Force reload to clear any memory states
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
    isAuthenticated: !!user, // Check user object existence
    unreadCount,
    refreshNotifications: fetchUnreadCount,
    refreshProfile,
  };

  if (loading) {
    return <LogoLoader />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
