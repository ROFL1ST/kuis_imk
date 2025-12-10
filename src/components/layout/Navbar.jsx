import { Link } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";
import Modal from "../ui/Modal";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
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

          {/* Menu desktop */}
          <div className="hidden sm:flex gap-6">
            <Link
              to="/"
              className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium"
            >
              <LayoutDashboard size={18} /> Topik
            </Link>

            <Link
              to="/challenges"
              className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium"
            >
              <Swords size={18} /> Duel
            </Link>

            <Link
              to="/friends"
              className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium"
            >
              <Users size={18} /> Teman
            </Link>

            <Link
              to="/history"
              className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium"
            >
              <History size={18} /> Riwayat
            </Link>
          </div>

          {/* Gamification Stats & Profile (Desktop) */}
          <div className="hidden sm:flex items-center gap-4 border-l pl-4 ml-4">
            {/* Streak Badge */}
            <div
              className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100"
              title="Daily Streak"
            >
              <Flame size={14} fill="currentColor" />
              {user?.streak_count || 0} Hari
            </div>

            {/* Level Badge */}
            <div
              className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100"
              title="Level & XP"
            >
              <Star size={14} fill="currentColor" />
              Lvl {user?.level || 1}
            </div>

            {/* Profile Link (Updated) */}
            <Link 
              to="/profile" 
              className="text-right group cursor-pointer block"
            >
              <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition">
                {user?.name}
              </div>
              <div className="text-xs text-slate-500">@{user?.username}</div>
            </Link>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Hamburger button */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-slate-100"
            onClick={() => setOpen(!open)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="sm:hidden px-4 pb-4 animate-slideDown bg-white border-t">
            {/* Mobile Stats */}
            <div className="flex justify-between py-3 border-b mb-2">
              <div className="flex items-center gap-1 text-orange-600 font-bold text-sm">
                <Flame size={16} /> {user?.streak_count || 0} Streak
              </div>
              <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm">
                <Star size={16} /> Level {user?.level || 1}
              </div>
            </div>

            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600"
            >
              <LayoutDashboard size={18} /> Topik
            </Link>

            <Link
              to="/challenges"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600"
            >
              <Swords size={18} /> Duel / Tantangan
            </Link>

            <Link
              to="/friends"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600"
            >
              <Users size={18} /> Teman
            </Link>

            <Link
              to="/history"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600"
            >
              <History size={18} /> Riwayat
            </Link>

            <div className="mt-3 border-t pt-3 flex items-center justify-between">
              {/* Mobile Profile Link (Updated) */}
              <Link 
                to="/profile" 
                onClick={() => setOpen(false)} 
                className="group cursor-pointer block"
              >
                <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition">
                  {user?.name}
                </div>
                <div className="text-xs text-slate-500">@{user?.username}</div>
              </Link>
              
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="text-red-500 font-medium text-sm"
              >
                Keluar
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
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

        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          Apakah kamu yakin ingin keluar dari aplikasi? Kamu harus login kembali
          untuk mengakses akunmu.
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
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Ya, Keluar
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;