import { useState, useMemo } from 'react';
import type { Deal } from 'types/deals';
import type { Transaction } from 'modules/transactions/typings/transactions.types';

interface UseDealSelectionReturn {
  hoveredDealId: string | null;
  selectedDealId: string | null;
  displayDeal: Deal | null;
  displayTransaction: Transaction | null;
  setHoveredDealId: (id: string | null) => void;
  setSelectedDealId: (id: string | null) => void;
}

/**
 * Custom hook to manage deal hover and selection state
 */
export const useDealSelection = (
  _filteredDeals: Deal[],
  deals: Deal[],
  transactions: Transaction[]
): UseDealSelectionReturn => {
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  // Get deal and transaction for summary (hovered takes priority, then selected)
  const displayDealId = hoveredDealId || selectedDealId;
  const displayDeal = useMemo(() => {
    if (!displayDealId) return null;
    return deals.find((deal) => deal.id === displayDealId) || null;
  }, [deals, displayDealId]);

  const displayTransaction = useMemo(() => {
    if (!displayDealId) return null;
    return transactions.find((t) => t.id === displayDealId) || null;
  }, [transactions, displayDealId]);

  return {
    hoveredDealId,
    selectedDealId,
    displayDeal,
    displayTransaction,
    setHoveredDealId,
    setSelectedDealId,
  };
};

