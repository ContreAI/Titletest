import { useShallow } from 'zustand/react/shallow';
import { useTransactionReportsStore } from '../store/transaction-reports.store';

/**
 * Custom hook to access transaction reports store with proper reactivity.
 * Uses useShallow to prevent unnecessary re-renders when unrelated state changes.
 */
export const useTransactionReports = () => {
  // State - use useShallow for proper shallow comparison
  const state = useTransactionReportsStore(
    useShallow((s) => ({
      currentTransactionReport: s.currentTransactionReport,
      transactionReports: s.transactionReports,
      isLoading: s.isLoading,
      activeJobs: s.activeJobs,
    }))
  );

  // Actions - these are stable references
  const actions = useTransactionReportsStore(
    useShallow((s) => ({
      setCurrentTransactionReport: s.setCurrentTransactionReport,
      setTransactionReport: s.setTransactionReport,
      getTransactionReport: s.getTransactionReport,
      fetchTransactionReport: s.fetchTransactionReport,
      clearCurrentTransactionReport: s.clearCurrentTransactionReport,
      setActiveJob: s.setActiveJob,
      getActiveJob: s.getActiveJob,
      pollJobStatus: s.pollJobStatus,
    }))
  );

  return {
    ...state,
    ...actions,
  };
};

