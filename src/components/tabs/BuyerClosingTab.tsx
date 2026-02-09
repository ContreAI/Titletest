"use client";

import { useMemo, useRef } from "react";
import {
  PenTool,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  FileSignature,
  Home,
  ChevronRight,
  Users,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, Button } from "@/components/common";
import BuyerTaskRow from "@/components/buyer/BuyerTaskRow";
import { Transaction, TransactionTask, TabId } from "@/types";

gsap.registerPlugin(useGSAP);

export interface BuyerClosingTabProps {
  transaction: Transaction;
  tasks: TransactionTask[];
  onTaskAction?: (task: TransactionTask) => void;
  onTabChange?: (tabId: TabId) => void;
}

export default function BuyerClosingTab({
  transaction,
  tasks,
  onTaskAction,
  onTabChange,
}: BuyerClosingTabProps) {
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

  // Days to closing
  const daysToClose = useMemo(() => {
    const closing = new Date(transaction.dates.closingDate);
    const now = new Date();
    const diff = Math.ceil(
      (closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  }, [transaction.dates.closingDate]);

  // Closing-related tasks (Phase 4 & 5)
  const closingTasks = useMemo(
    () => tasks.filter((t) => t.phase === 4 || t.phase === 5),
    [tasks]
  );

  // Signing tasks
  const signingTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.portalAction === "e_sign" &&
          (t.phase === 4 || t.phase === 5)
      ),
    [tasks]
  );

  // Final walkthrough task (B-23)
  const walkthroughTask = useMemo(
    () => tasks.find((t) => t.id === "B-23"),
    [tasks]
  );

  // Closing appointment task (B-24)
  const closingAppointmentTask = useMemo(
    () => tasks.find((t) => t.id === "B-24"),
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

  const signingMethod = transaction.closingAgentId
    ? "In Person"
    : "Remote Online Notary";

  return (
    <div ref={containerRef} className="space-y-[var(--section-spacing)]">
      {/* Closing countdown hero */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-spruce/10 flex items-center justify-center">
              <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-spruce">
                {daysToClose}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {daysToClose === 0 ? "Closing Day!" : `${daysToClose} Days to Closing`}
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {new Date(transaction.dates.closingDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {transaction.dates.signingWindowStart && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Clock className="w-4 h-4" />
              <span>
                Signing window:{" "}
                {new Date(transaction.dates.signingWindowStart).toLocaleDateString()} -{" "}
                {transaction.dates.signingWindowEnd
                  ? new Date(transaction.dates.signingWindowEnd).toLocaleDateString()
                  : "TBD"}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* What to Bring checklist */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
          What to Bring to Closing
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "Valid government-issued photo ID",
            "Certified/cashier's check (if applicable)",
            "Proof of homeowners insurance",
            "Any outstanding documents requested",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-fern flex-shrink-0" />
              <span className="text-[var(--text-secondary)]">{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Two column: Signing + Walkthrough */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--content-gap)]">
        {/* Signing section */}
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-spruce" />
            Signing
          </h3>

          <Card variant="default" padding="none">
            <div className="divide-y divide-divider/50">
              {signingTasks.length > 0 ? (
                signingTasks.map((task) => (
                  <BuyerTaskRow
                    key={task.id}
                    task={task}
                    onAction={onTaskAction}
                    dependencyLabels={dependencyLabels}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
                  No signing tasks yet. Documents will be ready closer to closing.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Walkthrough + Appointment */}
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Home className="w-5 h-5 text-spruce" />
            Final Steps
          </h3>

          <div className="space-y-3">
            {walkthroughTask && (
              <Card variant="default" padding="none">
                <BuyerTaskRow
                  task={walkthroughTask}
                  onAction={onTaskAction}
                  dependencyLabels={dependencyLabels}
                />
              </Card>
            )}

            {closingAppointmentTask && (
              <Card variant="default" padding="none">
                <BuyerTaskRow
                  task={closingAppointmentTask}
                  onAction={onTaskAction}
                  dependencyLabels={dependencyLabels}
                />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* All Phase 4-5 tasks */}
      {closingTasks.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            All Closing Tasks
          </h3>
          <Card variant="default" padding="none">
            <div className="divide-y divide-divider/50">
              {closingTasks.map((task) => (
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
    </div>
  );
}
