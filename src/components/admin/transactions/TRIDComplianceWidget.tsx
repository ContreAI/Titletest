"use client";

import { useMemo, useRef } from "react";
import {
  Shield,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, CardHeader } from "@/components/common";

gsap.registerPlugin(useGSAP);

interface TRIDComplianceWidgetProps {
  closingDate: string;
  closingDisclosureSentDate?: string;
  buyerCDStatus: string;
  sellerCDStatus: string;
}

// --- Helpers ---

/** Count business days between two dates (exclusive of end). */
function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const target = new Date(end);
  target.setHours(0, 0, 0, 0);

  if (current >= target) return 0;

  while (current < target) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
  }
  return count;
}

/** Subtract N business days from a date. */
function subtractBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  let subtracted = 0;
  while (subtracted < days) {
    result.setDate(result.getDate() - 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      subtracted++;
    }
  }
  return result;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type ComplianceLevel = "compliant" | "warning" | "danger";

function getComplianceLevel(businessDaysRemaining: number): ComplianceLevel {
  if (businessDaysRemaining < 3) return "danger";
  if (businessDaysRemaining < 5) return "warning";
  return "compliant";
}

const LEVEL_CONFIG: Record<
  ComplianceLevel,
  {
    bgClass: string;
    borderClass: string;
    textClass: string;
    barClass: string;
    iconClass: string;
    label: string;
  }
> = {
  compliant: {
    bgClass: "bg-fern-50 dark:bg-fern-950/20",
    borderClass: "border-fern-200 dark:border-fern-800",
    textClass: "text-fern-700 dark:text-fern-400",
    barClass: "bg-fern",
    iconClass: "text-fern",
    label: "Compliant",
  },
  warning: {
    bgClass: "bg-amber-50 dark:bg-amber-950/20",
    borderClass: "border-amber-200 dark:border-amber-800",
    textClass: "text-amber-700 dark:text-amber-400",
    barClass: "bg-amber-500",
    iconClass: "text-amber-500",
    label: "Approaching Deadline",
  },
  danger: {
    bgClass: "bg-signal-red-50 dark:bg-signal-red-950/20",
    borderClass: "border-signal-red-200 dark:border-signal-red-800",
    textClass: "text-signal-red-700 dark:text-signal-red-400",
    barClass: "bg-signal-red",
    iconClass: "text-signal-red",
    label: "At Risk",
  },
};

// CD status label/icon mapping
function cdStatusDisplay(status: string): {
  icon: typeof CheckCircle2;
  label: string;
  done: boolean;
  iconClass: string;
} {
  switch (status) {
    case "approved":
    case "viewed":
      return {
        icon: CheckCircle2,
        label: "Viewed / Approved",
        done: true,
        iconClass: "text-fern",
      };
    case "delivered":
      return {
        icon: CheckCircle2,
        label: "Delivered",
        done: true,
        iconClass: "text-spruce",
      };
    case "sent":
      return {
        icon: Clock,
        label: "Sent",
        done: true,
        iconClass: "text-sea-glass-600",
      };
    case "generated":
      return {
        icon: Circle,
        label: "Generated",
        done: false,
        iconClass: "text-amber-500",
      };
    default:
      return {
        icon: Circle,
        label: "Not Generated",
        done: false,
        iconClass: "text-[var(--text-disabled)]",
      };
  }
}

// --- Main Component ---

