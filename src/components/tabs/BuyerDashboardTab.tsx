"use client";

import { useMemo } from "react";
import {
  Calendar,
  FileCheck,
  AlertCircle,
  FolderOpen,
  DollarSign,
  Upload,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Card, Button } from "@/components/common";
import { MetricCard } from "@/components/dashboard";
import {
  TransactionJourneyTracker,
  ActionRequiredPanel,
  WaitingOnPanel,
  UpcomingTimeline,
} from "@/components/journey";
import NextActionHero from "@/components/buyer/NextActionHero";
import {
  Transaction,
  TabId,
  TransactionPhase,
  TransactionTask,
  ActionItem,
  WaitingOnItem,
  Milestone,
  PhaseAlert,
  PhaseCheckpoint,
} from "@/types";
import {
  getNextAction,
  getActionRequired,
  getCompletionPercentage,
  getTaskCounts,
} from "@/stores/taskStore";

export interface BuyerDashboardTabProps {
  transaction: Transaction;
  tasks: TransactionTask[];
  onTabChange?: (tabId: TabId) => void;
  onTaskAction?: (task: TransactionTask) => void;
}

// Mock journey data — in production, derived from tasks + API
const mockJourneyData = {
  currentPhase: "financing" as TransactionPhase,
  percentComplete: 68,

  waitingOn: [
    {
      id: "1",
      party: "lender" as const,
      item: "Final underwriting approval",
      expectedDuration: "3-4 business days",
    },
    {
      id: "2",
      party: "lender" as const,
      item: "Clear to Close letter",
      expectedDuration: "After underwriting",
    },
    {
      id: "3",
      party: "title" as const,
      item: "Final Settlement Statement",
      expectedDuration: "After lender CTC",
    },
  ] as WaitingOnItem[],

  upcomingMilestones: [
    {
      id: "1",
      date: "2025-01-08",
      title: "Insurance binder due",
      type: "deadline" as const,
    },
    {
      id: "2",
      date: "2025-01-10",
      title: "Review Closing Disclosure",
      description: "3-day waiting period begins",
      type: "deadline" as const,
    },
    {
      id: "3",
      date: "2025-01-13",
      title: "Final walkthrough",
      description: "Confirm property condition",
      type: "appointment" as const,
    },
    {
      id: "4",
      date: "2025-01-15",
      title: "CLOSING DAY",
      isClosingDay: true,
      type: "milestone" as const,
      time: "10:00 AM",
      location: "Contre Title Office, 456 Title Ave, Boise ID",
    },
  ] as Milestone[],

  phaseAlerts: {} as Partial<Record<TransactionPhase, PhaseAlert>>,

  phaseCheckpoints: {
    contract: [
      { id: "em", label: "Earnest Money Received", complete: true, completedDate: "Dec 5", required: true },
      { id: "pa", label: "Purchase Agreement", complete: true, completedDate: "Dec 4", required: true },
    ],
    title: [
      { id: "tc", label: "Title Commitment", complete: true, completedDate: "Dec 18", required: true },
      { id: "insp", label: "Inspection Complete", complete: true, completedDate: "Dec 12", required: true },
    ],
    financing: [
      { id: "app", label: "Appraisal", complete: true, completedDate: "Dec 20", required: true },
      { id: "uw", label: "Underwriting Approval", complete: false, required: true },
      { id: "ctc", label: "Clear to Close", complete: false, required: true },
    ],
  } as Partial<Record<TransactionPhase, PhaseCheckpoint[]>>,

  isFinanced: true,
};

