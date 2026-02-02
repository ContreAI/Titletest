/**
 * Deal Status Utilities
 *
 * Shared logic for deriving transaction deal stage from timeline dates.
 * Used by kanban board and dashboard widgets for consistent status display.
 */

import type { TransactionStatus } from 'modules/transactions/typings/transactions.types';

interface TimelineData {
  effective_contract_date?: string | null;
  earnest_money_due?: string | null;
  inspection_deadline?: string | null;
  closing_date?: string | null;
}

/**
 * Check if a date string represents a date in the past or today.
 */
export const isPastOrToday = (dateStr: string | undefined | null): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
};

/**
 * Check if a date is within N days from today (inclusive).
 */
export const isWithinDays = (dateStr: string | undefined | null, days: number): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return date >= today && date <= futureDate;
};

/**
 * Derive the deal stage status from timeline dates in a transaction report.
 *
 * The status progression is:
 * 1. active - Contract signed (effective_contract_date passed)
 * 2. post_em - Earnest money due date passed
 * 3. inspection_cleared - Inspection deadline passed
 * 4. ready_for_close - Closing date within 7 days
 * 5. completed - Closing date has passed
 *
 * @param timelineData - Object containing timeline date fields from report.data
 * @param fallbackStatus - Status to use if no timeline dates are available
 * @returns The derived TransactionStatus
 */
export const deriveStatusFromTimeline = (
  timelineData: TimelineData | null | undefined,
  fallbackStatus: TransactionStatus = 'active',
): TransactionStatus => {
  if (!timelineData) return fallbackStatus;

  // Check timeline milestones in reverse order (most progressed first)
  // If closing date has passed, deal is completed
  if (isPastOrToday(timelineData.closing_date)) {
    return 'completed';
  }

  // If closing date is within 7 days, deal is ready for close
  if (isWithinDays(timelineData.closing_date, 7)) {
    return 'ready_for_close';
  }

  // If inspection deadline has passed, deal is inspection cleared
  if (isPastOrToday(timelineData.inspection_deadline)) {
    return 'inspection_cleared';
  }

  // If earnest money due date has passed, deal is post earnest money
  if (isPastOrToday(timelineData.earnest_money_due)) {
    return 'post_em';
  }

  // If contract start date exists and has passed, deal is active
  if (isPastOrToday(timelineData.effective_contract_date)) {
    return 'active';
  }

  // Fall back to the stored status
  return fallbackStatus;
};

/**
 * Map internal status to display label.
 */
export const statusToDisplayLabel: Record<TransactionStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  pending: 'Pending',
  post_em: 'Post EM',
  inspection_cleared: 'Inspection Cleared',
  ready_for_close: 'Ready for Close',
  completed: 'Completed',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

/**
 * Get display label for a status.
 */
export const getStatusDisplayLabel = (status: TransactionStatus): string => {
  return statusToDisplayLabel[status] || status;
};
