"use client";

import { AdminHeader } from "@/components/admin/layout";
import { Card } from "@/components/common";
import { Bell, Check, Clock, Mail, MessageSquare, Smartphone } from "lucide-react";

interface Notification {
  id: string;
  type: "email" | "sms" | "portal";
  recipient: string;
  subject: string;
  transactionAddress: string;
  sentAt: string;
  status: "sent" | "delivered" | "read" | "failed";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n-1", type: "email", recipient: "homer@springfield.com", subject: "Closing Disclosure Ready for Review", transactionAddress: "742 Evergreen Terrace", sentAt: "2026-02-08T10:30:00Z", status: "read" },
  { id: "n-2", type: "portal", recipient: "Homer Simpson", subject: "New document in your vault: Title Commitment", transactionAddress: "742 Evergreen Terrace", sentAt: "2026-02-08T09:15:00Z", status: "delivered" },
  { id: "n-3", type: "sms", recipient: "+1 (208) 555-0001", subject: "Wire instructions available in your portal", transactionAddress: "221B Baker Street", sentAt: "2026-02-07T14:00:00Z", status: "sent" },
  { id: "n-4", type: "email", recipient: "watson@baker.st", subject: "Action Required: Review Settlement Statement", transactionAddress: "221B Baker Street", sentAt: "2026-02-07T11:30:00Z", status: "delivered" },
  { id: "n-5", type: "email", recipient: "agent@realty.com", subject: "Closing scheduled for Feb 15", transactionAddress: "1600 Pennsylvania Ave", sentAt: "2026-02-06T16:00:00Z", status: "read" },
  { id: "n-6", type: "portal", recipient: "Ned Flanders", subject: "Repair request from buyer", transactionAddress: "742 Evergreen Terrace", sentAt: "2026-02-06T10:00:00Z", status: "failed" },
];

const typeIcons = {
  email: Mail,
  sms: Smartphone,
  portal: Bell,
};

const statusConfig = {
  sent: { label: "Sent", color: "text-amber-600 bg-amber-50" },
  delivered: { label: "Delivered", color: "text-sea-glass bg-sea-glass/10" },
  read: { label: "Read", color: "text-fern bg-fern/10" },
  failed: { label: "Failed", color: "text-signal-red bg-signal-red/10" },
};

export default function NotificationsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Notifications"
        subtitle="Track all outbound notifications to parties"
      />

      <div className="p-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(["sent", "delivered", "read", "failed"] as const).map((status) => {
            const count = MOCK_NOTIFICATIONS.filter((n) => n.status === status).length;
            const cfg = statusConfig[status];
            return (
              <Card key={status} variant="default" padding="md">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                  {cfg.label}
                </p>
                <p className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                  {count}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Notification List */}
        <Card variant="default" padding="none">
          <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Notifications</h3>
            <span className="text-xs text-[var(--text-tertiary)]">{MOCK_NOTIFICATIONS.length} total</span>
          </div>
          <div className="divide-y divide-divider">
            {MOCK_NOTIFICATIONS.map((notif) => {
              const TypeIcon = typeIcons[notif.type];
              const cfg = statusConfig[notif.status];
              return (
                <div key={notif.id} className="flex items-center gap-3 px-4 py-3 hover:bg-elevation1 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-elevation2 flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{notif.subject}</p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate">
                      To: {notif.recipient} &middot; {notif.transactionAddress}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
                    {new Date(notif.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
