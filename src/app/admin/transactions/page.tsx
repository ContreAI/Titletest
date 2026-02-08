"use client";

import { useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/layout";
import { ListView } from "@/components/admin/pipeline";
import Button from "@/components/common/Button";
import { usePipelineStore } from "@/stores/admin/pipelineStore";
import { mockAdminTransactions } from "@/data/adminMockData";

export default function TransactionsPage() {
  const { setTransactions, transactions: allTransactions, filters, sortBy, sortOrder } = usePipelineStore();

  // Compute filtered transactions locally
  const transactions = useMemo(() => {
    let filtered = [...allTransactions];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.property.address.toLowerCase().includes(search) ||
          tx.property.city.toLowerCase().includes(search) ||
          tx.buyerNames.some((name) => name.toLowerCase().includes(search)) ||
          tx.sellerNames.some((name) => name.toLowerCase().includes(search))
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "closing_date":
          comparison = a.dates.closingDate.localeCompare(b.dates.closingDate);
          break;
        case "property":
          comparison = a.property.address.localeCompare(b.property.address);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [allTransactions, filters, sortBy, sortOrder]);

  // Load mock data on mount
  useEffect(() => {
    setTransactions(mockAdminTransactions);
  }, [setTransactions]);

  return (
    <div className="flex flex-col h-full">
      <AdminHeader
        title="Transactions"
        subtitle={`${transactions.length} total transactions`}
      />

      {/* Actions Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
        <div className="flex items-center gap-2">
          {/* Filter tags would go here */}
        </div>
        <Link href="/admin/transactions/new">
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            New Transaction
          </Button>
        </Link>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto py-4">
        <ListView transactions={transactions} />
      </div>
    </div>
  );
}
