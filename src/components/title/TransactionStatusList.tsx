"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminTransaction } from "@/types/admin";

const STAGE_LABELS: Record<string, string> = {
  new_pending: "New / Pending",
  title_work: "Title Work",
  clear_to_close: "Clear to Close",
  scheduled: "Closing Scheduled",
  closed: "Closed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

const STAGE_COLORS: Record<string, string> = {
  new_pending: "bg-sea-glass/20 text-sea-glass-400",
  title_work: "bg-royal/10 text-royal",
  clear_to_close: "bg-fern/10 text-fern-400",
  scheduled: "bg-amber/10 text-amber-400",
  closed: "bg-river-stone/10 text-river-stone",
  on_hold: "bg-signal-red/10 text-signal-red",
  cancelled: "bg-river-stone/10 text-river-stone",
};

export interface TransactionStatusListProps {
  transactions: AdminTransaction[];
}

export default function TransactionStatusList({
  transactions,
}: TransactionStatusListProps) {
  return (
    <div className="space-y-1">
      {transactions.map((tx) => (
        <Link
          key={tx.id}
          href={`/title/transactions/${tx.id}`}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-elevation1)] transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">
              {tx.property.address}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {tx.property.city}, {tx.property.state} {tx.property.zip}
            </p>
          </div>

          <div className="text-right flex-shrink-0 hidden sm:block">
            <p className="text-sm font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
              ${tx.financials.purchasePrice.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Close:{" "}
              {tx.dates.closingDate
                ? new Date(tx.dates.closingDate).toLocaleDateString()
                : "TBD"}
            </p>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              STAGE_COLORS[tx.pipelineStage] || "bg-black/[0.04] text-river-stone"
            }`}
          >
            {STAGE_LABELS[tx.pipelineStage] || tx.pipelineStage}
          </span>

          <ArrowRight className="w-4 h-4 text-[var(--text-disabled)] group-hover:text-royal transition-colors flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
}
