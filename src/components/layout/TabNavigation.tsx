"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  FileSignature,
  Building2,
  DollarSign,
  PenTool,
  Menu,
  X,
} from "lucide-react";
import { TabId } from "@/types";

export interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  alert?: boolean;
}

export interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  pendingCounts?: Partial<Record<TabId, number>>;
  signingNeeded?: boolean;
}

const tabs: TabConfig[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "contract", label: "Contract", icon: <FileSignature className="w-4 h-4" /> },
  { id: "title", label: "Title", icon: <Building2 className="w-4 h-4" /> },
  { id: "financial", label: "Financial", icon: <DollarSign className="w-4 h-4" /> },
  { id: "closing", label: "Closing", icon: <PenTool className="w-4 h-4" /> },
];

export default function TabNavigation({
  activeTab,
  onTabChange,
  pendingCounts = {},
  signingNeeded = false,
}: TabNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const activeTabConfig = tabs.find((t) => t.id === activeTab);

  const handleTabChange = (tabId: TabId) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const getBadgeCount = (tabId: TabId): number => {
    return pendingCounts[tabId] || 0;
  };

  // Calculate sliding indicator position
  const updateIndicator = useCallback(() => {
    const activeEl = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <nav className="bg-paper border-b border-divider">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-4 py-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-between w-full py-2 px-3 rounded-lg bg-elevation1 text-[var(--text-primary)]"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="flex items-center gap-2">
              {activeTabConfig?.icon}
              <span className="font-medium">{activeTabConfig?.label}</span>
              {getBadgeCount(activeTab) > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-spruce text-white">
                  {getBadgeCount(activeTab)}
                </span>
              )}
              {activeTab === "closing" && signingNeeded && (
                <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              )}
            </div>
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-10"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              id="mobile-menu"
              className="absolute left-0 right-0 bg-paper border-b border-divider shadow-[var(--shadow-2)] z-20"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const badgeCount = getBadgeCount(tab.id);
                const showAlert = tab.id === "closing" && signingNeeded;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      relative flex items-center gap-3 w-full px-6 py-3 text-left
                      transition-all duration-200 min-h-[48px]
                      ${
                        isActive
                          ? "bg-spruce/5 text-spruce border-l-3 border-spruce"
                          : "text-[var(--text-tertiary)] hover:bg-elevation1 hover:text-[var(--text-primary)] border-l-3 border-transparent"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>

                    {badgeCount > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-spruce text-white min-w-[20px] text-center">
                        {badgeCount}
                      </span>
                    )}

                    {showAlert && badgeCount === 0 && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-amber animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Desktop Navigation — with sliding indicator */}
      <div className="hidden md:block px-4 md:px-6">
        <div ref={containerRef} className="relative flex overflow-x-auto scrollbar-hide -mb-px">
          {/* Sliding indicator pill */}
          <div
            className="absolute bottom-0 h-0.5 bg-spruce rounded-full transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />

          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const badgeCount = getBadgeCount(tab.id);
            const showAlert = tab.id === "closing" && signingNeeded;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el);
                }}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 border-transparent
                  transition-colors duration-200
                  ${
                    isActive
                      ? "text-spruce"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.icon}
                <span>{tab.label}</span>

                {/* Badge */}
                {badgeCount > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full min-w-[18px] text-center ${
                    isActive
                      ? 'bg-spruce text-white'
                      : 'bg-elevation2 text-[var(--text-tertiary)]'
                  }`}>
                    {badgeCount}
                  </span>
                )}

                {/* Alert dot */}
                {showAlert && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
