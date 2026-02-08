"use client";

import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  FileText,
  MessageSquare,
} from "lucide-react";
import { AdminTransaction, PIPELINE_STAGES, TRANSACTION_TYPES } from "@/types/admin";
import { usePipelineStore } from "@/stores/admin/pipelineStore";
import Badge from "@/components/common/Badge";
import { useState } from "react";

interface ListViewProps {
  transactions: AdminTransaction[];
}

type SortColumn = "property" | "closing_date" | "created_at" | "updated_at";

export function ListView({ transactions }: ListViewProps) {
  const { sortBy, sortOrder, setSorting } = usePipelineStore();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSorting(column, sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSorting(column, "asc");
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="px-6 overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort("property")}
                className="flex items-center gap-1 text-sm font-semibold text-storm-gray hover:text-spruce"
              >
                Property
                <SortIcon column="property" />
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-storm-gray">
              Type
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-storm-gray">
              Buyer
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-storm-gray">
              Seller
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-storm-gray">
              Status
            </th>
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort("closing_date")}
                className="flex items-center gap-1 text-sm font-semibold text-storm-gray hover:text-spruce"
              >
                Closing
                <SortIcon column="closing_date" />
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-storm-gray">
              Closer
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-storm-gray">
              Docs
            </th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => {
            const daysUntil = getDaysUntilClosing(tx.dates.closingDate);
            const isUrgent = tx.priority === "urgent" || (daysUntil <= 3 && daysUntil >= 0);
            const isOverdue = daysUntil < 0;

            return (
              <tr
                key={tx.id}
                className={`
                  border-b border-border
                  hover:bg-mist/50 transition-colors
                  ${index % 2 === 0 ? "bg-paper" : "bg-mist/20"}
                `}
                onMouseEnter={() => setHoveredRow(tx.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Property */}
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/transactions/${tx.id}`}
                    className="hover:text-spruce"
                  >
                    <div className="font-medium text-storm-gray">
                      {tx.property.address}
                    </div>
                    <div className="text-sm text-river-stone">
                      {tx.property.city}, {tx.property.state}
                    </div>
                  </Link>
                </td>

                {/* Type */}
                <td className="py-3 px-4">
                  <Badge variant="muted" size="sm">
                    {TRANSACTION_TYPES[tx.transactionType].label}
                  </Badge>
                </td>

                {/* Buyer */}
                <td className="py-3 px-4">
                  <div className="text-sm text-storm-gray truncate max-w-[150px]">
                    {tx.buyerNames.join(", ") || "—"}
                  </div>
                </td>

                {/* Seller */}
                <td className="py-3 px-4">
                  <div className="text-sm text-storm-gray truncate max-w-[150px]">
                    {tx.sellerNames.join(", ") || "—"}
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <StatusBadge stage={tx.pipelineStage} />
                </td>

                {/* Closing Date */}
                <td className="py-3 px-4">
                  <div
                    className={`text-sm font-medium ${
                      isOverdue
                        ? "text-signal-red"
                        : isUrgent
                        ? "text-amber"
                        : "text-storm-gray"
                    }`}
                  >
                    {formatDate(tx.dates.closingDate)}
                  </div>
                  <div className="text-xs text-river-stone">
                    {isOverdue
                      ? `${Math.abs(daysUntil)}d overdue`
                      : daysUntil === 0
                      ? "Today"
                      : `${daysUntil}d`}
                  </div>
                </td>

                {/* Closer */}
                <td className="py-3 px-4">
                  {tx.assignedCloserName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-sea-glass rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-medium text-storm-gray">
                          {getInitials(tx.assignedCloserName)}
                        </span>
                      </div>
                      <span className="text-sm text-storm-gray">
                        {tx.assignedCloserName.split(" ")[0]}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-river-stone">Unassigned</span>
                  )}
                </td>

                {/* Docs */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-sm text-river-stone">
                    <FileText className="w-4 h-4" />
                    <span>{tx.documentCount}</span>
                    {tx.unreadMessageCount > 0 && (
                      <span className="flex items-center gap-1 text-spruce">
                        <MessageSquare className="w-4 h-4" />
                        {tx.unreadMessageCount}
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-4">
                  <button
                    className={`
                      p-1.5 rounded-lg text-river-stone
                      hover:bg-mist hover:text-storm-gray
                      transition-opacity duration-150
                      ${hoveredRow === tx.id ? "opacity-100" : "opacity-0"}
                    `}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="text-center py-12 text-river-stone">
          No transactions found
        </div>
      )}
    </div>
  );
}

function StatusBadge({ stage }: { stage: AdminTransaction["pipelineStage"] }) {
  const stageInfo = PIPELINE_STAGES[stage];

  const colorClasses: Record<string, string> = {
    new_pending: "bg-amber/20 text-amber",
    title_work: "bg-river-stone/20 text-river-stone",
    clear_to_close: "bg-sea-glass/30 text-storm-gray",
    scheduled: "bg-spruce/20 text-spruce",
    closed: "bg-fern/20 text-fern",
    cancelled: "bg-signal-red/20 text-signal-red",
    on_hold: "bg-storm-gray/20 text-storm-gray",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
        ${colorClasses[stage]}
      `}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: "currentColor" }}
      />
      {stageInfo.label}
    </span>
  );
}

function getDaysUntilClosing(closingDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closing = new Date(closingDate);
  closing.setHours(0, 0, 0, 0);
  const diffTime = closing.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
