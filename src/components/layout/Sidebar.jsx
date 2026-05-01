// src/components/layout/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard, History, Users, Flame, Star, Swords,
  LogOut, Settings, Bell, Coins, ShoppingBag, Package,
  Trophy, GraduationCap, AlertTriangle, ChevronRight,
  Zap, BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import Modal from "../ui/Modal";
import UserAvatar from "../ui/UserAvatar";
import StreakHoverCard from "../ui/StreakHoverCard";
import CalendarModal from "../ui/CalendarModal";
import AnnouncementModal from "../ui/AnnouncementModal";
import { dailyAPI, userAPI, notificationAPI } from "../../services/api";
import { AnimatePresence, motion } from "framer-motion";

const NAV_MAIN = [
  { to: "/dashboard",        icon: LayoutDashboard, label: "navbar.topics"   },
  { to: "/classrooms",       icon: GraduationCap,   label: "navbar.classes"  },
  { to: "/challenges",       icon: Swords,          label: "navbar.duel"     },
  { to: "/leaderboard/global", icon: Trophy,         label: "navbar.rank"    },
];

const NAV_SECONDARY = [
  { to: "/friends",      icon: Users,        label: "navbar.friends"    },
  { to: "/history",      icon: History,      label: "navbar.history"    },
  { to: "/shop",         icon: ShoppingBag,  label: "navbar.shop"       },
  { to: "/inventory",    icon: Package,      label: "navbar.inventory"  },
  { to: "/notifications", icon: Bell,        label: "navbar.notifications" },
];

