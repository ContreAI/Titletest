import type { DealWithReport } from '../../hooks';
import type { FormattedUsage } from 'modules/subscription/typings/subscription.types';

export interface HeaderStat {
  label: string;
  count: number;
}

/**
 * Calculate errors detected from transaction reports' high risk items
 */
export function calculateErrorsDetected(dealsWithReports: DealWithReport[]): number {
  return dealsWithReports.reduce((sum, { report }) => {
    return sum + (report?.data?.high_risk_count || 0);
  }, 0);
}

/**
 * Calculate header stats from real data sources
 * - Errors Detected: sum of high_risk_count from all transaction reports
 * - Brokerage Time Saved: 60% of total time saved hours
 * - Agent Time Saved: 40% of total time saved hours
 */
export function calculateHeaderStats(
  dealsWithReports: DealWithReport[],
  formattedUsage: FormattedUsage
): HeaderStat[] {
  const errorsDetected = calculateErrorsDetected(dealsWithReports);
  const timeSavedHours = formattedUsage.timeSaved.value;

  // Split time saved: 60% brokerage, 40% agent (approximation)
  const brokerageTimeSaved = Math.round(timeSavedHours * 0.6);
  const agentTimeSaved = Math.round(timeSavedHours * 0.4);

  return [
    { label: 'Errors Detected', count: errorsDetected },
    { label: 'Brokerage Time Saved', count: brokerageTimeSaved },
    { label: 'Agent Time Saved', count: agentTimeSaved },
  ];
}
