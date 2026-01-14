import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
  CheckCheck, // Icon baru untuk Read All
  Clock,
} from "lucide-react";
import { notificationAPI } from "../../services/api";
import { getToken } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import { useLanguage } from "../../context/LanguageContext"; // Fixed import

const Notifications = () => {
  const { t } = useLanguage();
  const [notifs, setNotifs] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // State Broadcasts
  const [activeTab, setActiveTab] = useState("notifications"); // Tab State
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  useEffect(() => {
    document.title = t("notifications.title") + " | QuizApp";
  }, [t]);

  // 1. Fetch Notifikasi Awal
  const fetchNotifs = async () => {
    try {
      const res = await notificationAPI.getList();
      setNotifs(res.data.data);
    } catch (error) {
      console.error("Gagal load notifikasi", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Broadcasts
  const fetchAnnouncements = async () => {
    try {
      const res = await notificationAPI.getAnnouncements();
      setAnnouncements(res.data.data || []);
    } catch (error) {
      console.error("Failed fetch announcements", error);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  // Polling Realtime Broadcasts (Every 15s) only when tab is active
  useEffect(() => {
    if (activeTab === "broadcasts") {
      fetchAnnouncements(); // Fetch immediately on switch
      const interval = setInterval(fetchAnnouncements, 15000); // 15s Polling
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // 2. Logic Realtime Stream (SSE)
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax`;

    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/notifications/stream`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      if (event.data === ":keepalive") return;
      try {
        const newNotif = JSON.parse(event.data);
        setNotifs((prev) => [newNotif, ...prev]);
        toast(newNotif.message, {
          icon: getStyle(newNotif.type).icon,
          duration: 4000,
          position: "top-right",
        });
      } catch (err) {
        console.error("Error parsing realtime notif:", err);
      }
    };

    eventSource.onerror = (err) => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
      document.cookie = "token=; path=/; max-age=0";
    };
  }, []);

  // Handler: Tandai SATU sudah dibaca
  const handleMarkRead = async (id, link) => {
    try {
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await notificationAPI.markRead(id);
      if (link) navigate(link);
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Tandai SEMUA sudah dibaca
  const handleMarkAllRead = async () => {
    // Cek apakah ada yang belum dibaca agar tidak spam API
    const hasUnread = notifs.some((n) => !n.is_read);
    if (!hasUnread) {
      toast(t("notifications.allReadSuccess"));
      return;
    }

    try {
      // Optimistic Update
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));

      await notificationAPI.markAllRead();
      toast.success(t("notifications.markedAllRead"));
    } catch (err) {
      console.error(err);
      toast.error(t("notifications.failedClear")); // Reusing failed message generic
      // Revert/Fetch ulang jika gagal (optional)
      fetchNotifs();
    }
  };

  // Handler: Hapus Semua
  const handleClearAll = async () => {
    try {
      await notificationAPI.clearAll();
      setNotifs([]);
      toast.success(t("notifications.clearedSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("notifications.failedClear"));
    } finally {
      setConfirmModal({ isOpen: false });
    }
  };

  const getStyle = (type) => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle size={20} className="text-green-500" />,
          bg: "bg-green-50 border-green-100",
        };
      case "warning":
        return {
          icon: <AlertTriangle size={20} className="text-orange-500" />,
          bg: "bg-orange-50 border-orange-100",
        };
      case "error":
        return {
          icon: <X size={20} className="text-red-500" />,
          bg: "bg-red-50 border-red-100",
        };
      default:
        return {
          icon: <Info size={20} className="text-blue-500" />,
          bg: "bg-blue-50 border-blue-100",
        };
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return t("notifications.time.justNow");
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}${t("notifications.time.mAgo")}`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}${t(
        "notifications.time.hAgo"
      )}`;
    return `${Math.floor(diffInSeconds / 86400)}${t(
      "notifications.time.dAgo"
    )}`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" /> {/* Judul */}
          <Skeleton className="h-8 w-24 rounded-lg" /> {/* Mark all read */}
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl"
            >
              {/* Icon Type (Info/Warning/Success) */}
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

              <div className="flex-1 space-y-2">
                {/* Pesan Notif */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                {/* Waktu */}
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 py-6 md:py-8 pb-20"
    >
      {/* --- HEADER (Responsive) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {t("notifications.title")}
            </h1>
            <p className="text-slate-500 text-xs md:text-sm">
              {t("notifications.subtitle")}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === "notifications"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("notifications.tabs.notif")}
          </button>
          <button
            onClick={() => setActiveTab("broadcasts")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "broadcasts"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("notifications.tabs.broadcast")}{" "}
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
              {t("notifications.tabs.live")}
            </span>
          </button>
        </div>

        {/* Action Buttons (Only for Notifs) */}
        {activeTab === "notifications" && notifs.length > 0 && (
          <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto">
            {/* Tombol Baca Semua */}
            <button
              onClick={handleMarkAllRead}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs md:text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition border border-indigo-100"
            >
              <CheckCheck size={16} />
              <span className="whitespace-nowrap">
                {t("notifications.readAll")}
              </span>
            </button>

            {/* Tombol Hapus */}
            <button
              onClick={() => setConfirmModal({ isOpen: true })}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs md:text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition border border-red-100"
            >
              <Trash2 size={16} />
              <span>{t("notifications.clear")}</span>
            </button>
          </div>
        )}
      </div>

      {/* --- LIST NOTIFIKASI --- */}
      {activeTab === "notifications" ? (
        <div className="space-y-3">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-center px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Bell size={28} />
              </div>
              <h3 className="font-bold text-slate-700 text-base md:text-lg">
                {t("notifications.emptyTitle")}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                {t("notifications.emptyDesc")}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {notifs.map((n) => {
                const style = getStyle(n.type);
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleMarkRead(n.id, n.link)}
                    className={`relative p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-md active:scale-[0.99] ${
                      n.is_read
                        ? "bg-white border-slate-100 opacity-80"
                        : `border-transparent shadow-sm ${style.bg}`
                    }`}
                  >
                    <div className="flex gap-3 md:gap-4">
                      {/* Icon */}
                      <div
                        className={`mt-0.5 flex-shrink-0 ${
                          n.is_read ? "grayscale opacity-50" : ""
                        }`}
                      >
                        {style.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {" "}
                        {/* min-w-0 prevents flex items from overflowing */}
                        <div className="flex justify-between items-start gap-2">
                          <h4
                            className={`font-bold text-sm md:text-base truncate w-full ${
                              n.is_read ? "text-slate-600" : "text-slate-800"
                            }`}
                          >
                            {n.title}
                          </h4>
                          {!n.is_read && (
                            <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 animate-pulse mt-1.5"></span>
                          )}
                        </div>
                        <p
                          className={`text-xs md:text-sm mt-1 leading-relaxed line-clamp-2 md:line-clamp-none ${
                            n.is_read ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {n.message}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full w-fit">
                            <Clock size={10} /> {timeAgo(n.CreatedAt)}
                          </span>
                          {n.link && (
                            <span className="text-[10px] md:text-xs font-bold text-indigo-500 hover:underline">
                              {t("notifications.open")} &rarr;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      ) : (
        /* --- LIST BROADCASTS --- */
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-center px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Bell size={28} />
              </div>
              <h3 className="font-bold text-slate-700 text-base md:text-lg">
                {t("notifications.emptyBroadcastTitle")}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                {t("notifications.emptyBroadcastDesc")}
              </p>
            </div>
          ) : (
            announcements.map((ann) => {
              // Reuse getStyle logic or simplified version
              let icon, borderColor, bgIcon, textIcon, stripeColor;
              switch (ann.type) {
                case "success":
                  borderColor = "border-green-100";
                  stripeColor = "bg-green-500";
                  bgIcon = "bg-green-50";
                  textIcon = "text-green-600";
                  icon = <CheckCircle size={20} />;
                  break;
                case "warning":
                  borderColor = "border-orange-100";
                  stripeColor = "bg-orange-500";
                  bgIcon = "bg-orange-50";
                  textIcon = "text-orange-600";
                  icon = <AlertTriangle size={20} />;
                  break;
                case "danger":
                  borderColor = "border-red-100";
                  stripeColor = "bg-red-500";
                  bgIcon = "bg-red-50";
                  textIcon = "text-red-600";
                  icon = <AlertTriangle size={20} />;
                  break;
                default:
                  borderColor = "border-indigo-100";
                  stripeColor = "bg-indigo-500";
                  bgIcon = "bg-indigo-50";
                  textIcon = "text-indigo-600";
                  icon = <Bell size={20} />;
                  break;
              }

              return (
                <div
                  key={ann.id}
                  className={`bg-white p-5 rounded-2xl border ${borderColor} shadow-sm relative overflow-hidden`}
                >
                  <div
                    className={`absolute top-0 left-0 w-1 h-full ${stripeColor}`}
                  ></div>
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 ${bgIcon} p-2 rounded-full h-fit ${textIcon}`}
                    >
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 text-lg">
                          {ann.title}
                        </h4>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} /> {timeAgo(ann.CreatedAt)}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-2 leading-relaxed text-sm">
                        {ann.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- MODAL CONFIRM DELETE --- */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        maxWidth="max-w-xs md:max-w-sm"
      >
        <div className="text-center p-2">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {t("notifications.confirmClearTitle")}
          </h3>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            {t("notifications.confirmClearDesc")}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmModal({ isOpen: false })}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
            >
              {t("modals.cancel")}
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition text-sm"
            >
              {t("notifications.clear")}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Notifications;
