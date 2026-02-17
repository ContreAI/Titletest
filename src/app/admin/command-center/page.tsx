"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  FileText,
  Clock,
  Users,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/layout";
import { MetricCard } from "@/components/dashboard";
import AlertRibbon from "@/components/admin/command-center/AlertRibbon";
import ClosingCalendarStrip from "@/components/admin/command-center/ClosingCalendarStrip";
import FireList from "@/components/admin/command-center/FireList";
import WorkloadHeatmap from "@/components/admin/command-center/WorkloadHeatmap";
import ActivityFeed from "@/components/admin/command-center/ActivityFeed";
import { mockAdminTransactions, mockEmployees } from "@/data/adminMockData";

// Compute alert items from transactions
function computeAlerts(
  transactions: typeof mockAdminTransactions
): { type: "trid" | "overdue" | "wire"; message: string; count?: number; transactionId?: string }[] {
  const alerts: { type: "trid" | "overdue" | "wire"; message: string; count?: number; transactionId?: string }[] = [];

  let totalOverdue = 0;
  transactions.forEach((tx) => {
    const buyerOverdue = tx.buyerTaskProgress?.overdue ?? 0;
    const sellerOverdue = tx.sellerTaskProgress?.overdue ?? 0;
    totalOverdue += buyerOverdue + sellerOverdue;

    if (tx.tridCompliance && !tx.tridCompliance.isCompliant) {
      alerts.push({
        type: "trid",
        message: `TRID violation risk: ${tx.property.address}`,
        transactionId: tx.id,
      });
    }
  });

  if (totalOverdue > 0) {
    alerts.push({
      type: "overdue",
      message: `${totalOverdue} overdue items across all transactions`,
      count: totalOverdue,
    });
  }

  return alerts;
}

// Compute employee workload
function computeWorkload(
  employees: typeof mockEmployees,
  transactions: typeof mockAdminTransactions
) {
  return employees
    .filter((e) => e.role === "closer" || e.role === "processor")
    .map((emp) => {
      const assigned = transactions.filter(
        (tx) => tx.assignedCloserId === emp.id
      );
      const closingThisWeek = assigned.filter((tx) => {
        const closing = new Date(tx.dates.closingDate);
        const now = new Date();
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return closing >= now && closing <= weekEnd;
      });
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        activeCount: assigned.length,
        closingThisWeek: closingThisWeek.length,
      };
    });
}

// Mock activity feed data
const MOCK_ACTIVITIES = [
  {
    id: "act-1",
    type: "doc_upload" as const,
    description: "Title commitment uploaded",
    transactionAddress: "742 Evergreen Terrace",
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    actorName: "Emily Davis",
  },
  {
    id: "act-2",
    type: "stage_change" as const,
    description: "Moved to Title & Escrow",
    transactionAddress: "1600 Pennsylvania Ave",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    actorName: "Tom Anderson",
  },
  {
    id: "act-3",
    type: "signing_scheduled" as const,
    description: "Closing signing scheduled for Feb 15",
    transactionAddress: "221B Baker Street",
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    actorName: "Sarah Mitchell",
  },
  {
    id: "act-4",
    type: "task_completed" as const,
    description: "Buyer acknowledged escrow instructions",
    transactionAddress: "742 Evergreen Terrace",
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    actorName: "Homer Simpson",
  },
  {
    id: "act-5",
    type: "new_transaction" as const,
    description: "New purchase transaction created",
    transactionAddress: "350 Fifth Avenue",
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    actorName: "Emily Davis",
  },
  {
    id: "act-6",
    type: "message" as const,
    description: "Message from buyer's agent re: inspection",
    transactionAddress: "1600 Pennsylvania Ave",
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    actorName: "Lisa Kudrow",
  },
  {
    id: "act-7",
    type: "doc_upload" as const,
    description: "Appraisal report uploaded by lender",
    transactionAddress: "10 Downing Street",
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    actorName: "Wells Fargo Lending",
  },
  {
    id: "act-8",
    type: "task_completed" as const,
    description: "Seller signed disclosure statement",
    transactionAddress: "221B Baker Street",
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    actorName: "John Watson",
  },
];

export default function CommandCenterPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const alerts = computeAlerts(mockAdminTransactions);
  const workload = computeWorkload(mockEmployees, mockAdminTransactions);

  // Metrics
  const activeCount = mockAdminTransactions.filter(
    (tx) =>
      tx.pipelineStage !== "closed" && tx.pipelineStage !== "cancelled"
  ).length;

  const closingThisWeek = mockAdminTransactions.filter((tx) => {
    const closing = new Date(tx.dates.closingDate);
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return closing >= now && closing <= weekEnd;
  }).length;

  let totalOverdue = 0;
  let pendingDocs = 0;
  let postClosingPending = 0;
  mockAdminTransactions.forEach((tx) => {
    totalOverdue +=
      (tx.buyerTaskProgress?.overdue ?? 0) +
      (tx.sellerTaskProgress?.overdue ?? 0);
    pendingDocs += tx.pendingDocumentCount;
    if (tx.pipelineStage === "closed") {
      postClosingPending += (tx.postClosingItems ?? []).filter(
        (i) => i.status === "pending" || i.status === "late"
      ).length;
    }
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Command Center"
        subtitle="Overview of all active transactions"
      />

      <div className="p-6 space-y-6">
        {/* Alert Ribbon */}
        {alerts.length > 0 && <AlertRibbon items={alerts} />}

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Active Transactions"
            value={activeCount}
            icon={<FileText className="w-5 h-5" />}
            iconColor="text-royal"
            iconBg="bg-royal/10"
          />
          <MetricCard
            title="Closing This Week"
            value={closingThisWeek}
            icon={<Clock className="w-5 h-5" />}
            iconColor={closingThisWeek > 5 ? "text-amber-400" : "text-royal"}
            iconBg={closingThisWeek > 5 ? "bg-amber/10" : "bg-royal/10"}
          />
          <MetricCard
            title="Overdue Items"
            value={totalOverdue}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconColor="text-signal-red"
            iconBg="bg-signal-red/10"
          />
          <MetricCard
            title="Pending Documents"
            value={pendingDocs}
            icon={<FileText className="w-5 h-5" />}
            iconColor="text-river-stone"
            iconBg="bg-river-stone/10"
          />
          <MetricCard
            title="Post-Closing Pending"
            value={postClosingPending}
            icon={<Activity className="w-5 h-5" />}
            iconColor="text-sea-glass"
            iconBg="bg-sea-glass/10"
          />
        </div>

        {/* Closing Calendar Strip */}
        <ClosingCalendarStrip
          transactions={mockAdminTransactions}
          onDayClick={setSelectedDate}
        />

        {/* Two Column: Fire List + Workload/Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Fire List — takes 3 cols */}
          <div className="lg:col-span-3">
            <FireList
              transactions={mockAdminTransactions}
              onGoClick={(txId) => {
                window.location.href = `/admin/transactions/${txId}`;
              }}
            />
          </div>

          {/* Right column: Workload + Activity */}
          <div className="lg:col-span-2 space-y-6">
            <WorkloadHeatmap employees={workload} />
            <ActivityFeed activities={MOCK_ACTIVITIES} />
          </div>
        </div>
      </div>
    </div>
  );
}
