import { useShallow } from 'zustand/react/shallow';
import { useTransactionsStore } from '../store/transactions.store';

/**
 * Custom hook to access transactions store state with proper reactivity.
 * Uses useShallow to prevent unnecessary re-renders when unrelated state changes.
 */
export const useTransactions = () => {
  // State - use useShallow for proper shallow comparison
  const state = useTransactionsStore(
    useShallow((s) => ({
      currentTransaction: s.currentTransaction,
      transactions: s.transactions,
      isCreating: s.isCreating,
      isEditing: s.isEditing,
      isLoading: s.isLoading,
      transactionScope: s.transactionScope,
    }))
  );

  // Actions - these are stable references, no need for useShallow
  const actions = useTransactionsStore(
    useShallow((s) => ({
      setCurrentTransaction: s.setCurrentTransaction,
      setTransactionScope: s.setTransactionScope,
      fetchTransactions: s.fetchTransactions,
      fetchTransactionById: s.fetchTransactionById,
      createTransaction: s.createTransaction,
      updateTransaction: s.updateTransaction,
      clearCurrentTransaction: s.clearCurrentTransaction,
    }))
  );

  return {
    ...state,
    ...actions,
  };
};

