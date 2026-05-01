import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, ShoppingBag,
  MessageSquare, Trophy, ChevronLeft, Settings, Bell
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Overview'  },
  { to: '/quiz',        icon: BookOpen,         label: 'Quizzes'   },
  { to: '/classroom',   icon: Users,            label: 'Classroom' },
  { to: '/community',   icon: MessageSquare,    label: 'Community' },
  { to: '/leaderboard', icon: Trophy,           label: 'Rankings'  },
  { to: '/shop',        icon: ShoppingBag,      label: 'Shop'      },
];

export function AppShell({ children, user }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">

      {/* Sidebar */}
      <aside className={cn(
        'relative flex flex-col bg-surface border-r border-ring',
        'transition-all duration-300 ease-in-out z-20',
        collapsed ? 'w-16' : 'w-56'
      )}>

        {/* Logo */}
        <div className={cn(
          'flex items-center h-14 px-4 border-b border-ring',
          collapsed ? 'justify-center' : 'gap-2.5'
        )}>
          <div className="w-7 h-7 rounded-lg bg-brand-gradient flex-shrink-0
                          flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">Q</span>
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg text-ink tracking-tight">
              QuizzApp
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm',
                'transition-colors duration-150 group',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-sub hover:bg-canvas hover:text-ink',
                collapsed && 'justify-center'
              )}
            >
              <Icon size={17} strokeWidth={1.75} className="shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user info */}
        <div className="px-2 py-3 border-t border-ring space-y-2">
          <div className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-lg',
            'hover:bg-canvas cursor-pointer transition-colors',
            collapsed && 'justify-center'
          )}>
            <div className="w-7 h-7 rounded-full bg-brand-200 flex-shrink-0
                            flex items-center justify-center text-brand-700 text-xs font-semibold">
              {user?.name?.[0] ?? 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink truncate">{user?.name}</p>
                <p className="text-2xs text-ghost truncate">Level {user?.level ?? 1}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'absolute -right-3 top-16 w-6 h-6 rounded-full bg-surface border border-ring',
            'flex items-center justify-center shadow-card',
            'hover:bg-brand-50 hover:border-brand-300 transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={12}
            className={cn('text-sub transition-transform duration-300', collapsed && 'rotate-180')}
          />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-end gap-3 h-14 px-6 border-b border-ring bg-surface flex-shrink-0">
          <button
            className="relative p-2 rounded-lg text-sub hover:bg-canvas hover:text-ink transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.75} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-surface" />
          </button>
          <button className="p-2 rounded-lg text-sub hover:bg-canvas hover:text-ink transition-colors">
            <Settings size={18} strokeWidth={1.75} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
