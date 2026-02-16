"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Calendar,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Card } from "@/components/common";
import { Transaction, TransactionSide } from "@/types";
import ClientStatusCard from "./ClientStatusCard";

export interface AgentDashboardProps {
  side: "buyer" | "seller";
  transaction: Transaction;
  sideData: TransactionSide;
}

export default function AgentDashboard({
  side,
  transaction,
  sideData,
}: AgentDashboardProps) {
  const clientNames =
    sideData.clients.map((c) => c.name).join(" & ") || "Not yet provided";
  const isBuyer = side === "buyer";

  // Mock task stats
  const taskStats = {
    total: isBuyer ? 35 : 27,
    completed: isBuyer ? 6 : 4,
    actionRequired: isBuyer ? 3 : 2,
    upcoming: isBuyer ? 26 : 21,
  };

  const nextActions = isBuyer
    ? [
        {
          label: "Upload home inspection report",
          due: "Day 5-12",
          who: "Agent",
        },
        {
          label: "Upload specialty inspection reports",
          due: "Day 5-15",
          who: "Agent",
        },
        {
          label: "Upload repair request (if applicable)",
          due: "Day 8-15",
          who: "Agent",
        },
      ]
    : [
        {
          label: "Upload Seller's Disclosure Statement",
          due: "Day 1-7",
          who: "Seller",
        },
        {
          label: "Upload Lead-Based Paint Disclosure",
          due: "Day 1-7",
          who: "Seller",
        },
        {
          label: "Provide HOA documents",
          due: "Day 3-10",
          who: "Seller/HOA",
        },
      ];

  const recentAutomations = [
    {
      label: "Portal invitation email sent",
      time: "2 hours ago",
      status: "completed",
    },
    {
      label: "AI report generated for purchase contract",
      time: "2 hours ago",
      status: "completed",
    },
    {
      label: isBuyer
        ? "Wire instructions pending client onboarding"
        : "Seller info form pending",
      time: "Waiting",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tasks Completed"
          value={`${taskStats.completed}/${taskStats.total}`}
          icon={CheckCircle2}
          color="text-fern"
        />
        <StatCard
          label="Action Required"
          value={taskStats.actionRequired}
          icon={AlertTriangle}
          color="text-amber-600"
        />
        <StatCard
          label="Days to Close"
          value={Math.max(
            0,
            Math.ceil(
              (new Date(transaction.dates.closingDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          )}
          icon={Calendar}
          color="text-spruce"
        />
        <StatCard
          label="Documents"
          value={isBuyer ? 8 : 5}
          icon={FileText}
          color="text-sea-glass-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Next Actions Required
            </h2>
            <div className="space-y-3">
              {nextActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-elevation1)] hover:bg-[var(--bg-elevation2)] transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {action.label}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Due: {action.due} &middot; {action.who}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-disabled)] flex-shrink-0" />
                </div>
              ))}
            </div>
          </Card>

          {/* Client Status */}
          <ClientStatusCard
            side={side}
            clientNames={clientNames}
            sideData={sideData}
          />
        </div>

        {/* Recent Automation */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-sea-glass-700" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentAutomations.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  {item.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-fern flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Dates */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-spruce" />
              Key Dates
            </h2>
            <div className="space-y-2">
              <DateRow
                label="Contract"
                date={transaction.dates.contractDate}
              />
              <DateRow
                label="Closing"
                date={transaction.dates.closingDate}
              />
              {transaction.dates.signingWindowStart && (
                <DateRow
                  label="Signing Window"
                  date={`${transaction.dates.signingWindowStart} - ${transaction.dates.signingWindowEnd}`}
                />
              )}
            </div>
          </Card>
        </div>
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
  value: string | number;
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
          <p className="text-xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
            {value}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function DateRow({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-medium text-[var(--text-primary)]">
        {date.includes(" - ")
          ? date
          : new Date(date).toLocaleDateString()}
      </span>
    </div>
  );
}
