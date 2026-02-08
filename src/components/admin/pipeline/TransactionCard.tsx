"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  MessageSquare,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { AdminTransaction, TRANSACTION_TYPES } from "@/types/admin";
import Badge from "@/components/common/Badge";

interface TransactionCardProps {
  transaction: AdminTransaction;
  compact?: boolean;
  onDragStart?: (e: React.DragEvent, transaction: AdminTransaction) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const PRIORITY_STYLES = {
  low: "bg-river-stone/10 text-[var(--text-tertiary)]",
  normal: "",
  high: "bg-amber-50 text-amber-700 border border-amber-200",
  urgent: "bg-signal-red-50 text-signal-red-700 border border-signal-red-200",
};

export function TransactionCard({
  transaction,
  compact = false,
  onDragStart,
  onDragEnd,
}: TransactionCardProps) {
  const daysUntil = getDaysUntilClosing(transaction.dates.closingDate);
  const isUrgent = transaction.priority === "urgent" || daysUntil <= 3;
  const isOverdue = daysUntil < 0;

  return (
    <Link href={`/admin/transactions/${transaction.id}`}>
      <div
        draggable={!!onDragStart}
        onDragStart={(e) => onDragStart?.(e, transaction)}
        onDragEnd={onDragEnd}
        className={`
          bg-paper rounded-lg border border-divider p-4
          transition-all duration-200 cursor-pointer
          hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)] hover:border-sea-glass
          ${isUrgent ? "border-l-[3px] border-l-signal-red" : ""}
          ${onDragStart ? "cursor-grab active:cursor-grabbing active:shadow-[var(--shadow-3)] active:rotate-[1deg] active:opacity-90" : ""}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">
              {transaction.property.address}
            </h3>
            <p className="text-sm text-[var(--text-tertiary)]">
              {transaction.property.city}, {transaction.property.state}
            </p>
          </div>
          {transaction.priority !== "normal" && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                PRIORITY_STYLES[transaction.priority]
              }`}
            >
              {transaction.priority}
            </span>
          )}
        </div>

        {/* Transaction Type Badge */}
        <div className="mb-3">
          <Badge variant="muted" size="sm">
            {TRANSACTION_TYPES[transaction.transactionType].label}
          </Badge>
        </div>

        {/* Closing Date */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <Calendar className="w-4 h-4 text-[var(--text-disabled)]" />
          <span
            className={`font-medium ${
              isOverdue ? "text-signal-red" : isUrgent ? "text-amber-600" : "text-[var(--text-secondary)]"
            }`}
          >
            {formatClosingDate(transaction.dates.closingDate)}
            {daysUntil >= 0 && (
              <span className="text-[var(--text-tertiary)] font-normal ml-1">
                ({daysUntil === 0 ? "Today" : `${daysUntil}d`})
              </span>
            )}
            {isOverdue && (
              <span className="ml-1 font-semibold">({Math.abs(daysUntil)}d overdue)</span>
            )}
          </span>
        </div>

        {!compact && (
          <>
            {/* Divider */}
            <div className="border-t border-divider my-3" />

            {/* Parties */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-disabled)] w-14 text-xs uppercase tracking-wide">Buyer</span>
                <span className="text-[var(--text-primary)] truncate flex-1">
                  {transaction.buyerNames.join(", ") || "TBD"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-disabled)] w-14 text-xs uppercase tracking-wide">Seller</span>
                <span className="text-[var(--text-primary)] truncate flex-1">
                  {transaction.sellerNames.join(", ") || "TBD"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-divider">
              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {transaction.documentCount}
                </span>
                {transaction.unreadMessageCount > 0 && (
                  <span className="flex items-center gap-1 text-spruce font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {transaction.unreadMessageCount}
                  </span>
                )}
                {transaction.pendingDocumentCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {transaction.pendingDocumentCount} pending
                  </span>
                )}
              </div>

              {/* Closer avatar */}
              {transaction.assignedCloserName && (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-gradient-to-br from-sea-glass to-spruce-200 rounded-full flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                    <span className="text-[10px] font-semibold text-storm-gray">
                      {getInitials(transaction.assignedCloserName)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {compact && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <FileText className="w-3.5 h-3.5" />
              {transaction.documentCount}
              {transaction.unreadMessageCount > 0 && (
                <span className="flex items-center gap-1 text-spruce">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {transaction.unreadMessageCount}
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-disabled)]" />
          </div>
        )}
      </div>
    </Link>
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

function formatClosingDate(dateString: string): string {
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
