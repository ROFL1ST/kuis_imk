// src/shared/ui/layout/AppShell.jsx
// Wraps all authenticated pages: sidebar (desktop) + main content area.
// Mobile (<1024px): sidebar collapses to a bottom tab bar.
import { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, Trophy, ShoppingBag, MessageCircle,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { cn } from '@/shared/lib/cn';

// Bottom tab bar items (mobile only — max 5 for thumb reach)
const TABS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home'  },
  { to: '/quiz',      icon: BookOpen,        label: 'Quiz'  },
  { to: '/classroom', icon: Users,           label: 'Class' },
  { to: '/social',    icon: Trophy,          label: 'Rank'  },
  { to: '/community', icon: MessageCircle,   label: 'Feed'  },
];

export function AppShell({ user, onLogout, children }) {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar user={user} onLogout={onLogout} />
      )}

      {/* Main content — offset by sidebar on desktop */}
      <main
        className={cn(
          'flex flex-col min-h-screen',
          !isMobile && 'ml-sidebar',
          isMobile  && 'pb-16',   // space for bottom tab bar
        )}
      >
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30
                     bg-surface/90 backdrop-blur-md
                     border-t border-ring/70
                     flex items-center justify-around
                     px-2 py-1"
          aria-label="Main navigation"
        >
          {TABS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl',
                  'text-2xs font-medium transition-colors',
                  'min-w-[44px] min-h-[44px] justify-center',
                  isActive
                    ? 'text-brand-500 bg-brand-50'
                    : 'text-ghost hover:text-sub',
                )
              }
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PageWrapper — consistent inner page padding + optional header row
// Usage: <PageWrapper title="Dashboard" subtitle="Overview"> ... </PageWrapper>
// ---------------------------------------------------------------------------
export function PageWrapper({ title, subtitle, actions, children, className }) {
  return (
    <div
      className={cn(
        'flex-1 px-4 py-6 md:px-8 md:py-8 max-w-[1200px] mx-auto w-full',
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            {title && (
              <h1 className="text-xl font-display font-bold text-ink">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-sub mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
