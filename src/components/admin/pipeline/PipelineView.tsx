"use client";

import { useEffect, useMemo } from "react";
import { LayoutGrid, List, Calendar } from "lucide-react";
import { usePipelineStore } from "@/stores/admin/pipelineStore";
import { mockAdminTransactions } from "@/data/adminMockData";
import { AdminHeader } from "@/components/admin/layout";
import { KanbanBoard } from "./KanbanBoard";
import { ListView } from "./ListView";
import { PipelineViewMode, PipelineStage, AdminTransaction } from "@/types/admin";

const VIEW_OPTIONS: { mode: PipelineViewMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { mode: "kanban", icon: LayoutGrid, label: "Kanban" },
  { mode: "list", icon: List, label: "List" },
  { mode: "calendar", icon: Calendar, label: "Calendar" },
];

export function PipelineView() {
  const { setTransactions, viewMode, setViewMode, transactions, filters, sortBy, sortOrder } = usePipelineStore();

  // Compute filtered transactions with useMemo to avoid infinite loops
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.property.address.toLowerCase().includes(search) ||
          tx.property.city.toLowerCase().includes(search) ||
          tx.buyerNames.some((name) => name.toLowerCase().includes(search)) ||
          tx.sellerNames.some((name) => name.toLowerCase().includes(search)) ||
          tx.id.toLowerCase().includes(search)
      );
    }

    // Stage filter
    if (filters.stages.length > 0) {
      filtered = filtered.filter((tx) => filters.stages.includes(tx.pipelineStage));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "closing_date":
          comparison = a.dates.closingDate.localeCompare(b.dates.closingDate);
          break;
        case "created_at":
          comparison = a.createdAt.localeCompare(b.createdAt);
          break;
        case "property":
          comparison = a.property.address.localeCompare(b.property.address);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filters, sortBy, sortOrder]);

  // Compute transactions by stage with useMemo
  const transactionsByStage = useMemo(() => {
    const byStage: Record<PipelineStage, AdminTransaction[]> = {
      new_pending: [],
      title_work: [],
      clear_to_close: [],
      scheduled: [],
      closed: [],
      cancelled: [],
      on_hold: [],
    };

    filteredTransactions.forEach((tx) => {
      byStage[tx.pipelineStage].push(tx);
    });

    return byStage;
  }, [filteredTransactions]);

  // Load mock data on mount
  useEffect(() => {
    setTransactions(mockAdminTransactions);
  }, [setTransactions]);

  // Count transactions (excluding closed and cancelled for active count)
  const activeCount = filteredTransactions.filter(
    (tx) => !["closed", "cancelled"].includes(tx.pipelineStage)
  ).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <AdminHeader
        title="Transaction Pipeline"
        subtitle={`${activeCount} active transactions`}
      />

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-paper">
        {/* View Toggle */}
        <div className="flex items-center bg-mist rounded-lg p-1">
          {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                transition-colors duration-150
                ${
                  viewMode === mode
                    ? "bg-paper text-storm-gray shadow-[var(--shadow-0)]"
                    : "text-river-stone hover:text-storm-gray"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          <QuickFilter label="All" active />
          <QuickFilter label="My Transactions" />
          <QuickFilter label="Urgent" count={2} />
          <QuickFilter label="Closing This Week" count={3} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden py-4">
        {viewMode === "kanban" && (
          <KanbanBoard transactionsByStage={transactionsByStage} />
        )}
        {viewMode === "list" && (
          <ListView transactions={filteredTransactions} />
        )}
        {viewMode === "calendar" && (
          <div className="flex items-center justify-center h-full text-river-stone">
            Calendar view coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

function QuickFilter({
  label,
  count,
  active,
}: {
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <button
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium
        transition-colors duration-150
        ${
          active
            ? "bg-spruce text-white"
            : "bg-mist text-river-stone hover:bg-sea-glass/30 hover:text-storm-gray"
        }
      `}
    >
      {label}
      {count !== undefined && (
        <span
          className={`
            ml-1.5 px-1.5 py-0.5 text-xs rounded-full
            ${active ? "bg-white/20" : "bg-storm-gray/10"}
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}
