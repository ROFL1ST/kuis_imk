import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, LayoutDashboard, History, Users, Menu, Flame, Star, Swords } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* Brand */}
        <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          QuizApp
        </Link>

        {/* Menu desktop */}
        <div className="hidden sm:flex gap-6">
          <Link to="/" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium">
            <LayoutDashboard size={18}/> Topik
          </Link>

          <Link to="/challenges" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium">
            <Swords size={18}/> Duel
          </Link>

          <Link to="/friends" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium">
            <Users size={18}/> Teman
          </Link>
          
          <Link to="/history" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600 font-medium">
            <History size={18}/> Riwayat
          </Link>
        </div>

        {/* Gamification Stats & Profile */}
        <div className="hidden sm:flex items-center gap-4 border-l pl-4 ml-4">
          
          {/* Streak Badge */}
          <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100" title="Daily Streak">
            <Flame size={14} fill="currentColor" />
            {user?.streak_count || 0} Hari
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100" title="Level & XP">
            <Star size={14} fill="currentColor" />
            Lvl {user?.level || 1}
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-slate-700">{user?.name}</div>
            <div className="text-xs text-slate-500">@{user?.username}</div>
          </div>
          <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Keluar">
            <LogOut size={20}/>
          </button>
        </div>

        {/* Hamburger button */}
        <button 
          className="sm:hidden p-2 rounded-md hover:bg-slate-100"
          onClick={() => setOpen(!open)}
        >
          <Menu size={24}/>
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

          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600">
            <LayoutDashboard size={18}/> Topik
          </Link>

          <Link to="/challenges" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600">
            <Swords size={18}/> Duel / Tantangan
          </Link>

          <Link to="/friends" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600">
            <Users size={18}/> Teman
          </Link>

           <Link to="/history" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600">
            <History size={18}/> Riwayat
          </Link>

          <div className="mt-3 border-t pt-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-700">{user?.name}</div>
              <div className="text-xs text-slate-500">@{user?.username}</div>
            </div>
            <button onClick={logout} className="text-red-500 font-medium text-sm">Keluar</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;