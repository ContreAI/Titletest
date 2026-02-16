"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  FolderOpen,
  Zap,
} from "lucide-react";
import { TabNavigation } from "@/components/layout";
import type { TabConfig } from "@/components/layout/TabNavigation";
import { TabId } from "@/types";
import { AgentDashboard } from "@/components/agent";
import { AgentTaskTracker } from "@/components/agent";
import { AgentDocumentVault } from "@/components/agent";
import { AutomationTimeline } from "@/components/agent";
import {
  mockTransaction,
  mockBuyerSide,
  mockSellerSide,
  mockDocuments,
} from "@/data/mockData";
import { MiniJourneyTracker } from "@/components/journey";
import { TransactionPhase } from "@/types";

const AGENT_TABS: TabConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: <ListChecks className="w-4 h-4" />,
  },
  {
    id: "documents",
    label: "Documents",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    id: "automation",
    label: "Automation",
    icon: <Zap className="w-4 h-4" />,
  },
];

export default function AgentPortalPage() {
  const params = useParams();
  const side = params.side as "buyer" | "seller";
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const sideData = side === "buyer" ? mockBuyerSide : mockSellerSide;

  const journeyData = {
    currentPhase: "financing" as TransactionPhase,
    percentComplete: 68,
    isFinanced: mockTransaction.financials.isFinanced,
    phaseAlerts: {
      financing: {
        level: "error" as const,
        message: "Lender docs not received",
        daysOverdue: 2,
      },
    },
  };

  const handlePhaseClick = (phase: TransactionPhase) => {
    setActiveTab("tasks");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Unified Header: Property + Journey Tracker + Tabs */}
      <div className="bg-paper border-b border-divider">
        <div className="max-w-5xl mx-auto px-6">
          {/* Row 1: Property info + journey tracker */}
          <div className="flex items-center gap-6 py-3">
            {/* Property info — compact */}
            <div className="shrink-0">
              <h1 className="text-base font-semibold text-[var(--text-primary)] leading-tight">
                {mockTransaction.property.address}
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                {mockTransaction.property.city},{" "}
                {mockTransaction.property.state}{" "}
                {mockTransaction.property.zip} &middot; $
                {mockTransaction.financials.purchasePrice.toLocaleString()}
              </p>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-divider shrink-0 hidden md:block" />

            {/* Journey tracker — fills remaining space */}
            <div className="flex-1 min-w-0">
              <MiniJourneyTracker
                currentPhase={journeyData.currentPhase}
                percentComplete={journeyData.percentComplete}
                closingDate={mockTransaction.dates.closingDate}
                isFinanced={journeyData.isFinanced}
                phaseAlerts={journeyData.phaseAlerts}
                onPhaseClick={handlePhaseClick}
                embedded
              />
            </div>
          </div>

          {/* Row 2: Tabs */}
          <TabNavigation
            tabs={AGENT_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === "dashboard" && (
            <AgentDashboard
              side={side}
              transaction={mockTransaction}
              sideData={sideData}
            />
          )}
          {activeTab === "tasks" && (
            <AgentTaskTracker side={side} />
          )}
          {activeTab === "documents" && (
            <AgentDocumentVault
              side={side}
              documents={mockDocuments}
            />
          )}
          {activeTab === "automation" && (
            <AutomationTimeline side={side} />
          )}
        </div>
      </div>
    </div>
  );
}
