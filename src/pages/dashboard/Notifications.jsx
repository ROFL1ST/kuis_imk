// src/pages/dashboard/Notifications.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCircle, AlertTriangle, Info, X,
  Trash2, CheckCheck, Clock,
} from "lucide-react";
import { notificationAPI } from "../../services/api";
import { getToken } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import { useLanguage } from "../../context/LanguageContext";
import { EventSourcePolyfill } from "event-source-polyfill";

const Notifications = () => {
  const { t } = useLanguage();
  const [notifs, setNotifs]           = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab]     = useState("notifications");
  const [loading, setLoading]         = useState(true);
  const navigate                      = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  useEffect(() => { document.title = t("notifications.title") + " | QuizApp"; }, [t]);

  const fetchNotifs = async () => {
    try {
      const res = await notificationAPI.getList();
      setNotifs(res.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await notificationAPI.getAnnouncements();
      setAnnouncements(res.data.data || []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  useEffect(() => {
    if (activeTab === "broadcasts") {
      fetchAnnouncements();
      const interval = setInterval(fetchAnnouncements, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    const eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_API_URL}/notifications/stream`,
      { headers: { "X-API-KEY": import.meta.env.VITE_API_KEY }, withCredentials: true, heartbeatTimeout: 120000 }
    );
    eventSource.onmessage = (event) => {
      if (event.data === ":keepalive") return;
      try {
        const newNotif = JSON.parse(event.data);
        setNotifs((prev) => [newNotif, ...prev]);
        toast(newNotif.message, { icon: getStyle(newNotif.type).icon, duration: 4000, position: "top-right" });
      } catch (err) { console.error(err); }
    };
    eventSource.onerror = () => eventSource.close();
    return () => { eventSource.close(); document.cookie = "token=; path=/; max-age=0"; };
  }, []);

  const handleMarkRead = async (id, link) => {
    try {
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      await notificationAPI.markRead(id);
      if (link) navigate(link);
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    const hasUnread = notifs.some((n) => !n.is_read);
    if (!hasUnread) { toast(t("notifications.allReadSuccess")); return; }
    try {
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await notificationAPI.markAllRead();
      toast.success(t("notifications.markedAllRead"));
    } catch (err) {
      toast.error(t("notifications.failedClear"));
      fetchNotifs();
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationAPI.clearAll();
      setNotifs([]);
      toast.success(t("notifications.clearedSuccess"));
    } catch (err) { toast.error(t("notifications.failedClear")); }
    finally { setConfirmModal({ isOpen: false }); }
  };

  /* ── Style helpers ─────────────────────────────────────── */
  const getStyle = (type) => {
    switch (type) {
      case "success": return {
        icon: <CheckCircle size={18} style={{ color: "#4ade80" }} />,
        bg: { background: "rgb(34 197 94 / 0.08)", border: "1px solid rgb(34 197 94 / 0.20)" },
        stripe: "#4ade80",
        iconBox: { background: "rgb(34 197 94 / 0.12)", color: "#4ade80" },
      };
      case "warning": return {
        icon: <AlertTriangle size={18} style={{ color: "#fb923c" }} />,
        bg: { background: "rgb(249 115 22 / 0.08)", border: "1px solid rgb(249 115 22 / 0.20)" },
        stripe: "#fb923c",
        iconBox: { background: "rgb(249 115 22 / 0.12)", color: "#fb923c" },
      };
      case "error":
      case "danger": return {
        icon: <X size={18} style={{ color: "#f87171" }} />,
        bg: { background: "rgb(239 68 68 / 0.08)", border: "1px solid rgb(239 68 68 / 0.20)" },
        stripe: "#f87171",
        iconBox: { background: "rgb(239 68 68 / 0.12)", color: "#f87171" },
      };
      default: return {
        icon: <Info size={18} style={{ color: "#60a5fa" }} />,
        bg: { background: "rgb(59 130 246 / 0.08)", border: "1px solid rgb(59 130 246 / 0.20)" },
        stripe: "#60a5fa",
        iconBox: { background: "rgb(59 130 246 / 0.12)", color: "#60a5fa" },
      };
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)    return t("notifications.time.justNow");
    if (diff < 3600)  return `${Math.floor(diff / 60)}${t("notifications.time.mAgo")}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t("notifications.time.hAgo")}`;
    return `${Math.floor(diff / 86400)}${t("notifications.time.dAgo")}`;
  };

  /* ── Skeleton ─────────────────────────────────────────── */
  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-2xl" style={{ background: "var(--color-surface-900)", border: "1px solid var(--color-surface-800)" }}>
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Main ─────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 py-6 md:py-8 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">

        {/* Title */}
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl shrink-0"
            style={{ background: "rgb(99 102 241 / 0.12)", color: "var(--color-brand-400)" }}
          >
            <Bell size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black" style={{ color: "var(--color-surface-50)" }}>
              {t("notifications.title")}
            </h1>
            <p className="text-xs" style={{ color: "var(--color-surface-500)" }}>
              {t("notifications.subtitle")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex p-1 rounded-xl"
          style={{ background: "var(--color-surface-800)" }}
        >
          <button
            onClick={() => setActiveTab("notifications")}
            className="px-4 py-2 rounded-lg text-sm font-black transition-all"
            style={
              activeTab === "notifications"
                ? { background: "var(--color-surface-700)", color: "var(--color-brand-300)", boxShadow: "0 2px 8px rgb(0 0 0 / 0.20)" }
                : { color: "var(--color-surface-500)" }
            }
          >
            {t("notifications.tabs.notif")}
          </button>
          <button
            onClick={() => setActiveTab("broadcasts")}
            className="px-4 py-2 rounded-lg text-sm font-black transition-all inline-flex items-center gap-2"
            style={
              activeTab === "broadcasts"
                ? { background: "var(--color-surface-700)", color: "var(--color-brand-300)", boxShadow: "0 2px 8px rgb(0 0 0 / 0.20)" }
                : { color: "var(--color-surface-500)" }
            }
          >
            {t("notifications.tabs.broadcast")}
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse"
              style={{ background: "rgb(239 68 68 / 0.15)", color: "#f87171" }}
            >
              {t("notifications.tabs.live")}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        {activeTab === "notifications" && notifs.length > 0 && (
          <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto">
            <button
              onClick={handleMarkAllRead}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-black text-xs transition-all"
              style={{ background: "rgb(99 102 241 / 0.10)", color: "var(--color-brand-400)", border: "1px solid rgb(99 102 241 / 0.20)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(99 102 241 / 0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(99 102 241 / 0.10)")}
            >
              <CheckCheck size={14} />
              <span className="whitespace-nowrap">{t("notifications.readAll")}</span>
            </button>
            <button
              onClick={() => setConfirmModal({ isOpen: true })}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-black text-xs transition-all"
              style={{ background: "rgb(239 68 68 / 0.08)", color: "#f87171", border: "1px solid rgb(239 68 68 / 0.18)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(239 68 68 / 0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(239 68 68 / 0.08)")}
            >
              <Trash2 size={14} />
              <span>{t("notifications.clear")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Notification List */}
      {activeTab === "notifications" ? (
        <div className="space-y-2">
          {notifs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-3xl border border-dashed text-center px-4"
              style={{ background: "var(--color-surface-900)", borderColor: "var(--color-surface-700)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--color-surface-800)", color: "var(--color-surface-700)" }}
              >
                <Bell size={26} />
              </div>
              <h3 className="font-black text-base" style={{ color: "var(--color-surface-300)" }}>
                {t("notifications.emptyTitle")}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-surface-600)" }}>
                {t("notifications.emptyDesc")}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {notifs.map((n) => {
                const style = getStyle(n.type);
                const readStyle = {
                  background: "var(--color-surface-900)",
                  border: "1px solid var(--color-surface-800)",
                  opacity: 0.65,
                };
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    onClick={() => handleMarkRead(n.id, n.link)}
                    className="relative p-4 md:p-5 rounded-2xl cursor-pointer transition-all active:scale-[0.99]"
                    style={n.is_read ? readStyle : style.bg}
                  >
                    <div className="flex gap-3 md:gap-4">
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={n.is_read ? { background: "var(--color-surface-800)", filter: "grayscale(1)", opacity: 0.5 } : style.iconBox}
                      >
                        {style.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4
                            className="font-black text-sm truncate w-full"
                            style={{ color: n.is_read ? "var(--color-surface-500)" : "var(--color-surface-100)" }}
                          >
                            {n.title}
                          </h4>
                          {!n.is_read && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0 mt-1.5 animate-pulse"
                              style={{ background: "#f87171" }}
                            />
                          )}
                        </div>
                        <p
                          className="text-xs md:text-sm mt-1 leading-relaxed line-clamp-2 md:line-clamp-none"
                          style={{ color: n.is_read ? "var(--color-surface-600)" : "var(--color-surface-400)" }}
                        >
                          {n.message}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span
                            className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full w-fit"
                            style={{ background: "var(--color-surface-800)", color: "var(--color-surface-500)" }}
                          >
                            <Clock size={9} /> {timeAgo(n.created_at)}
                          </span>
                          {n.link && (
                            <span
                              className="text-[10px] font-black"
                              style={{ color: "var(--color-brand-400)" }}
                            >
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
        /* Broadcast List */
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-3xl border border-dashed text-center px-4"
              style={{ background: "var(--color-surface-900)", borderColor: "var(--color-surface-700)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--color-surface-800)", color: "var(--color-surface-700)" }}
              >
                <Bell size={26} />
              </div>
              <h3 className="font-black text-base" style={{ color: "var(--color-surface-300)" }}>
                {t("notifications.emptyBroadcastTitle")}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-surface-600)" }}>
                {t("notifications.emptyBroadcastDesc")}
              </p>
            </div>
          ) : (
            announcements.map((ann) => {
              const style = getStyle(ann.type);
              return (
                <div
                  key={ann.id}
                  className="p-5 rounded-2xl relative overflow-hidden"
                  style={{ background: "var(--color-surface-900)", border: `1px solid ${style.stripe}30` }}
                >
                  {/* Left stripe accent */}
                  <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                    style={{ background: style.stripe }}
                  />
                  <div className="flex gap-4 pl-2">
                    <div
                      className="mt-1 p-2 rounded-full h-fit shrink-0"
                      style={style.iconBox}
                    >
                      {style.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-black text-base" style={{ color: "var(--color-surface-100)" }}>
                          {ann.title}
                        </h4>
                        <span
                          className="text-[10px] flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full"
                          style={{ background: "var(--color-surface-800)", color: "var(--color-surface-500)" }}
                        >
                          <Clock size={9} /> {timeAgo(ann.CreatedAt)}
                        </span>
                      </div>
                      <p
                        className="mt-2 leading-relaxed text-sm"
                        style={{ color: "var(--color-surface-400)" }}
                      >
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

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        maxWidth="max-w-xs md:max-w-sm"
      >
        <div className="text-center p-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgb(239 68 68 / 0.12)", color: "#f87171" }}
          >
            <Trash2 size={22} />
          </div>
          <h3 className="text-lg font-black mb-2" style={{ color: "var(--color-surface-100)" }}>
            {t("notifications.confirmClearTitle")}
          </h3>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--color-surface-400)" }}>
            {t("notifications.confirmClearDesc")}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmModal({ isOpen: false })}
              className="flex-1 py-2.5 rounded-xl font-black text-sm transition-colors"
              style={{ background: "var(--color-surface-800)", color: "var(--color-surface-300)", border: "1px solid var(--color-surface-700)" }}
            >
              {t("modals.cancel")}
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 py-2.5 rounded-xl font-black text-sm text-white"
              style={{ background: "#dc2626" }}
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
