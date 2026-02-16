"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Card, Button } from "@/components/common";
import { TransactionStatusList } from "@/components/title";
import { mockAdminTransactions } from "@/data/adminMockData";

export default function TitleTransactionsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("active");

  const filtered = mockAdminTransactions.filter((tx) => {
    // Search filter
    const matchesSearch =
      search === "" ||
      tx.property.address.toLowerCase().includes(search.toLowerCase()) ||
      tx.property.city.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase());

    // Status filter
    const matchesFilter =
      filter === "all" ||
      (filter === "active" &&
        !["closed", "cancelled"].includes(tx.pipelineStage)) ||
      (filter === "closed" && tx.pipelineStage === "closed") ||
      (filter === "on_hold" && tx.pipelineStage === "on_hold");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              Transactions
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/title/upload">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Transaction
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search by address, city, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-divider rounded-lg bg-paper text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce"
            />
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-elevation1)] rounded-lg p-1">
            {[
              { id: "active", label: "Active" },
              { id: "closed", label: "Closed" },
              { id: "on_hold", label: "On Hold" },
              { id: "all", label: "All" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === opt.id
                    ? "bg-paper text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <Card>
          {filtered.length > 0 ? (
            <TransactionStatusList transactions={filtered} />
          ) : (
            <div className="text-center py-12">
              <p className="text-[var(--text-secondary)]">
                No transactions match your search
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
