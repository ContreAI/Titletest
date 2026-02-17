"use client";

import { useMemo, useState } from "react";
import {
  Flame,
  AlertTriangle,
  Clock,
  CalendarClock,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader } from "@/components/common";
import { AdminTransaction } from "@/types/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FirePriority = "critical" | "overdue" | "due_today";

interface FireItem {
  id: string;
  transactionId: string;
  address: string;
  issue: string;
  priority: FirePriority;
  closerName?: string;
}

export interface FireListProps {
  transactions: AdminTransaction[];
  onGoClick: (transactionId: string) => void;
}

// ---------------------------------------------------------------------------
// Priority config
// ---------------------------------------------------------------------------

const PRIORITY_CONFIG: Record<
  FirePriority,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    pillClass: string;
  }
> = {
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    pillClass: "bg-signal-red/10 text-signal-red",
  },
  overdue: {
    label: "Overdue",
    icon: Clock,
    pillClass: "bg-amber/10 text-amber-400",
  },
  due_today: {
    label: "Due Today",
    icon: CalendarClock,
    pillClass: "bg-sea-glass/20 text-sea-glass-400",
  },
};

// ---------------------------------------------------------------------------
// Computation
// ---------------------------------------------------------------------------

function computeFireItems(transactions: AdminTransaction[]): FireItem[] {
  const items: FireItem[] = [];

  for (const tx of transactions) {
    const addr = tx.property.address;

    // 1. CRITICAL: TRID non-compliant
    if (tx.tridCompliance && !tx.tridCompliance.isCompliant) {
      items.push({
        id: `${tx.id}-trid`,
        transactionId: tx.id,
        address: addr,
        issue: `TRID non-compliant - ${tx.tridCompliance.daysRemaining}d remaining`,
        priority: "critical",
        closerName: tx.assignedCloserName,
      });
    }

    // 2. OVERDUE: buyer or seller tasks overdue
    const buyerOverdue = tx.buyerTaskProgress?.overdue ?? 0;
    const sellerOverdue = tx.sellerTaskProgress?.overdue ?? 0;
    const totalOverdue = buyerOverdue + sellerOverdue;

    if (totalOverdue > 0) {
      items.push({
        id: `${tx.id}-overdue`,
        transactionId: tx.id,
        address: addr,
        issue: `${totalOverdue} overdue task${totalOverdue > 1 ? "s" : ""} (${buyerOverdue} buyer, ${sellerOverdue} seller)`,
        priority: "overdue",
        closerName: tx.assignedCloserName,
      });
    }

    // 3. DUE TODAY: closing date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closing = new Date(tx.dates.closingDate);
    closing.setHours(0, 0, 0, 0);

    if (closing.getTime() === today.getTime()) {
      items.push({
        id: `${tx.id}-due-today`,
        transactionId: tx.id,
        address: addr,
        issue: "Closing scheduled for today",
        priority: "due_today",
        closerName: tx.assignedCloserName,
      });
    }
  }

  // Sort by priority weight: critical first, then overdue, then due_today
  const weight: Record<FirePriority, number> = {
    critical: 0,
    overdue: 1,
    due_today: 2,
  };
  items.sort((a, b) => weight[a.priority] - weight[b.priority]);

  return items;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const MAX_VISIBLE = 10;

export default function FireList({ transactions, onGoClick }: FireListProps) {
  const [expanded, setExpanded] = useState(false);
  const allItems = useMemo(() => computeFireItems(transactions), [transactions]);

  const visibleItems = expanded ? allItems : allItems.slice(0, MAX_VISIBLE);
  const hasMore = allItems.length > MAX_VISIBLE;

  if (allItems.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Needs Attention"
          action={
            <Flame className="w-5 h-5 text-[var(--text-tertiary)]" />
          }
        />
        <div className="mt-4 text-center py-6 text-sm text-[var(--text-tertiary)]">
          All clear -- nothing needs immediate attention.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Needs Attention"
        subtitle={`${allItems.length} item${allItems.length !== 1 ? "s" : ""}`}
        action={
          <span className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-signal-red" />
            <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-signal-red">
              {allItems.length}
            </span>
          </span>
        }
      />

      {/* List */}
      <div className="mt-4 divide-y divide-divider">
        {visibleItems.map((item) => {
          const cfg = PRIORITY_CONFIG[item.priority];
          const Icon = cfg.icon;

          return (
            <div
              key={item.id}
              className="
                flex items-center gap-3 py-3 first:pt-0 last:pb-0
                group
              "
            >
              {/* Priority pill */}
              <span
                className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                  text-[11px] font-semibold whitespace-nowrap
                  ${cfg.pillClass}
                `}
              >
                <Icon className="w-3 h-3" />
                {cfg.label}
              </span>

              {/* Address + issue */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {item.address}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {item.issue}
                </p>
              </div>

              {/* Assigned closer */}
              {item.closerName && (
                <span className="hidden sm:inline text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                  {item.closerName}
                </span>
              )}

              {/* Go button */}
              <button
                onClick={() => onGoClick(item.transactionId)}
                className="
                  flex-shrink-0 inline-flex items-center gap-1
                  px-2.5 py-1 rounded-md text-xs font-semibold
                  text-royal hover:bg-royal/10
                  transition-all duration-150
                  active:scale-[0.97]
                "
              >
                Go
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* View all link */}
      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="
            mt-3 w-full flex items-center justify-center gap-1
            text-xs font-semibold text-royal
            hover:text-royal-300 transition-colors duration-150
            py-2
          "
        >
          View all {allItems.length}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}
    </Card>
  );
}
