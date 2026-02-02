import { useEffect, useMemo, useCallback } from 'react';
import { useTransactions } from 'modules/transactions';
import { useTransactionReports } from 'modules/transaction-reports';
import { useTransactionReportsStore } from 'modules/transaction-reports/store/transaction-reports.store';
import type { Transaction } from 'modules/transactions/typings/transactions.types';
import type { TransactionReport } from 'modules/transaction-reports/typings/transaction-reports.types';

export interface DealWithReport {
  transaction: Transaction;
  report: TransactionReport | null;
}

export interface DashboardDataResult {
  /** All transactions with their associated reports */
  dealsWithReports: DealWithReport[];
  /** Active transactions (excluding cancelled/completed) with reports */
  activeDealsWithReports: DealWithReport[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Refresh data from the server */
  refresh: () => Promise<void>;
}

/**
 * Shared hook for dashboard widgets to access transaction and report data.
 * Centralizes data fetching and reduces duplicate API calls.
 */
export function useDashboardData(): DashboardDataResult {
  const { transactions, fetchTransactions, isLoading: transactionsLoading } = useTransactions();
  const { transactionReports, fetchTransactionReport, isLoading: reportsLoading } = useTransactionReports();

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions().catch(console.error);
  }, [fetchTransactions]);

  // Fetch reports for all transactions
  const transactionIds = useMemo(() => transactions.map(t => t.id), [transactions]);

  useEffect(() => {
    transactionIds.forEach((transactionId) => {
      const reports = useTransactionReportsStore.getState().transactionReports;
      if (!reports.has(transactionId)) {
        fetchTransactionReport(transactionId).catch(() => {
          // Silently fail - report might not exist yet
        });
      }
    });
  }, [transactionIds, fetchTransactionReport]);

  // Combine transactions with their reports
  const dealsWithReports = useMemo((): DealWithReport[] => {
    return transactions.map((transaction) => ({
      transaction,
      report: transactionReports.get(transaction.id) || null,
    }));
  }, [transactions, transactionReports]);

  // Filter to active deals only (exclude cancelled and completed)
  const activeDealsWithReports = useMemo((): DealWithReport[] => {
    return dealsWithReports.filter(
      ({ transaction }) =>
        transaction.status !== 'cancelled' &&
        transaction.status !== 'completed' &&
        transaction.status !== 'closed'
    );
  }, [dealsWithReports]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  return {
    dealsWithReports,
    activeDealsWithReports,
    isLoading: transactionsLoading || reportsLoading,
    refresh,
  };
}

export default useDashboardData;
