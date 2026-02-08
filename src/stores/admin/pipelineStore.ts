import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  AdminTransaction,
  PipelineStage,
  PipelineFilters,
  PipelineViewMode,
  TransactionType,
} from "@/types/admin";

interface PipelineState {
  // Data
  transactions: AdminTransaction[];
  isLoading: boolean;
  error: string | null;

  // View state
  viewMode: PipelineViewMode;

  // Filters
  filters: PipelineFilters;

  // Sort
  sortBy: "closing_date" | "created_at" | "updated_at" | "property";
  sortOrder: "asc" | "desc";

  // Kanban drag state
  draggedTransactionId: string | null;
  dropTargetStage: PipelineStage | null;

  // Actions
  setTransactions: (transactions: AdminTransaction[]) => void;
  setViewMode: (mode: PipelineViewMode) => void;
  setFilters: (filters: Partial<PipelineFilters>) => void;
  clearFilters: () => void;
  setSorting: (sortBy: PipelineState["sortBy"], sortOrder: "asc" | "desc") => void;
  moveTransaction: (transactionId: string, newStage: PipelineStage) => void;
  setDragState: (transactionId: string | null, targetStage: PipelineStage | null) => void;
  updateTransaction: (id: string, updates: Partial<AdminTransaction>) => void;
}

const defaultFilters: PipelineFilters = {
  search: "",
  stages: [],
  transactionTypes: [],
  closerIds: [],
  dateRange: { start: null, end: null },
  priority: [],
  tags: [],
};

export const usePipelineStore = create<PipelineState>()(
  devtools(
    (set, get) => ({
      // Initial state
      transactions: [],
      isLoading: false,
      error: null,
      viewMode: "kanban",
      filters: defaultFilters,
      sortBy: "closing_date",
      sortOrder: "asc",
      draggedTransactionId: null,
      dropTargetStage: null,

      // Actions
      setTransactions: (transactions) => set({ transactions }),

      setViewMode: (viewMode) => set({ viewMode }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      clearFilters: () => set({ filters: defaultFilters }),

      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

      moveTransaction: (transactionId, newStage) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === transactionId ? { ...tx, pipelineStage: newStage } : tx
          ),
        })),

      setDragState: (transactionId, targetStage) =>
        set({
          draggedTransactionId: transactionId,
          dropTargetStage: targetStage,
        }),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })),
    }),
    { name: "pipeline-store" }
  )
);

// Selectors
export const selectFilteredTransactions = (state: PipelineState) => {
  let filtered = [...state.transactions];
  const { filters, sortBy, sortOrder } = state;

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

  // Transaction type filter
  if (filters.transactionTypes.length > 0) {
    filtered = filtered.filter((tx) =>
      filters.transactionTypes.includes(tx.transactionType)
    );
  }

  // Closer filter
  if (filters.closerIds.length > 0) {
    filtered = filtered.filter(
      (tx) => tx.assignedCloserId && filters.closerIds.includes(tx.assignedCloserId)
    );
  }

  // Priority filter
  if (filters.priority.length > 0) {
    filtered = filtered.filter((tx) => filters.priority.includes(tx.priority));
  }

  // Date range filter
  if (filters.dateRange.start) {
    filtered = filtered.filter(
      (tx) => tx.dates.closingDate >= filters.dateRange.start!
    );
  }
  if (filters.dateRange.end) {
    filtered = filtered.filter(
      (tx) => tx.dates.closingDate <= filters.dateRange.end!
    );
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
      case "updated_at":
        comparison = a.updatedAt.localeCompare(b.updatedAt);
        break;
      case "property":
        comparison = a.property.address.localeCompare(b.property.address);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return filtered;
};

export const selectTransactionsByStage = (state: PipelineState) => {
  const filtered = selectFilteredTransactions(state);
  const byStage: Record<PipelineStage, AdminTransaction[]> = {
    new_pending: [],
    title_work: [],
    clear_to_close: [],
    scheduled: [],
    closed: [],
    cancelled: [],
    on_hold: [],
  };

  filtered.forEach((tx) => {
    byStage[tx.pipelineStage].push(tx);
  });

  return byStage;
};
