"use client";

import { useMemo } from "react";
import {
  Calendar,
  FileCheck,
  AlertCircle,
  Clock,
  Upload,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Card, Button } from "@/components/common";
import { MetricCard } from "@/components/dashboard";
import {
  ActionRequiredPanel,
  WaitingOnPanel,
  UpcomingTimeline,
} from "@/components/journey";
import NetProceedsCard from "@/components/seller/NetProceedsCard";
import SellerJourneyProgress from "@/components/seller/SellerJourneyProgress";
import {
  Transaction,
  TabId,
  TransactionTask,
  NetProceedsEstimate,
  ActionItem,
  WaitingOnItem,
  Milestone,
} from "@/types";
import {
  getSmartBatchedTasks,
  getCompletionPercentage,
  getTaskCounts,
  getPhaseProgress,
} from "@/stores/taskStore";

export interface SellerDashboardTabProps {
  transaction: Transaction;
  tasks: TransactionTask[];
  netProceeds: NetProceedsEstimate;
  onTabChange?: (tabId: TabId) => void;
  onTaskAction?: (task: TransactionTask) => void;
}

// Mock waiting-on data
const mockWaitingOn: WaitingOnItem[] = [
  {
    id: "1",
    party: "buyer",
    item: "Inspection report review",
    expectedDuration: "2-3 business days",
  },
  {
    id: "2",
    party: "title",
    item: "Title commitment preparation",
    expectedDuration: "5-7 business days",
  },
];

const mockMilestones: Milestone[] = [
  {
    id: "1",
    date: "2025-01-10",
    title: "Disclosure deadline",
    type: "deadline",
  },
  {
    id: "2",
    date: "2025-01-13",
    title: "Inspection period ends",
    type: "deadline",
  },
  {
    id: "3",
    date: "2025-01-15",
    title: "CLOSING DAY",
    isClosingDay: true,
    type: "milestone",
    time: "10:00 AM",
    location: "Contre Title Office, 456 Title Ave, Boise ID",
  },
];

export default function SellerDashboardTab({
  transaction,
  tasks,
  netProceeds,
  onTabChange,
  onTaskAction,
}: SellerDashboardTabProps) {
  // Compute metrics from tasks
  const smartBatched = useMemo(
    () => getSmartBatchedTasks(tasks, "seller"),
    [tasks]
  );
  const completionPct = useMemo(() => getCompletionPercentage(tasks), [tasks]);
  const counts = useMemo(() => getTaskCounts(tasks), [tasks]);
  const phases = useMemo(() => getPhaseProgress(tasks), [tasks]);

  // Days to closing
  const daysToClose = useMemo(() => {
    const closing = new Date(transaction.dates.closingDate);
    const now = new Date();
    const diff = Math.ceil(
      (closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  }, [transaction.dates.closingDate]);

  // Convert smart-batched tasks to ActionItem format for existing panel
  const actionItems: ActionItem[] = useMemo(
    () =>
      smartBatched.slice(0, 3).map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.overdueDate || transaction.dates.closingDate,
        actionType: (t.portalAction === "e_sign"
          ? "sign"
          : t.portalAction === "upload" ||
              t.portalAction === "upload_pay" ||
              t.portalAction === "upload_form"
            ? "upload"
            : t.portalAction === "review_approve"
              ? "review"
              : "confirm") as ActionItem["actionType"],
        urgency: (t.status === "overdue" ? "high" : "medium") as ActionItem["urgency"],
      })),
    [smartBatched, transaction.dates.closingDate]
  );

  return (
    <div className="space-y-[var(--section-spacing)] stagger-fade-in">
      {/* ====== Row 1: Net Proceeds Hero (2 cols) + Metrics (1 col) ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--content-gap)]">
        {/* Net Proceeds Card — spans 2 columns */}
        <div className="lg:col-span-2">
          <NetProceedsCard
            estimate={netProceeds}
            onViewBreakdown={() => onTabChange?.("money")}
          />
        </div>

        {/* KPI Metrics — stacked on the right */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-[var(--content-gap)]">
          <MetricCard
            title="Days to Close"
            value={daysToClose}
            icon={<Calendar />}
            iconColor="text-royal"
            iconBg="bg-royal/10"
          />
          <MetricCard
            title="Tasks Complete"
            value={`${counts.completed}/${counts.total}`}
            icon={<FileCheck />}
            iconColor="text-fern"
            iconBg="bg-fern/10"
          />
          <MetricCard
            title="Action Items"
            value={counts.actionRequired + counts.overdue}
            icon={<AlertCircle />}
            iconColor="text-amber-400"
            iconBg="bg-amber/10"
          />
          <MetricCard
            title="Waiting on Buyer"
            value={counts.inReview}
            icon={<Clock />}
            iconColor="text-sea-glass"
            iconBg="bg-sea-glass/10"
          />
        </div>
      </div>

      {/* ====== Row 2: Action Required + Journey Progress ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[var(--content-gap)]">
        {/* Action Required — larger share with smart batching */}
        <div className="lg:col-span-3">
          {actionItems.length > 0 ? (
            <div>
              <ActionRequiredPanel
                items={actionItems}
                onAction={() => onTabChange?.("disclosures")}
              />
              {smartBatched.length > 3 && (
                <button
                  onClick={() => onTabChange?.("disclosures")}
                  className="mt-2 flex items-center gap-1 text-sm font-medium text-royal hover:text-royal-700 transition-colors"
                >
                  View all {smartBatched.length} tasks
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <Card>
              <div className="flex items-center justify-center py-8 text-[var(--text-tertiary)]">
                No action items — you&apos;re all caught up!
              </div>
            </Card>
          )}
        </div>

        {/* Seller Journey Progress — compact vertical tracker */}
        <div className="lg:col-span-2">
          <SellerJourneyProgress phases={phases} />
        </div>
      </div>

      {/* ====== Row 3: Upcoming Timeline + Waiting On ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--content-gap)]">
        <UpcomingTimeline
          milestones={mockMilestones}
          maxItems={4}
          onViewAll={() => onTabChange?.("closing")}
        />
        <WaitingOnPanel items={mockWaitingOn} />
      </div>

      {/* ====== Row 4: Quick Actions ====== */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            leftIcon={<Upload className="w-4 h-4" />}
            className="justify-start"
          >
            Upload Document
          </Button>
          <Button
            variant="outline"
            leftIcon={<MessageCircle className="w-4 h-4" />}
            className="justify-start"
          >
            Message Escrow
          </Button>
          <Button
            variant="outline"
            onClick={() => onTabChange?.("disclosures")}
            className="justify-start"
          >
            Disclosures
          </Button>
          <Button
            variant="outline"
            onClick={() => onTabChange?.("money")}
            className="justify-start"
          >
            View Financials
          </Button>
        </div>
      </Card>
    </div>
  );
}
