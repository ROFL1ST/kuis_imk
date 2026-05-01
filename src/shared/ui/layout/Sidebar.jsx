// src/shared/ui/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, Trophy,
  ShoppingBag, MessageCircle, User, Settings,
  LogOut, Zap, ChevronRight,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const NAV_PRIMARY = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/quiz',      icon: BookOpen,        label: 'Quiz'      },
  { to: '/classroom', icon: Users,           label: 'Classroom' },
  { to: '/community', icon: MessageCircle,   label: 'Community' },
  { to: '/social',    icon: Trophy,          label: 'Challenges'},
  { to: '/shop',      icon: ShoppingBag,     label: 'Shop'      },
];

const NAV_BOTTOM = [
  { to: '/profile',  icon: User,     label: 'Profile'  },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

// -- Inline SVG logo mark --------------------------------------------------
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="url(#sb-brand)" />
      <path
        d="M9 19L14 9l5 10M11.5 15h5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="sb-brand" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6461EF" />
          <stop offset="1" stopColor="#3130A8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// -- XP Progress bar -------------------------------------------------------
function XPBar({ current = 0, max = 100, level = 1 }) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="px-4 py-3 border-t border-ring/60">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-2xs font-semibold uppercase tracking-widest text-ghost">
          Level {level}
        </span>
        <span className="text-2xs font-mono text-ghost tabular">
          {current}<span className="text-ghost/50">/{max}</span> XP
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-ring overflow-hidden">
        <div
          className="h-full rounded-full bg-xp-gradient transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// -- Main Sidebar ----------------------------------------------------------
export function Sidebar({ user, onLogout, collapsed = false }) {
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen flex flex-col z-30',
        'bg-surface border-r border-ring/70',
        collapsed ? 'w-16' : 'w-sidebar',
        'transition-[width] duration-200 ease-spring',
      )}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b border-ring/60 flex items-center gap-3 min-h-[57px]">
        <LogoMark />
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="block text-sm font-bold text-ink tracking-tight leading-tight">
              QuizzApp
            </span>
            <span className="block text-2xs text-ghost leading-none">
              Indo &middot; AI Graded
            </span>
          </div>
        )}
      </div>

      {/* User widget */}
      {user && !collapsed && (
        <button
          onClick={() => navigate('/profile')}
          className="mx-3 mt-3 p-2.5 rounded-xl bg-surfaceOff
                     hover:bg-ring/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center
                         justify-center text-white text-xs font-bold shrink-0"
            >
              {user.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate leading-tight">
                {user.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Zap size={10} className="text-xp shrink-0" />
                <span className="text-2xs text-ghost font-medium">
                  {user.xp ?? 0} XP
                </span>
              </div>
            </div>
            <ChevronRight size={13} className="text-ghost shrink-0" />
          </div>
        </button>
      )}

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-none px-2 py-3 space-y-0.5">
        {NAV_PRIMARY.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'nav-item',
                collapsed && 'justify-center px-0',
                isActive && 'active',
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* XP bar */}
      {!collapsed && user && (
        <XPBar
          current={user.xp ?? 0}
          max={user.xpToNext ?? 500}
          level={user.level ?? 1}
        />
      )}

      {/* Bottom nav */}
      <div className="px-2 py-2 border-t border-ring/60 space-y-0.5">
        {NAV_BOTTOM.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('nav-item', collapsed && 'justify-center px-0', isActive && 'active')
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
        <button
          onClick={onLogout}
          className={cn(
            'nav-item w-full text-error/70 hover:text-error hover:bg-red-50',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Log out' : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
