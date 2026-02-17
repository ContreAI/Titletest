"use client";

import { PackageCheck, Clock, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { AdminHeader } from "@/components/admin/layout";
import { Card } from "@/components/common";

interface PostClosingItem {
  id: string;
  transactionAddress: string;
  type: "recorded_deed" | "owner_title_policy" | "lender_title_policy" | "1099s";
  closingDate: string;
  expectedBy: string;
  status: "pending" | "received" | "pushed" | "late";
  daysElapsed: number;
}

const TYPE_LABELS: Record<PostClosingItem["type"], string> = {
  recorded_deed: "Recorded Deed",
  owner_title_policy: "Owner's Title Policy",
  lender_title_policy: "Lender's Title Policy",
  "1099s": "1099-S Tax Form",
};

const TYPE_WINDOWS: Record<PostClosingItem["type"], string> = {
  recorded_deed: "7-60 days",
  owner_title_policy: "30-90 days",
  lender_title_policy: "30-90 days",
  "1099s": "By Jan 31",
};

const MOCK_ITEMS: PostClosingItem[] = [
  { id: "pc-1", transactionAddress: "742 Evergreen Terrace", type: "recorded_deed", closingDate: "2025-12-15", expectedBy: "2026-02-13", status: "late", daysElapsed: 56 },
  { id: "pc-2", transactionAddress: "742 Evergreen Terrace", type: "owner_title_policy", closingDate: "2025-12-15", expectedBy: "2026-03-15", status: "pending", daysElapsed: 56 },
  { id: "pc-3", transactionAddress: "221B Baker Street", type: "recorded_deed", closingDate: "2026-01-10", expectedBy: "2026-03-11", status: "received", daysElapsed: 30 },
  { id: "pc-4", transactionAddress: "221B Baker Street", type: "owner_title_policy", closingDate: "2026-01-10", expectedBy: "2026-04-10", status: "pending", daysElapsed: 30 },
  { id: "pc-5", transactionAddress: "1600 Pennsylvania Ave", type: "1099s", closingDate: "2025-11-20", expectedBy: "2026-01-31", status: "pushed", daysElapsed: 81 },
  { id: "pc-6", transactionAddress: "10 Downing Street", type: "lender_title_policy", closingDate: "2026-01-05", expectedBy: "2026-04-05", status: "pending", daysElapsed: 35 },
];

const statusConfig = {
  late: { label: "Late", bg: "bg-signal-red/10", text: "text-signal-red", icon: AlertTriangle },
  pending: { label: "Pending", bg: "bg-amber/10", text: "text-amber-400", icon: Clock },
  received: { label: "Received", bg: "bg-sea-glass/10", text: "text-sea-glass", icon: FileText },
  pushed: { label: "Pushed", bg: "bg-fern/10", text: "text-fern", icon: CheckCircle2 },
};

export default function PostClosingPage() {
  const sortedItems = [...MOCK_ITEMS].sort((a, b) => {
    const order = { late: 0, pending: 1, received: 2, pushed: 3 };
    return order[a.status] - order[b.status];
  });

  const lateCount = MOCK_ITEMS.filter((i) => i.status === "late").length;
  const pendingCount = MOCK_ITEMS.filter((i) => i.status === "pending").length;

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Post-Closing Queue"
        subtitle={`${lateCount} late, ${pendingCount} pending items`}
      />

      <div className="p-6">
        <Card variant="default" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-divider">
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Property</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Window</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Days Elapsed</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => {
                  const cfg = statusConfig[item.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={item.id} className="border-b border-divider last:border-0 hover:bg-elevation1 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{item.transactionAddress}</span>
                        <p className="text-xs text-[var(--text-tertiary)]">Closed {item.closingDate}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{TYPE_LABELS[item.type]}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-tertiary)]">{TYPE_WINDOWS[item.type]}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--text-primary)]">{item.daysElapsed}d</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(item.status === "pending" || item.status === "late") && (
                          <button className="text-xs font-medium text-royal hover:text-royal-300 transition-colors">
                            Upload & Push
                          </button>
                        )}
                        {item.status === "received" && (
                          <button className="text-xs font-medium text-royal hover:text-royal-300 transition-colors">
                            Push to Portal
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
