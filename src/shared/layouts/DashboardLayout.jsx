import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingBag,
  Globe,
  User,
  LogOut,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { to: "/dashboard",  icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/quiz",       icon: Zap,              label: "Quiz"       },
  { to: "/classroom",  icon: BookOpen,         label: "Classroom"  },
  { to: "/community",  icon: Globe,            label: "Community"  },
  { to: "/social",     icon: Users,            label: "Social"     },
  { to: "/shop",       icon: ShoppingBag,      label: "Shop"       },
  { to: "/profile",    icon: User,             label: "Profile"    },
];

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
            : "text-surface-400 hover:text-surface-100 hover:bg-surface-800"
        )
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* ── Sidebar ────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-surface-800/60 bg-surface-950 px-3 py-5">
        {/* Logo */}
        <div className="px-3 mb-8 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg gradient-levelup flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-surface-50 tracking-tight text-sm">
            QuizzApp<span className="text-brand-400"> Indo</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Sign out */}
        <button className="flex items-center gap-3 px-3 py-2.5 text-sm text-surface-500 hover:text-danger hover:bg-surface-800 rounded-lg transition-colors duration-150 cursor-pointer border-none bg-transparent">
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* ── Main Content ───────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
