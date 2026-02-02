import { useMemo, useEffect } from 'react';
import type { Deal, DealStage } from 'types/deals';
import type { Transaction } from 'modules/transactions/typings/transactions.types';
import { useTransactionReports } from 'modules/transaction-reports';
import { useTransactionReportsStore } from 'modules/transaction-reports/store/transaction-reports.store';
import { deriveStatusFromTimeline } from 'lib/deal-status';

/**
 * Helper function to compute stages from transaction status (from database)
 * Maps database status values to stage display names and completion states
 */
const computeStagesFromStatus = (transactionStatus: string | null | undefined): DealStage[] => {
  // Map database status values to stage indices
  // Transaction status values: 'draft' | 'active' | 'pending' | 'completed' | 'cancelled' | 'closed' | 'post_em' | 'inspection_cleared' | 'ready_for_close'
  const statusToStageMap: Record<string, number> = {
    'draft': 0, // Draft transactions start at Active stage
    'pending': 0, // Pending transactions start at Active stage
    'active': 0,
    'post_em': 1,
    'inspection_cleared': 2,
    'ready_for_close': 3,
    'closed': 4, // All stages completed
    'completed': 4, // All stages completed
    // Also support display names for backward compatibility
    'Active': 0,
    'Post EM': 1,
    'Inspection Cleared': 2,
    'Ready for Close': 3,
  };

  // Default to 'active' if status is null, undefined, or not a recognized stage status
  if (!transactionStatus) {
    return [
      { name: 'Active', completed: false }, // Active is the current stage
      { name: 'Post EM', completed: false },
      { name: 'Inspection Cleared', completed: false },
      { name: 'Ready for Close', completed: false },
    ];
  }

  // Check original status first (case-sensitive), then normalized (lowercase)
  const normalizedStatus = transactionStatus.toLowerCase();
  const currentStageIndex = statusToStageMap[transactionStatus] ?? statusToStageMap[normalizedStatus] ?? 0;

  // If status is 'closed' or 'completed', all stages are completed
  const allCompleted = normalizedStatus === 'closed' || normalizedStatus === 'completed';

  // Stages before the current stage are completed, current and future stages are not
  // For example: if currentStageIndex is 1 (Post EM), then Active (0) is completed, Post EM (1) is current
  return [
    { name: 'Active', completed: allCompleted || currentStageIndex > 0 },
    { name: 'Post EM', completed: allCompleted || currentStageIndex > 1 },
    { name: 'Inspection Cleared', completed: allCompleted || currentStageIndex > 2 },
    { name: 'Ready for Close', completed: allCompleted || currentStageIndex > 3 },
  ];
};

/**
 * Custom hook to map transactions to Deal format
 */
export const useTransactionDeals = (transactions: Transaction[]): Deal[] => {
  const { transactionReports, fetchTransactionReport } = useTransactionReports();

  // Fetch reports for all transactions (in background, don't block)
  const transactionIds = useMemo(() => transactions.map(t => t.id), [transactions]);

  useEffect(() => {
    transactionIds.forEach((transactionId) => {
      // Only fetch if not already in the map
      const reports = useTransactionReportsStore.getState().transactionReports;
      if (!reports.has(transactionId)) {
        fetchTransactionReport(transactionId).catch(() => {
          // Silently fail - report might not exist yet
        });
      }
    });
  }, [transactionIds, fetchTransactionReport]);

  return useMemo((): Deal[] => {
    return transactions
      .filter((t) => t.status !== 'cancelled')
      .map((transaction) => {
        const report = transactionReports.get(transaction.id);

        // Derive status from timeline dates in the transaction report
        // This provides accurate stage progression based on actual contract milestones
        // Falls back to database status (typically 'active') when no timeline data exists
        const derivedStatus = deriveStatusFromTimeline(report?.data, transaction.status);

        // Compute stages from the derived status
        const stages = computeStagesFromStatus(derivedStatus);

        // Format address for title
        const propertyAddr = transaction.propertyAddress || {
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States',
        };
        const addressTitle = propertyAddr.streetAddress
          ? `${propertyAddr.streetAddress}, ${propertyAddr.city}, ${propertyAddr.state} ${propertyAddr.zipCode}`
          : transaction.transactionName;

        // Get purchase price from report if available
        let price = 0;
        if (report?.data?.purchase_price) {
          const priceStr = report.data.purchase_price.replace(/[^0-9.]/g, '');
          const parsedPrice = parseFloat(priceStr);
          if (!isNaN(parsedPrice)) {
            price = parsedPrice;
          }
        }

        // Get closing date from report if available, otherwise use transaction createdAt
        let closingDate = 'TBD';
        if (report?.data?.closing_date) {
          closingDate = report.data.closing_date;
        } else if (transaction.createdAt) {
          closingDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }

        return {
          id: transaction.id,
          title: addressTitle,
          price,
          closingDate,
          stages,
          // Pass through property address for PropertyMapAvatar
          propertyAddress: propertyAddr.streetAddress
            ? {
                streetAddress: propertyAddr.streetAddress,
                city: propertyAddr.city,
                state: propertyAddr.state,
                zipCode: propertyAddr.zipCode,
              }
            : undefined,
          // Pass through geocoding data for PropertyMapAvatar
          geocoding: transaction.geocoding
            ? {
                status: transaction.geocoding.status,
                confidence: transaction.geocoding.confidence,
                coordinates: transaction.geocoding.coordinates,
              }
            : undefined,
        };
      });
  }, [transactions, transactionReports]);
};