export default function TRIDComplianceWidget({
  closingDate,
  closingDisclosureSentDate,
  buyerCDStatus,
  sellerCDStatus,
}: TRIDComplianceWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const analysis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closing = new Date(closingDate);
    closing.setHours(0, 0, 0, 0);

    // CD must be delivered 3 business days before closing
    const cdDeadline = subtractBusinessDays(closing, 3);
    const businessDaysToDeadline = businessDaysBetween(today, cdDeadline);
    const calendarDaysToClosing = Math.ceil(
      (closing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const isPastDeadline = today > cdDeadline;
    const isCDSent = !!closingDisclosureSentDate;

    const level = isCDSent
      ? "compliant"
      : isPastDeadline
        ? "danger"
        : getComplianceLevel(businessDaysToDeadline);

    // Timeline progress: from 14 days before closing to closing
    const timelineStart = new Date(closing);
    timelineStart.setDate(timelineStart.getDate() - 14);
    const totalSpan = closing.getTime() - timelineStart.getTime();
    const elapsed = today.getTime() - timelineStart.getTime();
    const timelinePercent = Math.max(
      0,
      Math.min(100, (elapsed / totalSpan) * 100)
    );
    const deadlinePercent = Math.max(
      0,
      Math.min(
        100,
        ((cdDeadline.getTime() - timelineStart.getTime()) / totalSpan) * 100
      )
    );

    return {
      cdDeadline,
      businessDaysToDeadline,
      calendarDaysToClosing,
      isPastDeadline,
      isCDSent,
      level,
      timelinePercent,
      deadlinePercent,
    };
  }, [closingDate, closingDisclosureSentDate]);

  const config = LEVEL_CONFIG[analysis.level];
  const buyerDisplay = cdStatusDisplay(buyerCDStatus);
  const sellerDisplay = cdStatusDisplay(sellerCDStatus);
  const BuyerIcon = buyerDisplay.icon;
  const SellerIcon = sellerDisplay.icon;

  // Check steps
  const cdGenerated =
    buyerCDStatus !== "not_generated" || sellerCDStatus !== "not_generated";
  const cdSentBuyer = ["sent", "delivered", "viewed", "approved"].includes(
    buyerCDStatus
  );
  const cdSentSeller = ["sent", "delivered", "viewed", "approved"].includes(
    sellerCDStatus
  );

  // GSAP entrance
  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.from(containerRef.current, {
        y: 12,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <Card variant="default" padding="lg" ref={containerRef}>
      <CardHeader
        title="TRID Compliance"
        action={
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bgClass} ${config.textClass} border ${config.borderClass}`}
          >
            <Shield className="w-3.5 h-3.5" />
            {config.label}
          </div>
        }
      />

      {/* Countdown */}
      <div className="mt-4 flex items-center gap-4">
        <div
          className={`flex items-center justify-center w-14 h-14 rounded-xl ${config.bgClass} border ${config.borderClass}`}
        >
          <span
            className={`text-2xl font-bold font-[family-name:var(--font-mono)] ${config.textClass}`}
          >
            {analysis.isPastDeadline && !analysis.isCDSent
              ? "!"
              : analysis.businessDaysToDeadline}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {analysis.isCDSent
              ? "Closing Disclosure sent"
              : analysis.isPastDeadline
                ? "CD delivery deadline has passed"
                : `${analysis.businessDaysToDeadline} business day${analysis.businessDaysToDeadline !== 1 ? "s" : ""} until CD deadline`}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            CD must be delivered by{" "}
            <span className="font-medium font-[family-name:var(--font-mono)]">
              {formatDate(analysis.cdDeadline.toISOString())}
            </span>
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Closing:{" "}
            <span className="font-medium font-[family-name:var(--font-mono)]">
              {formatDate(closingDate)}
            </span>{" "}
            ({analysis.calendarDaysToClosing} calendar days)
          </p>
        </div>
      </div>

      {/* Visual timeline bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] mb-1.5">
          <span>Today</span>
          <span>CD Deadline</span>
          <span>Closing</span>
        </div>
        <div className="relative h-2.5 bg-elevation2 rounded-full overflow-hidden">
          {/* Today marker */}
          <div
            className={`absolute top-0 h-full ${config.barClass} rounded-full transition-all duration-700`}
            style={{ width: `${analysis.timelinePercent}%` }}
          />
          {/* Deadline marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-signal-red/70"
            style={{ left: `${analysis.deadlinePercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px]">
          <span className="font-[family-name:var(--font-mono)] text-[var(--text-tertiary)]">
            {formatShortDate(new Date())}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-signal-red">
            {formatShortDate(analysis.cdDeadline)}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[var(--text-tertiary)]">
            {formatShortDate(new Date(closingDate))}
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-5 space-y-2.5">
        {/* CD Generated */}
        <div className="flex items-center gap-3">
          {cdGenerated ? (
            <CheckCircle2 className="w-4 h-4 text-fern flex-shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-[var(--text-disabled)] flex-shrink-0" />
          )}
          <span
            className={`text-sm ${cdGenerated ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}
          >
            Closing Disclosure Generated
          </span>
        </div>

        {/* CD Sent to Buyer */}
        <div className="flex items-center gap-3">
          <BuyerIcon
            className={`w-4 h-4 flex-shrink-0 ${buyerDisplay.iconClass}`}
          />
          <span
            className={`text-sm flex-1 ${cdSentBuyer ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}
          >
            CD Sent to Buyer
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              buyerDisplay.done
                ? "bg-fern-50 text-fern-700 dark:bg-fern-950/30 dark:text-fern-400"
                : "bg-elevation2 text-[var(--text-tertiary)]"
            }`}
          >
            {buyerDisplay.label}
          </span>
        </div>

        {/* CD Sent to Seller */}
        <div className="flex items-center gap-3">
          <SellerIcon
            className={`w-4 h-4 flex-shrink-0 ${sellerDisplay.iconClass}`}
          />
          <span
            className={`text-sm flex-1 ${cdSentSeller ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}
          >
            CD Sent to Seller
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              sellerDisplay.done
                ? "bg-fern-50 text-fern-700 dark:bg-fern-950/30 dark:text-fern-400"
                : "bg-elevation2 text-[var(--text-tertiary)]"
            }`}
          >
            {sellerDisplay.label}
          </span>
        </div>
      </div>

      {/* Warning banner when at risk */}
      {analysis.level === "danger" && !analysis.isCDSent && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-signal-red-50 dark:bg-signal-red-950/30 border border-signal-red-200 dark:border-signal-red-800">
          <AlertTriangle className="w-4 h-4 text-signal-red flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-signal-red-700 dark:text-signal-red-400">
              TRID deadline at risk
            </p>
            <p className="text-xs text-signal-red-600 dark:text-signal-red-500 mt-0.5">
              The Closing Disclosure must be delivered at least 3 business days
              before closing. Failure to comply may require rescheduling the
              closing date.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
