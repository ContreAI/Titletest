"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Phone,
  Send,
  FileText,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/layout";
import { Card } from "@/components/common";

interface WireTransaction {
  id: string;
  address: string;
  buyerName: string;
  amount: string;
  steps: {
    label: string;
    status: "complete" | "current" | "pending";
    timestamp?: string;
  }[];
}

const MOCK_WIRE_TRANSACTIONS: WireTransaction[] = [
  {
    id: "wt-1",
    address: "742 Evergreen Terrace",
    buyerName: "Homer Simpson",
    amount: "$308,000",
    steps: [
      { label: "Generated", status: "complete", timestamp: "Feb 1, 10:30 AM" },
      { label: "Pushed to Portal", status: "complete", timestamp: "Feb 1, 10:31 AM" },
      { label: "Viewed by Buyer", status: "complete", timestamp: "Feb 2, 9:15 AM" },
      { label: "Callback Verified", status: "current" },
      { label: "Wire Received", status: "pending" },
    ],
  },
  {
    id: "wt-2",
    address: "221B Baker Street",
    buyerName: "John Watson",
    amount: "$425,000",
    steps: [
      { label: "Generated", status: "complete", timestamp: "Jan 28, 2:00 PM" },
      { label: "Pushed to Portal", status: "complete", timestamp: "Jan 28, 2:01 PM" },
      { label: "Viewed by Buyer", status: "current" },
      { label: "Callback Verified", status: "pending" },
      { label: "Wire Received", status: "pending" },
    ],
  },
  {
    id: "wt-3",
    address: "1600 Pennsylvania Ave",
    buyerName: "George Washington",
    amount: "$1,200,000",
    steps: [
      { label: "Generated", status: "complete", timestamp: "Feb 3, 8:00 AM" },
      { label: "Pushed to Portal", status: "complete", timestamp: "Feb 3, 8:01 AM" },
      { label: "Viewed by Buyer", status: "complete", timestamp: "Feb 3, 11:45 AM" },
      { label: "Callback Verified", status: "complete", timestamp: "Feb 3, 1:30 PM" },
      { label: "Wire Received", status: "complete", timestamp: "Feb 4, 9:00 AM" },
    ],
  },
];

const stepIcons = {
  Generated: FileText,
  "Pushed to Portal": Send,
  "Viewed by Buyer": Eye,
  "Callback Verified": Phone,
  "Wire Received": CheckCircle2,
};

export default function WireSecurityPage() {
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Wire Security"
        subtitle="Track wire instruction delivery and verification"
      />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-fern/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-fern" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                  {MOCK_WIRE_TRANSACTIONS.filter((tx) => tx.steps.every((s) => s.status === "complete")).length}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">Fully Verified</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                  {MOCK_WIRE_TRANSACTIONS.filter((tx) => tx.steps.some((s) => s.status === "current")).length}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-signal-red/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-signal-red" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">0</p>
                <p className="text-xs text-[var(--text-tertiary)]">Fraud Alerts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Wire Verification Flows */}
        <Card variant="default" padding="none">
          <div className="px-4 py-3 border-b border-divider">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Wire Verification Tracker</h3>
          </div>
          <div className="divide-y divide-divider">
            {MOCK_WIRE_TRANSACTIONS.map((tx) => {
              const currentStep = tx.steps.findIndex((s) => s.status === "current");
              const isComplete = tx.steps.every((s) => s.status === "complete");
              return (
                <div key={tx.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{tx.address}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{tx.buyerName} &middot; {tx.amount}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isComplete
                        ? "bg-fern/10 text-fern"
                        : "bg-amber/10 text-amber-400"
                    }`}>
                      {isComplete ? "Verified" : `Step ${currentStep + 1} of ${tx.steps.length}`}
                    </span>
                  </div>
                  {/* Step flow */}
                  <div className="flex items-center gap-0">
                    {tx.steps.map((step, i) => {
                      const StepIcon = stepIcons[step.label as keyof typeof stepIcons] || CheckCircle2;
                      return (
                        <div key={i} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              step.status === "complete"
                                ? "bg-fern text-white"
                                : step.status === "current"
                                  ? "bg-royal text-white ring-2 ring-royal/30"
                                  : "bg-elevation2 border-2 border-divider text-[var(--text-disabled)]"
                            }`}>
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] mt-1 text-center max-w-[72px] leading-tight ${
                              step.status === "complete" ? "text-fern" :
                              step.status === "current" ? "text-[var(--text-primary)]" :
                              "text-[var(--text-disabled)]"
                            }`}>
                              {step.label}
                            </span>
                            {step.timestamp && (
                              <span className="text-[9px] text-[var(--text-tertiary)]">{step.timestamp}</span>
                            )}
                          </div>
                          {i < tx.steps.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 ${
                              step.status === "complete" ? "bg-fern" : "bg-divider"
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
