import { useMemo } from 'react';
import type { Deal, DealStageName } from 'types/deals';
import type { Transaction } from 'modules/transactions/typings/transactions.types';

interface UseDealFiltersParams {
  deals: Deal[];
  transactions: Transaction[];
  stageFilter: DealStageName | 'all';
  sortBy: string;
}

/**
 * Custom hook to filter and sort deals
 */
export const useDealFilters = ({ deals, transactions, stageFilter, sortBy }: UseDealFiltersParams): Deal[] => {
  return useMemo(() => {
    let result = deals;

    // Filter by stage
    if (stageFilter !== 'all') {
      result = result.filter((deal) => {
        // Check if any stage matches the filter and is completed
        return deal.stages.some((stage) => stage.name === stageFilter && stage.completed);
      });
    }

    // Sort deals
    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date': {
          // Sort by closing date (createdAt)
          const dateA = transactions.find((t) => t.id === a.id)?.createdAt || '';
          const dateB = transactions.find((t) => t.id === b.id)?.createdAt || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime(); // Newest first
        }
        case 'price': {
          // Sort by price (descending)
          return b.price - a.price;
        }
        case 'name': {
          // Sort alphabetically by title
          return a.title.localeCompare(b.title);
        }
        case 'stage': {
          // Sort by stage progress (more completed stages first)
          const getStageProgress = (deal: Deal) => {
            return deal.stages.filter((s) => s.completed).length;
          };
          return getStageProgress(b) - getStageProgress(a);
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [deals, stageFilter, sortBy, transactions]);
};

