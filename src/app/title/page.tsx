"use client";

import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Upload,
} from "lucide-react";
import { Card, Button } from "@/components/common";
import { mockAdminTransactions } from "@/data/adminMockData";

const STAGE_LABELS: Record<string, string> = {
  new_pending: "New / Pending",
  title_work: "Title Work",
  clear_to_close: "Clear to Close",
  scheduled: "Closing Scheduled",
  closed: "Closed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

const STAGE_COLORS: Record<string, string> = {
  new_pending: "bg-sea-glass/20 text-sea-glass-700",
  title_work: "bg-spruce/10 text-spruce",
  clear_to_close: "bg-fern/10 text-fern-700",
  scheduled: "bg-amber-50 text-amber-700",
  closed: "bg-river-stone/10 text-river-stone",
  on_hold: "bg-signal-red/10 text-signal-red",
  cancelled: "bg-river-stone/10 text-river-stone",
};

export default function TitleDashboard() {
  // Get active transactions (not closed/cancelled)
  const activeTransactions = mockAdminTransactions.filter(
    (t) => !["closed", "cancelled"].includes(t.pipelineStage)
  );
  const recentlyClosed = mockAdminTransactions.filter(
    (t) => t.pipelineStage === "closed"
  );

  // Stats
  const stats = {
    active: activeTransactions.length,
    pendingActions: activeTransactions.filter(
      (t) => t.pipelineStage === "new_pending"
    ).length,
    closingThisWeek: activeTransactions.filter(
      (t) => t.pipelineStage === "scheduled"
    ).length,
    recentlyClosed: recentlyClosed.length,
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome + Quick Action */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Upload contracts and monitor transaction progress
            </p>
          </div>
          <Link href="/title/upload">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Transaction
            </Button>
          </Link>
        </div>

        {/* Quick Upload CTA */}
        <Link href="/title/upload" className="block group">
          <Card className="border-2 border-dashed border-spruce/30 hover:border-spruce/60 bg-spruce/5 transition-all">
            <div className="flex items-center gap-4 py-2">
              <div className="p-3 rounded-xl bg-spruce/10 text-spruce group-hover:bg-spruce group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-primary)]">
                  Upload a Purchase Contract
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  We'll extract all the data, set up the transaction, and send
                  portal invitations to the agents automatically.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-spruce transition-colors" />
            </div>
          </Card>
        </Link>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Active Transactions"
            value={stats.active}
            icon={FileText}
            color="text-spruce"
          />
          <StatCard
            label="Pending Setup"
            value={stats.pendingActions}
            icon={Clock}
            color="text-amber-600"
          />
          <StatCard
            label="Closing This Week"
            value={stats.closingThisWeek}
            icon={AlertTriangle}
            color="text-sea-glass-700"
          />
          <StatCard
            label="Recently Closed"
            value={stats.recentlyClosed}
            icon={CheckCircle2}
            color="text-fern"
          />
        </div>

        {/* Active Transactions List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Active Transactions
            </h2>
            <Link
              href="/title/transactions"
              className="text-sm text-spruce hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {activeTransactions.slice(0, 8).map((tx) => (
              <Link
                key={tx.id}
                href={`/title/transactions/${tx.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-elevation1)] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] truncate">
                    {tx.property.address}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {tx.property.city}, {tx.property.state} {tx.property.zip}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                    ${tx.financials.purchasePrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Close:{" "}
                    {tx.dates.closingDate
                      ? new Date(tx.dates.closingDate).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    STAGE_COLORS[tx.pipelineStage] || "bg-mist text-river-stone"
                  }`}
                >
                  {STAGE_LABELS[tx.pipelineStage] || tx.pipelineStage}
                </span>
                <ArrowRight className="w-4 h-4 text-[var(--text-disabled)] group-hover:text-spruce transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-[var(--bg-elevation1)] ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
            {value}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">{label}</p>
        </div>
      </div>
    </Card>
  );
}
