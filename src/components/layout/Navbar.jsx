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
  MoreHorizontal,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Modal from "../ui/Modal";
import UserAvatar from "../ui/UserAvatar";
import StreakHoverCard from "../ui/StreakHoverCard";
import { dailyAPI, userAPI } from "../../services/api";
import { AnimatePresence, motion } from "framer-motion";
import CalendarModal from "../ui/CalendarModal";

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();

  // State
  const [showStreak, setShowStreak] = useState(false);
  const [calendarDates, setCalendarDates] = useState([]);
  const [missions, setMissions] = useState([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
    return () => {
      document.body.style.overflow = "unset";
    };
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
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          {/* Brand */}
          <Link
            to="/dashboard"
            className="text-2xl font-black text-indigo-600 tracking-tight flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            QuizApp
          </Link>

          {/* === MENU DESKTOP (Hidden di Mobile) === */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              to="/dashboard"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-bold transition flex items-center gap-2"
            >
              <LayoutDashboard size={18} /> Topik
            </Link>
            <Link
              to="/classrooms"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-bold transition flex items-center gap-2"
            >
              <GraduationCap size={18} /> Kelas
            </Link>
            <Link
              to="/challenges"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-bold transition flex items-center gap-2"
            >
              <Swords size={18} /> Duel
            </Link>
            <Link
              to="/leaderboard/global"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-bold transition flex items-center gap-2"
            >
              <Trophy size={18} /> Rank
            </Link>
          </div>

          {/* === STATS & PROFIL DESKTOP (Hidden di Mobile) === */}
          <div className="hidden sm:flex items-center gap-4 border-l pl-4 ml-4">
            <Link
              to="/notifications"
              className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Desktop Streak */}
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setShowStreak(true)}
              onMouseLeave={() => setShowStreak(false)}
            >
              <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 transition hover:bg-orange-100">
                <Flame
                  size={14}
                  fill="currentColor"
                  className={user?.streak_count > 0 ? "animate-pulse" : ""}
                />
                {user?.streak_count || 0}
              </div>
              <AnimatePresence>
                {showStreak && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StreakHoverCard
                      streakCount={user?.streak_count || 0}
                      activityDates={calendarDates}
                      missions={missions} // <--- Oper data misi ke sini
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

            {/* Desktop Level */}
            <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
              <Star size={14} fill="currentColor" /> Lvl {user?.level || 1}
            </div>

            {/* Desktop Coin */}
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
              <Coins size={14} fill="currentColor" /> {user?.coins || 0}
            </div>

            {/* Desktop Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group"
              >
                <div className="text-right hidden lg:block">
                  <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition">
                    {user?.name}
                  </div>
                </div>
                <UserAvatar user={user} size="md" />
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-scaleIn origin-top-right z-50">
                  <Link
                    to={`/@${user?.username}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <User size={16} /> Profil Saya
                  </Link>
                  <Link
                    to="/friends"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <Users size={16} /> Teman
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <History size={16} /> Riwayat
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <ShoppingBag size={16} /> Shop
                  </Link>
                  <Link
                    to="/inventory"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <Package size={16} /> Inventory
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <Settings size={16} /> Pengaturan
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <Info size={16} /> Tentang Aplikasi
                  </Link>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* === STATS & MENU MOBILE === */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* 1. Streak */}
            <button
              onClick={() => setShowFullCalendar(true)}
              className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1.5 rounded-lg text-xs font-bold border border-orange-100 active:scale-95 transition"
            >
              <Flame
                size={13}
                fill="currentColor"
                className={user?.streak_count > 0 ? "animate-pulse" : ""}
              />
              {user?.streak_count || 0}
            </button>

            {/* 2. Level Badge (BAGUS / PREMIUM LOOK) */}
            <div className="flex items-center gap-1 bg-indigo-600 text-white px-2 py-1.5 rounded-lg text-xs font-bold shadow-sm shadow-indigo-200 border border-indigo-500">
              <Star size={12} fill="#fbbf24" className="text-yellow-400" />
              <span>Lvl {user?.level || 1}</span>
            </div>

            {/* 3. Coin */}
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1.5 rounded-lg text-xs font-bold border border-yellow-200">
              <Coins size={13} fill="currentColor" />
              {user?.coins || 0}
            </div>

            {/* 4. Hamburger */}
            <button
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition relative"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
              {!open && unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>

        {/* === DRAWER MENU MOBILE (Simple Grid) === */}
        {open && (
          <div className="sm:hidden fixed inset-0 top-16 bg-slate-50 z-40 flex flex-col animate-fadeIn">
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {/* Menu Utama */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">
                  Menu Utama
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 hover:border-indigo-300 transition active:scale-95"
                  >
                    <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                      <LayoutDashboard size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      Topik
                    </span>
                  </Link>
                  <Link
                    to="/challenges"
                    onClick={() => setOpen(false)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 hover:border-orange-300 transition active:scale-95"
                  >
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                      <Swords size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      Duel
                    </span>
                  </Link>
                  <Link
                    to="/friends"
                    onClick={() => setOpen(false)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 hover:border-pink-300 transition active:scale-95"
                  >
                    <div className="bg-pink-100 p-2 rounded-full text-pink-600">
                      <Users size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      Teman
                    </span>
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setOpen(false)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 hover:border-blue-300 transition active:scale-95"
                  >
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <History size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      Riwayat
                    </span>
                  </Link>
                  <Link
                    to="/classrooms"
                    onClick={() => setOpen(false)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 hover:border-green-300 transition active:scale-95"
                  >
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <GraduationCap size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      Kelas
                    </span>
                  </Link>
                  <Link
                    to="/leaderboard/global"
                    onClick={() => setOpen(false)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 hover:border-yellow-300 transition active:scale-95"
                  >
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                      <Trophy size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      Rank
                    </span>
                  </Link>
                </div>
              </div>

              {/* Lainnya */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">
                  Lainnya
                </h3>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <Link
                    to="/shop"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <ShoppingBag size={18} className="text-purple-500" />{" "}
                    <span className="text-sm font-bold text-slate-700">
                      Item Shop
                    </span>
                  </Link>
                  <Link
                    to="/inventory"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <Package size={18} className="text-amber-500" />{" "}
                    <span className="text-sm font-bold text-slate-700">
                      Inventory
                    </span>
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-red-500" />{" "}
                      <span className="text-sm font-bold text-slate-700">
                        Notifikasi
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <Info size={18} className="text-amber-500" />{" "}
                    <span className="text-sm font-bold text-slate-700">
                      Tentang Aplikasi
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer Profil */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <UserAvatar user={user} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    @{user?.username}
                  </p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  <Settings size={20} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={`/@${user?.username}`}
                  onClick={() => setOpen(false)}
                  className="py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm text-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  Lihat Profil
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold text-sm text-center hover:bg-red-100 transition"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <CalendarModal
        isOpen={showFullCalendar}
        onClose={() => setShowFullCalendar(false)}
        activityDates={calendarDates}
        currentStreak={user?.streak_count || 0}
      />

      {/* Modal Logout */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        maxWidth="max-w-sm"
      >
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Konfirmasi Keluar
          </h2>
        </div>
        <p className="text-slate-600 mb-6 text-sm">
          Apakah kamu yakin ingin keluar dari aplikasi?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition"
          >
            Batal
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
          >
            Ya, Keluar
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
