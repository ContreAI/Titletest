"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Clock,
  MessageSquare,
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useThemeContext } from "@/components/providers/ThemeProvider";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: "Pipeline", href: "/admin/pipeline", icon: FolderKanban },
  { label: "Transactions", href: "/admin/transactions", icon: FileText },
  { label: "Templates", href: "/admin/templates", icon: Clock },
];

const secondaryNavItems: NavItem[] = [
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useThemeContext();

  const isActive = (href: string) => {
    if (href === "/admin/pipeline" && pathname === "/admin") return true;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        flex flex-col h-screen sticky top-0
        bg-storm-gray/95 backdrop-blur-xl
        border-r border-white/[0.06]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Brand area — gradient wash */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-spruce/30 via-transparent to-transparent" />
        <div className="relative flex items-center gap-3 px-4 py-5 border-b border-white/[0.08]">
          <div className="w-8 h-8 bg-spruce rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(60,90,60,0.4)]">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-lg font-bold tracking-wide truncate text-white">
                Contre Title
              </h1>
              <p className="text-xs text-white/50">Admin Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Search hint */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/40 text-sm hover:bg-white/[0.1] hover:text-white/60 transition-all duration-200">
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-3 mb-2">
          {!collapsed && (
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              Main
            </span>
          )}
        </div>
        <ul className="space-y-0.5 px-2">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 ease-out
                  ${
                    isActive(item.href)
                      ? "bg-white/[0.12] text-white border-l-2 border-spruce shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      : "text-white/60 hover:bg-white/[0.08] hover:text-white border-l-2 border-transparent"
                  }
                  ${collapsed ? "justify-center !border-l-0" : ""}
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                  isActive(item.href) ? 'text-spruce-300' : ''
                }`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-signal-red text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-3 mt-6 mb-2">
          {!collapsed && (
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              Settings
            </span>
          )}
        </div>
        <ul className="space-y-0.5 px-2">
          {secondaryNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 ease-out
                  ${
                    isActive(item.href)
                      ? "bg-white/[0.12] text-white border-l-2 border-spruce shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      : "text-white/60 hover:bg-white/[0.08] hover:text-white border-l-2 border-transparent"
                  }
                  ${collapsed ? "justify-center !border-l-0" : ""}
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                  isActive(item.href) ? 'text-spruce-300' : ''
                }`} />
                {!collapsed && <span className="truncate text-sm font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-2 space-y-0.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/[0.08] hover:text-white transition-all duration-200"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon className="w-4 h-4 flex-shrink-0" /> : <Sun className="w-4 h-4 flex-shrink-0" />}
          {!collapsed && <span className="text-sm">{theme === "light" ? "Dark mode" : "Light mode"}</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/[0.08] hover:text-white transition-all duration-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User / Logout */}
      <div className="border-t border-white/[0.08] p-3">
        <div
          className={`
            flex items-center gap-3
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-sea-glass to-spruce-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
            <span className="text-xs font-semibold text-storm-gray">ED</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Emily Davis</p>
              <p className="text-[11px] text-white/40 truncate">Closer</p>
            </div>
          )}
          {!collapsed && (
            <button
              className="p-1.5 text-white/40 hover:text-white transition-colors duration-200 rounded-md hover:bg-white/[0.08]"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
