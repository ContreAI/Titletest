"use client";

import { useMemo, useRef } from "react";
import {
  Send,
  Minus,
  Circle,
  FileEdit,
  CheckCircle2,
  Eye,
  Zap,
  Package,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, CardHeader, Button } from "@/components/common";
import type { DeliverableStatus } from "@/types/admin";

gsap.registerPlugin(useGSAP);

interface DeliverableMatrixProps {
  deliverables: DeliverableStatus[];
  onPush?: (deliverable: DeliverableStatus) => void;
}

// --- Status configuration ---

type DeliverableStatusCode = DeliverableStatus["status"];
type PortalStatusCode = DeliverableStatus["buyerPortalStatus"];

const DELIVERABLE_STATUS_CONFIG: Record<
  DeliverableStatusCode,
  { label: string; className: string; icon: typeof Circle }
> = {
  not_started: {
    label: "Not Started",
    className:
      "bg-river-stone-100 text-river-stone-600 dark:bg-river-stone-900/30 dark:text-river-stone-400",
    icon: Circle,
  },
  draft: {
    label: "Draft",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: FileEdit,
  },
  sent: {
    label: "Sent",
    className:
      "bg-sea-glass-100 text-sea-glass-700 dark:bg-sea-glass-900/30 dark:text-sea-glass-400",
    icon: Send,
  },
  delivered: {
    label: "Delivered",
    className:
      "bg-spruce-100 text-spruce-700 dark:bg-spruce-900/30 dark:text-spruce-400",
    icon: CheckCircle2,
  },
  viewed: {
    label: "Viewed",
    className:
      "bg-fern-100 text-fern-700 dark:bg-fern-900/30 dark:text-fern-400",
    icon: Eye,
  },
  n_a: {
    label: "N/A",
    className:
      "bg-elevation2 text-[var(--text-disabled)]",
    icon: Minus,
  },
};

const PORTAL_DOT_COLORS: Record<PortalStatusCode, string> = {
  not_sent: "bg-river-stone-300 dark:bg-river-stone-600",
  sent: "bg-sea-glass-500",
  delivered: "bg-spruce-500",
  viewed: "bg-fern-500",
  n_a: "bg-[var(--text-disabled)]",
};

const PORTAL_LABELS: Record<PortalStatusCode, string> = {
  not_sent: "Not Sent",
  sent: "Sent",
  delivered: "Delivered",
  viewed: "Viewed",
  n_a: "N/A",
};

// --- Helpers ---

function canPush(d: DeliverableStatus): boolean {
  return (
    (d.status === "not_started" || d.status === "draft") &&
    (d.buyerPortalStatus !== "n_a" || d.sellerPortalStatus !== "n_a")
  );
}

function findNextPushable(
  deliverables: DeliverableStatus[]
): DeliverableStatus | null {
  // Find the first deliverable by code order that is pushable
  const sorted = [...deliverables].sort((a, b) =>
    a.code.localeCompare(b.code)
  );
  return sorted.find((d) => canPush(d)) ?? null;
}

// --- Sub-components ---

function StatusBadgeCell({ status }: { status: DeliverableStatusCode }) {
  const config = DELIVERABLE_STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function PortalDot({ status }: { status: PortalStatusCode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${PORTAL_DOT_COLORS[status]}`}
      />
      <span className="text-xs text-[var(--text-tertiary)]">
        {PORTAL_LABELS[status]}
      </span>
    </div>
  );
}

// --- Main Component ---

export default function DeliverableMatrix({
  deliverables,
  onPush,
}: DeliverableMatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const deliveredCount = useMemo(
    () =>
      deliverables.filter(
        (d) => d.status === "delivered" || d.status === "viewed"
      ).length,
    [deliverables]
  );

  const totalRelevant = useMemo(
    () => deliverables.filter((d) => d.status !== "n_a").length,
    [deliverables]
  );

  const nextPushable = useMemo(
    () => findNextPushable(deliverables),
    [deliverables]
  );

  const progressPercent =
    totalRelevant > 0 ? (deliveredCount / totalRelevant) * 100 : 0;

  // GSAP entrance
  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.from(containerRef.current.querySelectorAll("tr.deliverable-row"), {
        y: 8,
        opacity: 0,
        duration: 0.3,
        stagger: 0.04,
        ease: "power2.out",
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <Card variant="default" padding="lg" ref={containerRef}>
      <CardHeader
        title="Shared Deliverables"
        subtitle={`${deliveredCount} of ${totalRelevant} delivered`}
        action={
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-secondary)]">
              {deliveredCount}/{totalRelevant}
            </span>
          </div>
        }
      />

      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-elevation2 rounded-full overflow-hidden">
        <div
          className="h-full bg-spruce rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quick Push Bar */}
      {nextPushable && onPush && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-spruce-50 dark:bg-spruce-950/30 border border-spruce-200 dark:border-spruce-800">
          <Zap className="w-5 h-5 text-spruce flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Next deliverable ready to push
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              <span className="font-[family-name:var(--font-mono)]">
                {nextPushable.code}
              </span>{" "}
              {nextPushable.name}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send className="w-3.5 h-3.5" />}
            onClick={() => onPush(nextPushable)}
          >
            Push Next: {nextPushable.code}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider">
              <th className="text-left py-2.5 pr-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                Code
              </th>
              <th className="text-left py-2.5 pr-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                Name
              </th>
              <th className="text-left py-2.5 pr-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide hidden md:table-cell">
                Window
              </th>
              <th className="text-left py-2.5 pr-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                Status
              </th>
              <th className="text-left py-2.5 pr-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide hidden lg:table-cell">
                Buyer Portal
              </th>
              <th className="text-left py-2.5 pr-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide hidden lg:table-cell">
                Seller Portal
              </th>
              <th className="text-right py-2.5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {deliverables.map((d) => (
              <tr
                key={d.code}
                className="deliverable-row border-b border-divider last:border-b-0 hover:bg-elevation1 transition-colors"
              >
                <td className="py-3 pr-3">
                  <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-[var(--text-secondary)]">
                    {d.code}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <div>
                    <span className="text-[var(--text-primary)] font-medium">
                      {d.name}
                    </span>
                    {d.description && (
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-1">
                        {d.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-3 hidden md:table-cell">
                  <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-tertiary)]">
                    {d.expectedWindow}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <StatusBadgeCell status={d.status} />
                </td>
                <td className="py-3 pr-3 hidden lg:table-cell">
                  <PortalDot status={d.buyerPortalStatus} />
                </td>
                <td className="py-3 pr-3 hidden lg:table-cell">
                  <PortalDot status={d.sellerPortalStatus} />
                </td>
                <td className="py-3 text-right">
                  {canPush(d) && onPush && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Send className="w-3 h-3" />}
                      onClick={() => onPush(d)}
                    >
                      Push
                    </Button>
                  )}
                  {d.status === "n_a" && (
                    <span className="text-xs text-[var(--text-disabled)]">
                      &mdash;
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
