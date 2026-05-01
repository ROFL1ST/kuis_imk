// src/components/layout/Sidebar.jsx
// Pure Tailwind — no inline style objects
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard, History, Users, Flame, Star, Swords,
  LogOut, Settings, Bell, Coins, ShoppingBag, Package,
  Trophy, GraduationCap, AlertTriangle, ChevronRight, Zap,
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
  { to: "/dashboard",           icon: LayoutDashboard, labelKey: "navbar.topics"   },
  { to: "/classrooms",          icon: GraduationCap,   labelKey: "navbar.classes"  },
  { to: "/challenges",          icon: Swords,          labelKey: "navbar.duel"     },
  { to: "/leaderboard/global",  icon: Trophy,          labelKey: "navbar.rank"     },
];

const NAV_SECONDARY = [
  { to: "/friends",       icon: Users,       labelKey: "navbar.friends"       },
  { to: "/history",       icon: History,     labelKey: "navbar.history"       },
  { to: "/shop",          icon: ShoppingBag, labelKey: "navbar.shop"          },
  { to: "/inventory",     icon: Package,     labelKey: "navbar.inventory"     },
  { to: "/notifications", icon: Bell,        labelKey: "navbar.notifications" },
];

export default function Sidebar() {
  const { user, logout, unreadCount } = useAuth();
  const { t } = useLanguage();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [showStreak,          setShowStreak]          = useState(false);
  const [calendarDates,       setCalendarDates]       = useState([]);
  const [missions,            setMissions]            = useState([]);
  const [dailyStreak,         setDailyStreak]         = useState(0);
  const [isLogoutOpen,        setIsLogoutOpen]        = useState(false);
  const [announcementData,    setAnnouncementData]    = useState(null);
  const [showAnnouncement,    setShowAnnouncement]    = useState(false);
  const [showFullCalendar,    setShowFullCalendar]    = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [rc, rd] = await Promise.all([
          userAPI.getActivityCalendar(),
          dailyAPI.getInfo(),
        ]);
        setCalendarDates(rc.data.data || []);
        setMissions(rd.data.data.missions || []);
        setDailyStreak(rd.data.data.streak.day || 0);
      } catch { /* silent */ }
    })();

    (async () => {
      try {
        const res = await notificationAPI.getAnnouncements();
        const latest = res.data.data?.[0];
        if (latest && localStorage.getItem("last_seen_announcement") !== String(latest.id)) {
          setAnnouncementData(latest);
          setShowAnnouncement(true);
        }
      } catch { /* silent */ }
    })();
  }, [user]);

  const handleLogout = () => { logout(); setIsLogoutOpen(false); navigate("/login"); };
  const closeAnnouncement = () => {
    setShowAnnouncement(false);
    if (announcementData) localStorage.setItem("last_seen_announcement", String(announcementData.id));
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path + "/"));

  const navItemClass = (active) =>
    `nav-item ${ active ? "bg-brand-50 text-brand-600 font-semibold" : "" }`;

  return (
    <>
      {/* ── SIDEBAR ────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 w-sidebar flex flex-col
                        bg-surface border-r border-black/[0.07] shadow-panel">

        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-black/[0.06]">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl
                          bg-brand-500 shadow-glow-brand shrink-0">
            <Zap size={17} className="text-white fill-white" />
          </div>
          <span className="font-display font-extrabold text-base tracking-tight text-ink">
            QuizApp&nbsp;<span className="text-brand-500">Indo</span>
          </span>
        </div>

        {/* Gamification strip */}
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl bg-surfaceOff px-3 py-2">

          {/* Streak */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowStreak(true)}
              onMouseLeave={() => setShowStreak(false)}
              onClick={() => setShowFullCalendar(true)}
              className="flex items-center gap-1.5 rounded-lg border border-orange-200
                         bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-fire
                         transition-colors hover:bg-orange-100 active:scale-95"
            >
              <Flame
                size={13}
                className={`fill-current ${ (user?.streak_count || 0) > 0 ? "animate-pulse-glow" : "" }`}
              />
              {user?.streak_count || 0}
            </button>
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
          <div className="flex items-center gap-1.5 rounded-lg border border-brand-100
                          bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-600">
            <Star size={11} className="fill-current" />
            Lv.{user?.level || 1}
          </div>

          {/* Coins */}
          <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-yellow-200
                          bg-yellow-50 px-2.5 py-1.5 text-xs font-bold text-gold">
            <Coins size={11} className="fill-current" />
            {user?.coins || 0}
          </div>
        </div>

        {/* Nav scroll area */}
        <nav className="scrollbar-none flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="px-3 pb-1.5 pt-1 text-2xs font-bold uppercase tracking-widest text-ghost">
            Utama
          </p>
          {NAV_MAIN.map(({ to, icon: Icon, labelKey }) => (
            <Link key={to} to={to} className={navItemClass(isActive(to))}>
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{t(labelKey)}</span>
              {isActive(to) && <ChevronRight size={13} className="ml-auto shrink-0 opacity-40" />}
            </Link>
          ))}

          <p className="px-3 pb-1.5 pt-4 text-2xs font-bold uppercase tracking-widest text-ghost">
            Lainnya
          </p>
          {NAV_SECONDARY.map(({ to, icon: Icon, labelKey }) => (
            <Link key={to} to={to} className={navItemClass(isActive(to))}>
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{t(labelKey)}</span>
              {to === "/notifications" && unreadCount > 0 && (
                <span className="ml-auto flex h-4.5 min-w-[1.125rem] items-center justify-center
                                 rounded-full bg-error px-1 text-2xs font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Profile footer */}
        <div className="border-t border-black/[0.06] px-3 pb-3 pt-2 space-y-0.5">
          <Link
            to={`/@${user?.username}`}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5
                       text-ink transition-colors hover:bg-surfaceOff"
          >
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{user?.name}</p>
              <p className="truncate text-xs text-ghost">@{user?.username}</p>
            </div>
            <Settings size={14} className="shrink-0 text-ghost" />
          </Link>

          <button
            onClick={() => setIsLogoutOpen(true)}
            className="nav-item w-full text-error hover:bg-red-50"
          >
            <LogOut size={15} className="shrink-0" />
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

      <Modal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} maxWidth="max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-error">
            <AlertTriangle size={20} />
          </div>
          <h2 className="font-display text-lg font-bold text-ink">
            {t("navbar.confirmLogout")}
          </h2>
        </div>
        <p className="mb-6 text-sm text-sub">{t("navbar.logoutDesc")}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsLogoutOpen(false)}
            className="flex-1 rounded-xl bg-surfaceOff py-2.5 text-sm font-bold
                       text-sub transition-colors hover:bg-ring"
          >
            {t("navbar.cancel")}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 rounded-xl bg-error py-2.5 text-sm font-bold
                       text-white transition-colors hover:bg-red-700"
          >
            {t("navbar.yesLogout")}
          </button>
        </div>
      </Modal>

      <AnnouncementModal
        isOpen={showAnnouncement}
        onClose={closeAnnouncement}
        announcement={announcementData}
      />
    </>
  );
}
