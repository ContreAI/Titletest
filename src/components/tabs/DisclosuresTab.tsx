"use client";

import { useMemo, useRef } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, Button } from "@/components/common";
import DisclosureGuidanceBanner from "@/components/seller/DisclosureGuidanceBanner";
import RepairNegotiationPanel from "@/components/seller/RepairNegotiationPanel";
import BuyerTaskRow from "@/components/buyer/BuyerTaskRow";
import { TransactionTask, RepairRequest, Transaction } from "@/types";
import { getActionLabel } from "@/stores/taskStore";

gsap.registerPlugin(useGSAP);

export interface DisclosuresTabProps {
  transaction: Transaction;
  tasks: TransactionTask[];
  repairRequest?: RepairRequest;
  onTaskAction?: (task: TransactionTask) => void;
  onRepairRespond?: (
    itemId: string,
    response: "accept" | "counter" | "decline",
    counterProposal?: string
  ) => void;
  onRepairSubmitAll?: () => void;
}

// Mock repair request data
const mockRepairRequest: RepairRequest = {
  id: "rr-1",
  transactionId: "tx-1",
  items: [
    {
      id: "ri-1",
      description: "Repair leaking faucet in master bathroom",
      estimatedCostMin: 150,
      estimatedCostMax: 350,
      sellerResponse: "pending",
    },
    {
      id: "ri-2",
      description: "Replace damaged roof shingles (south-facing section)",
      estimatedCostMin: 800,
      estimatedCostMax: 2000,
      sellerResponse: "pending",
    },
    {
      id: "ri-3",
      description: "Fix electrical outlet in garage (no power)",
      estimatedCostMin: 100,
      estimatedCostMax: 300,
      sellerResponse: "pending",
    },
    {
      id: "ri-4",
      description: "Repair fence gate latch and hinge",
      estimatedCostMin: 50,
      estimatedCostMax: 150,
      sellerResponse: "pending",
    },
  ],
  receivedDate: "2025-01-08",
  responseDueDate: "2025-01-12",
  status: "pending",
};

export default function DisclosuresTab({
  transaction,
  tasks,
  repairRequest = mockRepairRequest,
  onTaskAction,
  onRepairRespond,
  onRepairSubmitAll,
}: DisclosuresTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 10,
      duration: 0.35,
      stagger: 0.06,
      ease: "power2.out",
    });
  }, []);

  // Filter disclosure tasks (Phase 2 primarily)
  const disclosureTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.phase === 2 ||
          t.id === "S-06" ||
          t.id === "S-07" ||
          t.id === "S-08" ||
          t.id === "S-09" ||
          t.id === "S-10"
      ),
    [tasks]
  );

  // Check if disclosure guidance should show (S-06 pending)
  const showGuidance = useMemo(
    () =>
      tasks.some(
        (t) =>
          t.id === "S-06" &&
          (t.status === "action_required" || t.status === "not_started")
      ),
    [tasks]
  );

  // Check for repair negotiation (S-11)
  const hasRepairRequest = useMemo(
    () =>
      tasks.some(
        (t) =>
          t.id === "S-11" &&
          (t.status === "action_required" || t.status === "overdue")
      ),
    [tasks]
  );

  // Title commitment review (S-13)
  const titleCommitmentTask = useMemo(
    () => tasks.find((t) => t.id === "S-13"),
    [tasks]
  );

  // Build dependency labels
  const dependencyLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    tasks.forEach((t) => {
      labels[t.id] = t.title;
    });
    return labels;
  }, [tasks]);

  // Separate conditional vs always-shown tasks
  const alwaysShownTasks = useMemo(
    () => disclosureTasks.filter((t) => !t.isConditional),
    [disclosureTasks]
  );

  const conditionalTasks = useMemo(
    () => disclosureTasks.filter((t) => t.isConditional),
    [disclosureTasks]
  );

  return (
    <div ref={containerRef} className="space-y-[var(--section-spacing)]">
      {/* Disclosure Guidance Banner */}
      {showGuidance && <DisclosureGuidanceBanner />}

      {/* Section 1: Disclosure Checklist */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
          Required Disclosures
        </h2>
        <p className="text-sm text-[var(--text-tertiary)] mb-4">
          Complete these documents to move forward with your transaction.
        </p>

        <Card variant="default" padding="none">
          <div className="divide-y divide-divider/50">
            {alwaysShownTasks.map((task) => (
              <BuyerTaskRow
                key={task.id}
                task={task}
                onAction={onTaskAction}
                dependencyLabels={dependencyLabels}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Conditional disclosures */}
      {conditionalTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Property-Specific Disclosures
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-4">
            These apply based on your property&apos;s characteristics.
          </p>

          <Card variant="default" padding="none">
            <div className="divide-y divide-divider/50">
              {conditionalTasks.map((task) => (
                <BuyerTaskRow
                  key={task.id}
                  task={task}
                  onAction={onTaskAction}
                  dependencyLabels={dependencyLabels}
                />
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Section 2: Repair Negotiation (only if active) */}
      {hasRepairRequest && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Repair Negotiation
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-4">
            The buyer has submitted a repair request based on their inspection.
            Review each item and respond.
          </p>

          <RepairNegotiationPanel
            repairRequest={repairRequest}
            onRespond={onRepairRespond}
            onSubmitAll={onRepairSubmitAll}
          />
        </div>
      )}

      {/* Section 3: Title Commitment Review */}
      {titleCommitmentTask && titleCommitmentTask.status !== "locked" && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Title Commitment
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-4">
            Review the Schedule B-I seller obligations in the title commitment.
          </p>

          <Card variant="default" padding="none">
            <BuyerTaskRow
              task={titleCommitmentTask}
              onAction={onTaskAction}
              dependencyLabels={dependencyLabels}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
