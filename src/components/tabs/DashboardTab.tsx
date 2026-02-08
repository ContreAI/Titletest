"use client";

import { useState } from "react";
import {
  Upload,
  PenTool,
  Link2,
  Package,
  MessageCircle,
  Calendar,
  FileCheck,
  AlertCircle,
  Activity,
} from "lucide-react";
import { Card, Button } from "@/components/common";
import { MetricCard } from "@/components/dashboard";
import {
  TransactionJourneyTracker,
  PartyStatusGrid,
  ActionRequiredPanel,
  WaitingOnPanel,
  UpcomingTimeline,
} from "@/components/journey";
import {
  Transaction,
  TabId,
  TransactionPhase,
  PartyTask,
  ActionItem,
  WaitingOnItem,
  Milestone,
  PhaseAlert,
  PhaseCheckpoint,
} from "@/types";

export interface DashboardTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
  onTabChange?: (tabId: TabId) => void;
}

// Mock journey data - in production, this would come from API
const mockJourneyData = {
  currentPhase: "financing" as TransactionPhase,
  percentComplete: 68,

  partyTasks: [
    {
      id: "1",
      party: "lender" as const,
      task: "Underwriting in progress",
      status: "in_progress" as const,
      estimatedDate: "3-4 days",
      details: "Verifying income and assets",
    },
    {
      id: "2",
      party: "appraiser" as const,
      task: "Appraisal complete",
      status: "complete" as const,
      completedDate: "Dec 20",
      details: "$425,000 appraised value",
    },
    {
      id: "3",
      party: "title" as const,
      task: "Title commitment issued",
      status: "complete" as const,
      completedDate: "Dec 18",
    },
    {
      id: "4",
      party: "agent" as const,
      task: "All docs submitted",
      status: "complete" as const,
      completedDate: "Dec 15",
    },
    {
      id: "5",
      party: "buyer" as const,
      task: "Insurance binder needed",
      status: "waiting" as const,
      estimatedDate: "Due Jan 8",
    },
  ] as PartyTask[],

  actionItems: [
    {
      id: "1",
      title: "Review Closing Disclosure",
      description: "The title company has prepared your closing costs breakdown. Review for accuracy.",
      dueDate: "2025-01-10",
      actionType: "review" as const,
      urgency: "medium" as const,
    },
    {
      id: "2",
      title: "Upload Insurance Binder",
      description: "Your lender needs proof of homeowners insurance before clear to close.",
      dueDate: "2025-01-08",
      actionType: "upload" as const,
      urgency: "high" as const,
    },
  ] as ActionItem[],

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

  phaseAlerts: {
    financing: {
      level: "error" as const,
      message: "Lender docs not received",
      daysOverdue: 2,
    },
  } as Partial<Record<TransactionPhase, PhaseAlert>>,

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

const PHASE_DESCRIPTIONS: Record<TransactionPhase, { title: string; description: string }> = {
  contract: {
    title: "Contract Phase",
    description: "Your offer has been accepted. Earnest money is being deposited and contingency periods are beginning.",
  },
  title: {
    title: "Due Diligence Phase",
    description: "Inspections are underway and the title company is researching the property's title history.",
  },
  financing: {
    title: "Financing Phase",
    description: "Your lender is completing the underwriting process, verifying your financial documents and the property appraisal.",
  },
  clear_to_close: {
    title: "Clear to Close Phase",
    description: "All conditions have been met! Final documents are being prepared and your closing is being scheduled.",
  },
  closed: {
    title: "Transaction Complete",
    description: "Congratulations! Your transaction has closed successfully.",
  },
};

export default function DashboardTab({ transaction, side, onTabChange }: DashboardTabProps) {
  const [expandedPhase, setExpandedPhase] = useState<TransactionPhase | null>(null);

  const handleActionClick = (item: ActionItem) => {
    if (item.actionType === "sign" || item.actionType === "review") {
      onTabChange?.("closing");
    } else if (item.actionType === "upload") {
      console.log("Upload action:", item);
    }
  };

  const handlePhaseClick = (phase: TransactionPhase) => {
    const phaseToTab: Record<TransactionPhase, TabId> = {
      contract: "contract",
      title: "title",
      financing: "financial",
      clear_to_close: "closing",
      closed: "closing",
    };
    onTabChange?.(phaseToTab[phase]);
  };

  const currentPhaseInfo = PHASE_DESCRIPTIONS[mockJourneyData.currentPhase];

  return (
    <div className="space-y-[var(--section-spacing)] stagger-fade-in">
      {/* ====== Row 1: Journey Tracker (2 cols) + Metrics (1 col) ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--content-gap)]">
        {/* Journey Tracker — spans 2 columns */}
        <div className="lg:col-span-2">
          <TransactionJourneyTracker
            currentPhase={mockJourneyData.currentPhase}
            percentComplete={mockJourneyData.percentComplete}
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
            value={12}
            icon={<Calendar />}
            iconColor="text-spruce"
            iconBg="bg-spruce/10"
            trend="down"
            percentage={25}
          />
          <MetricCard
            title="Docs Complete"
            value="8/12"
            icon={<FileCheck />}
            iconColor="text-fern"
            iconBg="bg-fern-50"
            trend="up"
            percentage={15}
          />
          <MetricCard
            title="Action Items"
            value={mockJourneyData.actionItems.length}
            icon={<AlertCircle />}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <MetricCard
            title="Phase Progress"
            value={`${mockJourneyData.percentComplete}%`}
            icon={<Activity />}
            iconColor="text-indigo-500"
            iconBg="bg-indigo-50"
            trend="up"
            percentage={8}
          />
        </div>
      </div>

      {/* ====== Row 2: Action Required (tall) + AI Assistant ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[var(--content-gap)]">
        {/* Action Required — larger share */}
        <div className="lg:col-span-3">
          {mockJourneyData.actionItems.length > 0 ? (
            <ActionRequiredPanel
              items={mockJourneyData.actionItems}
              onAction={handleActionClick}
            />
          ) : (
            <Card>
              <div className="flex items-center justify-center py-8 text-[var(--text-tertiary)]">
                No action items — you&apos;re all caught up!
              </div>
            </Card>
          )}
        </div>

        {/* AI Quick Question — accent indigo background */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-[var(--card-padding)] h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">Ask Transaction IQ</h3>
                <p className="text-xs text-[var(--text-tertiary)]">AI-powered answers from your docs</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                {["What's my closing cost?", "Insurance status?", "Next steps?"].map((q) => (
                  <button
                    key={q}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-paper border border-indigo-200 rounded-full hover:bg-indigo-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="mt-auto flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded-lg bg-paper focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
                <Button variant="primary" size="sm" className="!bg-indigo-500 hover:!bg-indigo-600">
                  Ask
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== Row 3: Current Phase + Party Status ====== */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{currentPhaseInfo.title}</h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">{currentPhaseInfo.description}</p>
        </div>

        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">What each party is doing:</h4>
        <PartyStatusGrid tasks={mockJourneyData.partyTasks} compact />
      </Card>

      {/* ====== Row 4: Waiting On + Upcoming Timeline ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--content-gap)]">
        <WaitingOnPanel items={mockJourneyData.waitingOn} />
        <UpcomingTimeline
          milestones={mockJourneyData.upcomingMilestones}
          maxItems={4}
          onViewAll={() => onTabChange?.("closing")}
        />
      </div>

      {/* ====== Row 5: Quick Actions (full width, icon grid) ====== */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />} className="justify-start">
            Upload Document
          </Button>
          <Button
            variant="outline"
            leftIcon={<PenTool className="w-4 h-4" />}
            onClick={() => onTabChange?.("closing")}
            className="justify-start"
          >
            Schedule Signing
          </Button>
          <Button variant="outline" leftIcon={<Link2 className="w-4 h-4" />} className="justify-start">
            Connect SkySlope
          </Button>
          <Button variant="outline" leftIcon={<Package className="w-4 h-4" />} className="justify-start">
            Export Package
          </Button>
        </div>
      </Card>
    </div>
  );
}
