import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LogOut,
  LayoutDashboard,
  History,
  Users,
  Menu,
  Flame,
  Star,
  Swords,
  AlertTriangle,
  User,
  Settings,
  Info,
  ChevronDown,
  X,
  Bell,
  Coins,
  ShoppingBag,
  Package,
  Trophy,
  GraduationCap,
  Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import Modal from "../ui/Modal";
import UserAvatar from "../ui/UserAvatar";
import StreakHoverCard from "../ui/StreakHoverCard";
import CalendarModal from "../ui/CalendarModal";
import AnnouncementModal from "../ui/AnnouncementModal";
import { dailyAPI, userAPI, notificationAPI } from "../../services/api";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showStreak, setShowStreak] = useState(false);
  const [calendarDates, setCalendarDates] = useState([]);
  const [missions, setMissions] = useState([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [announcementData, setAnnouncementData] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const resCalendar = await userAPI.getActivityCalendar();
          setCalendarDates(resCalendar.data.data || []);
          const resDaily = await dailyAPI.getInfo();
          setMissions(resDaily.data.data.missions || []);
          setDailyStreak(resDaily.data.data.streak.day || 0);
        } catch (e) {
          console.error("Failed to fetch navbar data:", e);
        }
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
        } catch (error) {
          console.error("Failed to fetch announcement:", error);
        }
      };
      fetchAnnouncement();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
    if (announcementData) {
      localStorage.setItem("last_seen_announcement", String(announcementData.id));
    }
  };

  const navLinks = [
    { to: "/dashboard",        icon: LayoutDashboard, label: t("navbar.topics")   },
    { to: "/classrooms",       icon: GraduationCap,   label: t("navbar.classes")  },
    { to: "/challenges",       icon: Swords,          label: t("navbar.duel")     },
    { to: "/leaderboard/global", icon: Trophy,         label: t("navbar.rank")    },
  ];

  return (
    <>
      {/* ───────────────────────────────────────────────────────
           DESKTOP NAVBAR
      ─────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "var(--color-surface-950)",
          borderColor: "var(--color-surface-800)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 flex-shrink-0"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center gradient-levelup flex-shrink-0"
            >
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span
              className="font-bold text-sm tracking-tight"
              style={{ color: "var(--color-surface-50)" }}
            >
              QuizzApp<span style={{ color: "var(--color-brand-400)" }}> Indo</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ color: "var(--color-surface-400)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "var(--color-surface-100)";
                  e.currentTarget.style.background = "var(--color-surface-800)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "var(--color-surface-400)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop right: stats + profile */}
          <div
            className="hidden sm:flex items-center gap-2 flex-shrink-0 border-l pl-4"
            style={{ borderColor: "var(--color-surface-800)" }}
          >
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg transition-colors duration-150"
              style={{ color: "var(--color-surface-400)" }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "var(--color-surface-100)";
                e.currentTarget.style.background = "var(--color-surface-800)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--color-surface-400)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: "var(--color-danger)" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Streak chip */}
            <div
              className="relative"
              onMouseEnter={() => setShowStreak(true)}
              onMouseLeave={() => setShowStreak(false)}
            >
              <button
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer"
                style={{
                  background: user?.streak_count >= 7 ? undefined : "rgb(249 115 22 / 0.10)",
                  borderColor: "rgb(249 115 22 / 0.25)",
                  color: "#fb923c",
                }}
              >
                <Flame size={13} fill="currentColor" className={user?.streak_count > 0 ? "animate-pulse" : ""} />
                {user?.streak_count || 0}
              </button>
              <AnimatePresence>
                {showStreak && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 right-0"
                  >
                    <StreakHoverCard
                      streakCount={user?.streak_count || 0}
                      activityDates={calendarDates}
                      missions={missions}
                      onOpenCalendar={() => {
                        setShowStreak(false);
                        setShowFullCalendar(true);
                      }}
                      dailyStreak={dailyStreak}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Level chip */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
              style={{
                background: "rgb(99 102 241 / 0.10)",
                borderColor: "rgb(99 102 241 / 0.25)",
                color: "var(--color-brand-400)",
              }}
            >
              <Star size={12} fill="currentColor" />
              Lv.{user?.level || 1}
            </div>

            {/* Coins chip */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
              style={{
                background: "rgb(245 158 11 / 0.10)",
                borderColor: "rgb(245 158 11 / 0.25)",
                color: "#fbbf24",
              }}
            >
              <Coins size={12} fill="currentColor" />
              {user?.coins || 0}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full transition-colors duration-150 border cursor-pointer"
                style={{
                  borderColor: dropdownOpen ? "var(--color-brand-500)" : "var(--color-surface-700)",
                  background: dropdownOpen ? "var(--color-surface-800)" : "transparent",
                }}
              >
                <span
                  className="text-sm font-semibold hidden lg:block"
                  style={{ color: "var(--color-surface-200)" }}
                >
                  {user?.name}
                </span>
                <UserAvatar user={user} size="sm" />
                <ChevronDown
                  size={14}
                  style={{ color: "var(--color-surface-400)" }}
                  className={clsx("transition-transform duration-200", dropdownOpen && "rotate-180")}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 py-1.5 rounded-xl border z-50"
                    style={{
                      background: "var(--color-surface-900)",
                      borderColor: "var(--color-surface-700)",
                      boxShadow: "0 8px 32px rgb(0 0 0 / 0.4)",
                    }}
                  >
                    {[
                      { to: `/@${user?.username}`, icon: User, label: t("navbar.myProfile") },
                      { to: "/friends",   icon: Users,       label: t("navbar.friends")   },
                      { to: "/history",   icon: History,     label: t("navbar.history")   },
                      { to: "/shop",      icon: ShoppingBag, label: t("navbar.shop")      },
                      { to: "/inventory", icon: Package,     label: t("navbar.inventory") },
                      { to: "/settings",  icon: Settings,    label: t("navbar.settings")  },
                      { to: "/about",     icon: Info,        label: t("navbar.about")     },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
                        style={{ color: "var(--color-surface-300)" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = "var(--color-surface-50)";
                          e.currentTarget.style.background = "var(--color-surface-800)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = "var(--color-surface-300)";
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <Icon size={15} /> {label}
                      </Link>
                    ))}
                    <div
                      className="h-px my-1"
                      style={{ background: "var(--color-surface-800)" }}
                    />
                    <button
                      onClick={() => { setDropdownOpen(false); setIsLogoutModalOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-none bg-transparent"
                      style={{ color: "var(--color-danger)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgb(239 68 68 / 0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <LogOut size={15} /> {t("navbar.logout")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── MOBILE: stats + hamburger ── */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={() => setShowFullCalendar(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer"
              style={{
                background: "rgb(249 115 22 / 0.10)",
                borderColor: "rgb(249 115 22 / 0.25)",
                color: "#fb923c",
              }}
            >
              <Flame size={12} fill="currentColor" className={user?.streak_count > 0 ? "animate-pulse" : ""} />
              {user?.streak_count || 0}
            </button>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border"
              style={{
                background: "rgb(99 102 241 / 0.15)",
                borderColor: "rgb(99 102 241 / 0.30)",
                color: "var(--color-brand-400)",
              }}
            >
              <Star size={11} fill="currentColor" />
              Lv.{user?.level || 1}
            </div>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border"
              style={{
                background: "rgb(245 158 11 / 0.10)",
                borderColor: "rgb(245 158 11 / 0.25)",
                color: "#fbbf24",
              }}
            >
              <Coins size={11} fill="currentColor" />
              {user?.coins || 0}
            </div>
            <button
              className="p-1.5 rounded-lg transition-colors cursor-pointer border-none"
              style={{
                color: "var(--color-surface-300)",
                background: open ? "var(--color-surface-800)" : "transparent",
              }}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
              {!open && unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 h-2 w-2 rounded-full"
                  style={{ background: "var(--color-danger)" }}
                />
              )}
            </button>
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden fixed inset-0 top-14 z-40 flex flex-col"
              style={{ background: "var(--color-surface-950)" }}
            >
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {/* Main menu grid */}
                <div>
                  <h3
                    className="text-xs font-bold uppercase mb-3 px-1 tracking-widest"
                    style={{ color: "var(--color-surface-500)" }}
                  >
                    {t("navbar.mainMenu")}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { to: "/dashboard",        icon: LayoutDashboard, label: t("navbar.topics"),  color: "brand"   },
                      { to: "/challenges",       icon: Swords,          label: t("navbar.duel"),    color: "orange"  },
                      { to: "/friends",          icon: Users,           label: t("navbar.friends"), color: "pink"    },
                      { to: "/history",          icon: History,         label: t("navbar.history"), color: "blue"    },
                      { to: "/classrooms",       icon: GraduationCap,   label: t("navbar.classes"), color: "green"   },
                      { to: "/leaderboard/global", icon: Trophy,        label: t("navbar.rank"),    color: "yellow"  },
                    ].map(({ to, icon: Icon, label, color }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setOpen(false)}
                        className="p-4 rounded-xl border flex flex-col items-center gap-2 transition active:scale-95"
                        style={{
                          background: "var(--color-surface-900)",
                          borderColor: "var(--color-surface-800)",
                        }}
                      >
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            background: color === "brand"  ? "rgb(99 102 241 / 0.15)"
                                      : color === "orange" ? "rgb(249 115 22 / 0.15)"
                                      : color === "pink"   ? "rgb(236 72 153 / 0.15)"
                                      : color === "blue"   ? "rgb(59 130 246 / 0.15)"
                                      : color === "green"  ? "rgb(34 197 94 / 0.15)"
                                      : "rgb(234 179 8 / 0.15)",
                            color:  color === "brand"  ? "var(--color-brand-400)"
                                  : color === "orange" ? "#fb923c"
                                  : color === "pink"   ? "#f472b6"
                                  : color === "blue"   ? "#60a5fa"
                                  : color === "green"  ? "#4ade80"
                                  : "#fbbf24",
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <span
                          className="text-xs font-bold"
                          style={{ color: "var(--color-surface-200)" }}
                        >
                          {label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Others */}
                <div>
                  <h3
                    className="text-xs font-bold uppercase mb-3 px-1 tracking-widest"
                    style={{ color: "var(--color-surface-500)" }}
                  >
                    {t("navbar.others")}
                  </h3>
                  <div
                    className="rounded-xl border overflow-hidden"
                    style={{
                      background: "var(--color-surface-900)",
                      borderColor: "var(--color-surface-800)",
                    }}
                  >
                    {[
                      { to: "/shop",          icon: ShoppingBag, label: t("navbar.itemShop"),      color: "#c084fc" },
                      { to: "/inventory",     icon: Package,     label: t("navbar.inventory"),      color: "#fbbf24" },
                      { to: "/notifications", icon: Bell,        label: t("navbar.notifications"),  color: "var(--color-danger)" },
                      { to: "/about",         icon: Info,        label: t("navbar.about"),           color: "#fbbf24" },
                    ].map(({ to, icon: Icon, label, color }, i, arr) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between px-4 py-3.5 transition"
                        style={{
                          borderBottom: i < arr.length - 1 ? "1px solid var(--color-surface-800)" : "none",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--color-surface-800)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} style={{ color }} />
                          <span className="text-sm font-semibold" style={{ color: "var(--color-surface-200)" }}>
                            {label}
                          </span>
                        </div>
                        {to === "/notifications" && unreadCount > 0 && (
                          <span
                            className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "var(--color-danger)" }}
                          >
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile footer: profile */}
              <div
                className="border-t p-4"
                style={{
                  background: "var(--color-surface-900)",
                  borderColor: "var(--color-surface-800)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <UserAvatar user={user} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--color-surface-50)" }}>
                      {user?.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--color-surface-500)" }}>
                      @{user?.username}
                    </p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-lg transition"
                    style={{ color: "var(--color-surface-400)", background: "var(--color-surface-800)" }}
                  >
                    <Settings size={18} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/@${user?.username}`}
                    onClick={() => setOpen(false)}
                    className="btn-primary justify-center text-sm"
                  >
                    {t("navbar.viewProfile")}
                  </Link>
                  <button
                    onClick={() => { setOpen(false); setIsLogoutModalOpen(true); }}
                    className="py-2.5 rounded-full text-sm font-semibold border transition cursor-pointer bg-transparent"
                    style={{
                      color: "var(--color-danger)",
                      borderColor: "rgb(239 68 68 / 0.30)",
                      background: "rgb(239 68 68 / 0.08)",
                    }}
                  >
                    {t("navbar.logout")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Modals — semua preserved */}
      <CalendarModal
        isOpen={showFullCalendar}
        onClose={() => setShowFullCalendar(false)}
        activityDates={calendarDates}
        currentStreak={user?.streak_count || 0}
      />

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        maxWidth="max-w-sm"
      >
        <div className="flex items-center gap-3 mb-4" style={{ color: "var(--color-danger)" }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgb(239 68 68 / 0.12)" }}
          >
            <AlertTriangle size={22} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--color-surface-50)" }}>
            {t("navbar.confirmLogout")}
          </h2>
        </div>
        <p className="mb-6 text-sm" style={{ color: "var(--color-surface-400)" }}>
          {t("navbar.logoutDesc")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition cursor-pointer border"
            style={{
              background: "var(--color-surface-800)",
              color: "var(--color-surface-200)",
              borderColor: "var(--color-surface-700)",
            }}
          >
            {t("navbar.cancel")}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition cursor-pointer border-none"
            style={{ background: "var(--color-danger)" }}
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

export default Navbar;
