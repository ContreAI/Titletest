import type { DealWithReport } from '../../hooks';

export interface DeadlineItem {
  transactionId: string;
  dealName: string;
  deadlineType: 'inspection' | 'financing' | 'closing' | 'earnest_money' | 'title_commitment' | 'seller_disclosure';
  deadlineDate: Date;
  daysRemaining: number;
}

export type UrgencyLevel = 'critical' | 'warning' | 'normal';

/**
 * Parse a date string that may be in various formats.
 * Returns null if the date is invalid.
 */
export function parseDeadlineDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  // Try parsing directly
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Try MM/DD/YYYY format
  const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

/**
 * Calculate days remaining until a deadline.
 * Negative values indicate past deadlines.
 */
export function calculateDaysRemaining(deadlineDate: Date, referenceDate: Date = new Date()): number {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get urgency level based on days remaining.
 */
export function getUrgencyLevel(daysRemaining: number): UrgencyLevel {
  if (daysRemaining <= 2) return 'critical';
  if (daysRemaining <= 5) return 'warning';
  return 'normal';
}

/**
 * Extract all deadlines from a deal's report data.
 */
export function extractDeadlinesFromDeal(
  deal: DealWithReport,
  maxDays: number = 7,
  referenceDate: Date = new Date()
): DeadlineItem[] {
  const { transaction, report } = deal;
  if (!report?.data) return [];

  const deadlines: DeadlineItem[] = [];
  const data = report.data;
  const dealName = transaction.transactionName || transaction.propertyAddress?.streetAddress || 'Unnamed Deal';

  // Check each deadline type
  const deadlineFields: Array<{
    field: keyof typeof data;
    type: DeadlineItem['deadlineType'];
  }> = [
    { field: 'inspection_deadline', type: 'inspection' },
    { field: 'financing_deadline', type: 'financing' },
    { field: 'financial_deadline', type: 'financing' }, // Alternative field name
    { field: 'closing_date', type: 'closing' },
    { field: 'earnest_money_due', type: 'earnest_money' },
    { field: 'title_commitment_date', type: 'title_commitment' },
    { field: 'seller_disclosure_date', type: 'seller_disclosure' },
  ];

  for (const { field, type } of deadlineFields) {
    const dateStr = data[field] as string | null | undefined;
    const date = parseDeadlineDate(dateStr);

    if (date) {
      const daysRemaining = calculateDaysRemaining(date, referenceDate);
      // Only include future deadlines (within max days)
      if (daysRemaining >= 0 && daysRemaining <= maxDays) {
        deadlines.push({
          transactionId: transaction.id,
          dealName,
          deadlineType: type,
          deadlineDate: date,
          daysRemaining,
        });
      }
    }
  }

  return deadlines;
}

/**
 * Get all upcoming deadlines from deals, sorted by urgency.
 */
export function getUpcomingDeadlines(
  deals: DealWithReport[],
  maxDays: number = 7,
  referenceDate: Date = new Date()
): DeadlineItem[] {
  const allDeadlines: DeadlineItem[] = [];

  for (const deal of deals) {
    const dealDeadlines = extractDeadlinesFromDeal(deal, maxDays, referenceDate);
    allDeadlines.push(...dealDeadlines);
  }

  // Sort by days remaining (most urgent first)
  return allDeadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
