import { Link, useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Modal from "../ui/Modal";
// Pastikan import notificationAPI


const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Untuk mendeteksi perubahan halaman
  
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // State untuk jumlah notifikasi belum dibaca


  const dropdownRef = useRef(null);

  // --- LOGIKA BADGE NOTIFIKASI ---
  

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

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
            to="/"
            className="text-2xl font-bold text-indigo-600 flex items-center gap-2"
          >
            QuizApp
          </Link>

          {/* === MENU DESKTOP === */}
          <div className="hidden sm:flex gap-6">
            <Link
              to="/"
              className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium transition"
            >
              <LayoutDashboard size={18} /> Topik
            </Link>
            <Link
              to="/challenges"
              className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium transition"
            >
              <Swords size={18} /> Duel
            </Link>
            <Link
              to="/friends"
              className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium transition"
            >
              <Users size={18} /> Teman
            </Link>
            <Link
              to="/history"
              className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium transition"
            >
              <History size={18} /> Riwayat
            </Link>
          </div>

          {/* === BAGIAN KANAN (STATS & PROFIL DESKTOP) === */}
          <div className="hidden sm:flex items-center gap-4 border-l pl-4 ml-4">
            
            {/* [UPDATE] Tombol Notifikasi dengan Badge */}
            <Link
                to="/notifications"
                className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                title="Notifikasi"
            >
                <Bell size={20} />
                
                {/* Badge Merah */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
            </Link>

            {/* Stats Badges */}
            <div
              className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100"
              title="Daily Streak"
            >
              <Flame size={14} fill="currentColor" /> {user?.streak_count || 0}
            </div>
            <div
              className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100"
              title="Level"
            >
              <Star size={14} fill="currentColor" /> Lvl {user?.level || 1}
            </div>

            {/* Dropdown Profile */}
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
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu Content */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-scaleIn origin-top-right z-50">
                  <div className="px-4 py-3 border-b border-slate-50 lg:hidden text-center bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-800">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500">@{user?.username}</p>
                  </div>

                  <Link
                    to={`/@${user?.username}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <User size={16} /> Profil Saya
                  </Link>

                  <Link
                    to="/settings"
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <Settings size={16} /> Pengaturan
                  </Link>

                  <Link
                    to="/about"
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
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

          {/* === TOMBOL HAMBURGER MOBILE === */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition relative"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
            {/* Badge Mobile di Menu Burger (Opsional) */}
            {!open && unreadCount > 0 && (
               <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        {/* === MENU MOBILE (REDESIGNED) === */}
        {open && (
          <div className="sm:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-slideDown z-40 flex flex-col max-h-[90vh] overflow-y-auto">
            {/* 1. Stats Bar Mobile */}
            <div className="px-4 pt-4 pb-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 px-3 py-3 rounded-xl border border-orange-100 font-bold text-sm shadow-sm">
                  <Flame size={18} fill="currentColor" />{" "}
                  {user?.streak_count || 0} Streak
                </div>
                <div className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-3 rounded-xl border border-indigo-100 font-bold text-sm shadow-sm">
                  <Star size={18} fill="currentColor" /> Lvl {user?.level || 1}
                </div>
              </div>
            </div>

            {/* 2. Main Navigation Links */}
            <div className="px-4 py-2 flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition font-medium"
              >
                <LayoutDashboard size={20} /> Topik Kuis
              </Link>
              <Link
                to="/challenges"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition font-medium"
              >
                <Swords size={20} /> Arena Duel
              </Link>
              <Link
                to="/friends"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition font-medium"
              >
                <Users size={20} /> Teman
              </Link>
              <Link
                to="/history"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition font-medium"
              >
                <History size={20} /> Riwayat
              </Link>
              
              {/* [UPDATE] Menu Notifikasi Mobile dengan Badge */}
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition font-medium"
              >
                <div className="flex items-center gap-3">
                    <Bell size={20} /> Notifikasi
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
                className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition font-medium"
              >
                <Info size={20} /> Tentang Aplikasi
              </Link>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition font-medium"
              >
                <Settings size={20} /> Pengaturan
              </Link>
            </div>

            {/* 3. Profile & Actions Area */}
            <div className="mt-auto bg-slate-50 p-4 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-800 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    @{user?.username}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={`/@${user?.username}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 hover:shadow-md transition"
                >
                  <User size={18} /> Profil
                </Link>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-3 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition"
                >
                  <LogOut size={18} /> Keluar
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Modal Konfirmasi Logout */}
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