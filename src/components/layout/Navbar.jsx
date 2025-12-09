import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, LayoutDashboard, History, Users, Menu } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* Brand */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          QuizApp
        </Link>

        {/* Menu desktop */}
        <div className="hidden sm:flex gap-4">
          <Link to="/" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600">
            <LayoutDashboard size={18}/> Topik
          </Link>

          <Link to="/history" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600">
            <History size={18}/> Riwayat
          </Link>

          <Link to="/friends" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600">
            <Users size={18}/> Teman
          </Link>
        </div>

        {/* User + logout desktop */}
        <div className="hidden sm:flex items-center gap-4 border-l pl-4 ml-4">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-700">{user?.name}</div>
            <div className="text-xs text-slate-500">@{user?.username}</div>
          </div>
          <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
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
        <div className="sm:hidden px-4 pb-4 animate-slideDown">
          <Link 
            to="/"
            className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={18}/> Topik
          </Link>

          <Link 
            to="/history"
            className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600"
            onClick={() => setOpen(false)}
          >
            <History size={18}/> Riwayat
          </Link>

          <Link 
            to="/friends"
            className="flex items-center gap-2 py-2 text-slate-700 hover:text-indigo-600"
            onClick={() => setOpen(false)}
          >
            <Users size={18}/> Teman
          </Link>

          {/* User info mobile */}
          <div className="mt-3 border-t pt-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-700">{user?.name}</div>
              <div className="text-xs text-slate-500">@{user?.username}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            >
              <LogOut size={20}/>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
