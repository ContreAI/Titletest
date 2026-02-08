"use client";

import { Calendar } from "lucide-react";
import { StatusBadge, Badge } from "@/components/common";
import { Transaction } from "@/types";
import { formatDate, calculateDaysRemaining } from "@/data/mockData";

export interface TransactionBannerProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

export default function TransactionBanner({
  transaction,
  side,
}: TransactionBannerProps) {
  const fullAddress = `${transaction.property.address}, ${transaction.property.city} ${transaction.property.state} ${transaction.property.zip}`;
  const daysUntilClosing = calculateDaysRemaining(transaction.dates.closingDate);
  const roleLabel = side === "buyer" ? "Buyer Agent" : "Seller Agent";

  return (
    <div className="bg-mist border-b border-border px-4 md:px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Property Info */}
        <div>
          <h1 className="text-2xl md:text-3xl text-spruce tracking-wide">
            {fullAddress}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {/* Closing Date */}
            <div className="flex items-center gap-1.5 text-sm text-river-stone">
              <Calendar className="w-4 h-4" />
              <span>Closing: {formatDate(transaction.dates.closingDate)}</span>
              <span className="font-mono text-storm-gray font-medium">
                ({daysUntilClosing} days)
              </span>
            </div>
          </div>
        </div>

        {/* Status and Role */}
        <div className="flex items-center gap-2">
          <StatusBadge status={transaction.status} size="md" />
          <Badge variant="default" size="md">
            {roleLabel}
          </Badge>
        </div>
      </div>

      {/* Transaction ID for reference */}
      <div className="mt-2">
        <span className="text-xs text-river-stone">
          Order #{" "}
          <span className="font-mono">{transaction.qualiaOrderId || transaction.id}</span>
        </span>
      </div>
    </div>
  );
}
