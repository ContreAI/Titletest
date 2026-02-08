"use client";

import { useState } from "react";
import { Search, Bell, Plus, X } from "lucide-react";
import Link from "next/link";
import Button from "@/components/common/Button";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showNewTransaction?: boolean;
}

export function AdminHeader({
  title,
  subtitle,
  showSearch = true,
  showNewTransaction = true,
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notification count
  const notificationCount = 3;

  return (
    <header className="bg-paper border-b border-border sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Title or Search */}
        <div className="flex items-center gap-6 flex-1">
          {title ? (
            <div>
              <h1 className="text-xl font-display font-bold text-storm-gray">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-river-stone">{subtitle}</p>
              )}
            </div>
          ) : null}

          {showSearch && (
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-river-stone" />
              <input
                type="text"
                placeholder="Search transactions, addresses, parties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2
                  bg-mist border border-border rounded-lg
                  text-sm text-storm-gray placeholder:text-river-stone
                  focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce
                  transition-colors
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-river-stone hover:text-storm-gray"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="
                relative p-2 rounded-lg
                text-river-stone hover:text-storm-gray hover:bg-mist
                transition-colors
              "
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-signal-red text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-paper rounded-lg shadow-lg border border-border z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="font-medium text-storm-gray">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <NotificationItem
                      title="Document uploaded"
                      description="Appraisal received for 123 Main St"
                      time="5 min ago"
                      unread
                    />
                    <NotificationItem
                      title="Signing scheduled"
                      description="456 Oak Ave - Jan 15 at 2:00 PM"
                      time="1 hour ago"
                      unread
                    />
                    <NotificationItem
                      title="Title cleared"
                      description="789 Pine Rd ready for closing"
                      time="2 hours ago"
                      unread
                    />
                    <NotificationItem
                      title="Contract received"
                      description="New transaction: 321 Elm St"
                      time="Yesterday"
                    />
                  </div>
                  <div className="px-4 py-2 border-t border-border">
                    <Link
                      href="/admin/notifications"
                      className="text-sm text-spruce hover:underline"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* New Transaction Button */}
          {showNewTransaction && (
            <Link href="/admin/transactions/new">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                New Transaction
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NotificationItem({
  title,
  description,
  time,
  unread,
}: {
  title: string;
  description: string;
  time: string;
  unread?: boolean;
}) {
  return (
    <div
      className={`
        px-4 py-3 border-b border-border last:border-b-0
        hover:bg-mist/50 cursor-pointer transition-colors
        ${unread ? "bg-sea-glass/10" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        {unread && (
          <span className="w-2 h-2 bg-spruce rounded-full mt-1.5 flex-shrink-0" />
        )}
        <div className={unread ? "" : "pl-5"}>
          <p className="text-sm font-medium text-storm-gray">{title}</p>
          <p className="text-sm text-river-stone">{description}</p>
          <p className="text-xs text-river-stone/70 mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}
