import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Import dari Hooks
import { LogOut, LayoutDashboard, History, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">QuizApp</Link>
        
        <div className="flex gap-4">
          <Link to="/" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600"><LayoutDashboard size={18}/> Topik</Link>
          <Link to="/history" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600"><History size={18}/> Riwayat</Link>
          <Link to="/friends" className="flex gap-2 items-center text-slate-600 hover:text-indigo-600"><Users size={18}/> Teman</Link>
        </div>

        <div className="flex items-center gap-4 border-l pl-4 ml-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-700">{user?.name}</div>
            <div className="text-xs text-slate-500">@{user?.username}</div>
          </div>
          <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><LogOut size={20}/></button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;