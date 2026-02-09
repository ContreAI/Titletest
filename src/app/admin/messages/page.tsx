"use client";

import { AdminHeader } from "@/components/admin/layout";
import { Card } from "@/components/common";
import { Mail, MapPin } from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────
interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  subject: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  transactionAddress: string;
}

// ── Mock Data ───────────────────────────────────────────────────────
const MOCK_MESSAGES: Message[] = [
  {
    id: "msg-1",
    senderName: "Rachel Kim",
    senderRole: "Buyer's Agent",
    subject: "Inspection contingency deadline",
    preview:
      "Hi team, just wanted to confirm that the inspection contingency deadline for 742 Evergreen is this Friday. Please let us know if there are any outstanding items we need to address before then.",
    timestamp: "2026-02-09T09:45:00Z",
    unread: true,
    transactionAddress: "742 Evergreen Terrace",
  },
  {
    id: "msg-2",
    senderName: "David Morales",
    senderRole: "Lender",
    subject: "Appraisal report ready for review",
    preview:
      "The appraisal for 221B Baker Street has been completed and the report is now available. Value came in at contract price. Let me know if you need any additional documentation.",
    timestamp: "2026-02-09T08:12:00Z",
    unread: true,
    transactionAddress: "221B Baker Street",
  },
  {
    id: "msg-3",
    senderName: "Jennifer Walsh",
    senderRole: "Seller's Agent",
    subject: "Re: Repair credit agreement",
    preview:
      "The sellers have agreed to the $3,500 repair credit. I've attached the signed amendment for your records. Please update the settlement statement accordingly.",
    timestamp: "2026-02-08T16:30:00Z",
    unread: false,
    transactionAddress: "1600 Pennsylvania Ave",
  },
  {
    id: "msg-4",
    senderName: "Marcus Thompson",
    senderRole: "Buyer's Agent",
    subject: "Closing date change request",
    preview:
      "My buyers are requesting we push the closing date back by one week to Feb 22nd. The lender needs additional time to finalize the loan package. Can we coordinate with all parties?",
    timestamp: "2026-02-08T11:05:00Z",
    unread: false,
    transactionAddress: "350 Fifth Avenue",
  },
  {
    id: "msg-5",
    senderName: "First National Lending",
    senderRole: "Lender",
    subject: "Clear to close issued",
    preview:
      "We are pleased to confirm that the loan for 10 Downing Street has received clear to close status. Please proceed with scheduling the signing appointment at your earliest convenience.",
    timestamp: "2026-02-07T14:20:00Z",
    unread: false,
    transactionAddress: "10 Downing Street",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Page Component ──────────────────────────────────────────────────
export default function MessagesPage() {
  const unreadCount = MOCK_MESSAGES.filter((m) => m.unread).length;

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Messages"
        subtitle="Communications from transaction parties"
      />

      <div className="p-6">
        <Card variant="default" padding="none">
          {/* Card header */}
          <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Inbox
              </h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-spruce text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              {MOCK_MESSAGES.length} messages
            </span>
          </div>

          {/* Message list */}
          <div className="divide-y divide-divider">
            {MOCK_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 px-4 py-4 hover:bg-elevation1 transition-colors cursor-pointer ${
                  msg.unread ? "bg-spruce/[0.03]" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                    msg.unread
                      ? "bg-spruce/10 text-spruce"
                      : "bg-elevation2 text-[var(--text-tertiary)]"
                  }`}
                >
                  {getInitials(msg.senderName)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className={`text-sm truncate ${
                        msg.unread
                          ? "font-semibold text-[var(--text-primary)]"
                          : "font-medium text-[var(--text-primary)]"
                      }`}
                    >
                      {msg.senderName}
                    </p>
                    <span className="text-[11px] text-[var(--text-tertiary)] flex-shrink-0">
                      {msg.senderRole}
                    </span>
                  </div>

                  <p
                    className={`text-sm truncate ${
                      msg.unread
                        ? "font-semibold text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {msg.subject}
                  </p>

                  <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                    {msg.preview}
                  </p>

                  {/* Transaction tag */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin className="w-3 h-3 text-[var(--text-tertiary)]" />
                    <span className="text-[11px] text-[var(--text-tertiary)]">
                      {msg.transactionAddress}
                    </span>
                  </div>
                </div>

                {/* Right side: timestamp + unread indicator */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                  {msg.unread && (
                    <span className="w-2 h-2 rounded-full bg-spruce" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