const Sidebar = () => {
  const { user, logout, unreadCount } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [showStreak, setShowStreak]           = useState(false);
  const [calendarDates, setCalendarDates]     = useState([]);
  const [missions, setMissions]               = useState([]);
  const [dailyStreak, setDailyStreak]         = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [announcementData, setAnnouncementData]   = useState(null);
  const [showAnnouncement, setShowAnnouncement]   = useState(false);
  const [showFullCalendar, setShowFullCalendar]   = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [resCalendar, resDaily] = await Promise.all([
          userAPI.getActivityCalendar(),
          dailyAPI.getInfo(),
        ]);
        setCalendarDates(resCalendar.data.data || []);
        setMissions(resDaily.data.data.missions || []);
        setDailyStreak(resDaily.data.data.streak.day || 0);
      } catch (e) { console.error("Sidebar data fetch failed:", e); }
    };
    fetchData();

    const fetchAnnouncement = async () => {
      try {
        const res = await notificationAPI.getAnnouncements();
        const latest = res.data.data?.[0];
        if (latest) {
          const lastSeenId = localStorage.getItem("last_seen_announcement");
          if (lastSeenId !== String(latest.id)) {
            setAnnouncementData(latest);
            setShowAnnouncement(true);
          }
        }
      } catch (e) { console.error("Announcement fetch failed:", e); }
    };
    fetchAnnouncement();
  }, [user]);

  const handleLogout = () => { logout(); setIsLogoutModalOpen(false); navigate("/login"); };
  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
    if (announcementData) localStorage.setItem("last_seen_announcement", String(announcementData.id));
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* ── SIDEBAR ───────────────────────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex flex-col"
        style={{
          width: "240px",
          background: "var(--color-surface)",
          borderRight: "1px solid oklch(0.2 0.005 60 / 0.08)",
          boxShadow: "var(--shadow-panel)",
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: "1px solid oklch(0.2 0.005 60 / 0.07)" }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 34, height: 34,
              background: "var(--color-brand-500)",
              boxShadow: "var(--shadow-glow-brand)",
            }}
          >
            <Zap size={18} color="white" fill="white" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "var(--color-ink)",
              letterSpacing: "-0.02em",
            }}
          >
            QuizApp <span style={{ color: "var(--color-brand-500)" }}>Indo</span>
          </span>
        </div>

        {/* Gamification strip */}
        <div
          className="flex items-center gap-2 px-4 py-3 mx-3 mt-3 rounded-xl"
          style={{ background: "var(--color-surface-off)" }}
        >
          {/* Streak */}
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => setShowStreak(true)}
            onMouseLeave={() => setShowStreak(false)}
          >
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: "oklch(0.97 0.03 45)",
                color: "var(--color-fire)",
                border: "1px solid oklch(0.85 0.06 45)",
              }}
            >
              <Flame size={13} fill="currentColor" />
              {user?.streak_count || 0}
            </div>
            <AnimatePresence>
              {showStreak && (
                <motion.div
                  className="absolute left-0 top-full mt-2 z-50"
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <StreakHoverCard
                    streakCount={user?.streak_count || 0}
                    activityDates={calendarDates}
                    missions={missions}
                    onOpenCalendar={() => { setShowStreak(false); setShowFullCalendar(true); }}
                    dailyStreak={dailyStreak}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Level */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold"
            style={{
              background: "var(--color-brand-50)",
              color: "var(--color-brand-600)",
              border: "1px solid var(--color-brand-100)",
            }}
          >
            <Star size={11} fill="currentColor" />
            Lv.{user?.level || 1}
          </div>

          {/* Coins */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ml-auto"
            style={{
              background: "oklch(0.98 0.04 85)",
              color: "var(--color-gold)",
              border: "1px solid oklch(0.88 0.08 85)",
            }}
          >
            <Coins size={11} fill="currentColor" />
            {user?.coins || 0}
          </div>
        </div>

        {/* Nav scroll area */}
        <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-3 space-y-1">
          <p
            className="px-3 pb-1 pt-1"
            style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-ghost)", textTransform: "uppercase" }}
          >
            Utama
          </p>
          {NAV_MAIN.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="nav-item"
              style={isActive(to) ? {
                background: "var(--color-brand-50)",
                color: "var(--color-brand-600)",
                fontWeight: 600,
              } : {}}
            >
              <Icon size={17} />
              <span>{t(label)}</span>
              {isActive(to) && <ChevronRight size={14} className="ml-auto opacity-40" />}
            </Link>
          ))}

          <p
            className="px-3 pb-1 pt-3"
            style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-ghost)", textTransform: "uppercase" }}
          >
            Lainnya
          </p>
          {NAV_SECONDARY.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="nav-item relative"
              style={isActive(to) ? {
                background: "var(--color-brand-50)",
                color: "var(--color-brand-600)",
                fontWeight: 600,
              } : {}}
            >
              <Icon size={17} />
              <span>{t(label)}</span>
              {to === "/notifications" && unreadCount > 0 && (
                <span
                  className="ml-auto flex items-center justify-center text-white font-bold"
                  style={{
                    minWidth: 18, height: 18,
                    background: "var(--color-error)",
                    borderRadius: 9999,
                    fontSize: "0.6rem",
                    padding: "0 4px",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Profile footer */}
        <div
          className="px-3 py-3"
          style={{ borderTop: "1px solid oklch(0.2 0.005 60 / 0.07)" }}
        >
          <Link
            to={`/@${user?.username}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{ color: "var(--color-ink)" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--color-surface-off)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <UserAvatar user={user} size="sm" />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--color-ghost)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                @{user?.username}
              </p>
            </div>
            <Settings size={15} style={{ color: "var(--color-ghost)", flexShrink: 0 }} />
          </Link>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="nav-item w-full mt-1"
            style={{ color: "var(--color-error)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "oklch(0.97 0.02 27)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={16} />
            <span>{t("navbar.logout")}</span>
          </button>
        </div>
      </aside>

      {/* ── MODALS ─────────────────────────────────────────────────── */}
      <CalendarModal
        isOpen={showFullCalendar}
        onClose={() => setShowFullCalendar(false)}
        activityDates={calendarDates}
        currentStreak={user?.streak_count || 0}
      />

      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} maxWidth="max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 40, height: 40, background: "oklch(0.97 0.02 27)", color: "var(--color-error)" }}
          >
            <AlertTriangle size={22} />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--color-ink)" }}>
            {t("navbar.confirmLogout")}
          </h2>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--color-sub)", marginBottom: "1.5rem" }}>
          {t("navbar.logoutDesc")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 py-2.5 rounded-xl font-bold transition-colors"
            style={{ background: "var(--color-surface-off)", color: "var(--color-sub)", fontSize: "0.875rem" }}
          >
            {t("navbar.cancel")}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 rounded-xl font-bold transition-colors"
            style={{ background: "var(--color-error)", color: "#fff", fontSize: "0.875rem" }}
          >
            {t("navbar.yesLogout")}
          </button>
        </div>
      </Modal>

      <AnnouncementModal
        isOpen={showAnnouncement}
        onClose={handleCloseAnnouncement}
        announcement={announcementData}
      />
    </>
  );
};

export default Sidebar;