export default function BuyerDashboardTab({
  transaction,
  tasks,
  onTabChange,
  onTaskAction,
}: BuyerDashboardTabProps) {
  // Compute metrics from tasks
  const nextAction = useMemo(() => getNextAction(tasks), [tasks]);
  const actionRequired = useMemo(() => getActionRequired(tasks), [tasks]);
  const completionPct = useMemo(() => getCompletionPercentage(tasks), [tasks]);
  const counts = useMemo(() => getTaskCounts(tasks), [tasks]);

  // Days to closing
  const daysToClose = useMemo(() => {
    const closing = new Date(transaction.dates.closingDate);
    const now = new Date();
    const diff = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [transaction.dates.closingDate]);

  // Convert task action items to ActionItem format for existing panel
  const actionItems: ActionItem[] = useMemo(
    () =>
      actionRequired.slice(0, 3).map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.overdueDate || transaction.dates.closingDate,
        actionType: (t.portalAction === "e_sign"
          ? "sign"
          : t.portalAction === "upload" || t.portalAction === "upload_pay" || t.portalAction === "upload_form"
            ? "upload"
            : t.portalAction === "review_approve"
              ? "review"
              : "confirm") as ActionItem["actionType"],
        urgency: (t.status === "overdue" ? "high" : "medium") as ActionItem["urgency"],
      })),
    [actionRequired, transaction.dates.closingDate]
  );

  const handlePhaseClick = (phase: TransactionPhase) => {
    const phaseToTab: Record<TransactionPhase, TabId> = {
      contract: "tasks",
      title: "tasks",
      financing: "money",
      clear_to_close: "closing",
      closed: "closing",
    };
    onTabChange?.(phaseToTab[phase]);
  };

  return (
    <div className="space-y-[var(--section-spacing)] stagger-fade-in">
      {/* ====== Row 1: Journey Tracker (2 cols) + Metrics (1 col) ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--content-gap)]">
        {/* Journey Tracker — spans 2 columns */}
        <div className="lg:col-span-2">
          <TransactionJourneyTracker
            currentPhase={mockJourneyData.currentPhase}
            percentComplete={completionPct}
            closingDate={transaction.dates.closingDate}
            contractDate={transaction.dates.contractDate}
            isFinanced={mockJourneyData.isFinanced}
            phaseAlerts={mockJourneyData.phaseAlerts}
            phaseCheckpoints={mockJourneyData.phaseCheckpoints}
            onPhaseClick={handlePhaseClick}
          />
        </div>

        {/* KPI Metrics — stacked on the right */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-[var(--content-gap)]">
          <MetricCard
            title="Days to Close"
            value={daysToClose}
            icon={<Calendar />}
            iconColor="text-spruce"
            iconBg="bg-spruce/10"
          />
          <MetricCard
            title="Tasks Complete"
            value={`${counts.completed}/${counts.total}`}
            icon={<FileCheck />}
            iconColor="text-fern"
            iconBg="bg-fern-50"
          />
          <MetricCard
            title="Action Items"
            value={counts.actionRequired + counts.overdue}
            icon={<AlertCircle />}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <MetricCard
            title="Docs in Vault"
            value={0}
            icon={<FolderOpen />}
            iconColor="text-river-stone"
            iconBg="bg-river-stone-50"
          />
        </div>
      </div>

      {/* ====== Row 2: Next Action Hero (full width) ====== */}
      <NextActionHero task={nextAction} onAction={onTaskAction} />

      {/* ====== Row 3: Action Required + Waiting On ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[var(--content-gap)]">
        <div className="lg:col-span-3">
          {actionItems.length > 0 ? (
            <div>
              <ActionRequiredPanel
                items={actionItems}
                onAction={() => onTabChange?.("tasks")}
              />
              {actionRequired.length > 3 && (
                <button
                  onClick={() => onTabChange?.("tasks")}
                  className="mt-2 flex items-center gap-1 text-sm font-medium text-spruce hover:text-spruce-700 transition-colors"
                >
                  View all {actionRequired.length} tasks
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

        <div className="lg:col-span-2">
          <WaitingOnPanel items={mockJourneyData.waitingOn} />
        </div>
      </div>

      {/* ====== Row 4: Upcoming Timeline + Quick Actions ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--content-gap)]">
        <UpcomingTimeline
          milestones={mockJourneyData.upcomingMilestones}
          maxItems={4}
          onViewAll={() => onTabChange?.("closing")}
        />

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
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
              leftIcon={<FolderOpen className="w-4 h-4" />}
              onClick={() => onTabChange?.("documents")}
              className="justify-start"
            >
              View Documents
            </Button>
            <Button
              variant="outline"
              leftIcon={<DollarSign className="w-4 h-4" />}
              onClick={() => onTabChange?.("money")}
              className="justify-start"
            >
              View Financials
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
