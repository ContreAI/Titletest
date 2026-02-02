import { useMemo } from 'react';
import type { Deal } from 'types/deals';
import type { TransactionReport } from 'modules/transaction-reports';

interface StatsData {
  hoursSaved: string;
  hoursSubtitle: string;
  projectedCommission: string;
  commissionSubtitle: string;
  closingSoonCount: number;
  closingSoonSubtitle: string;
}

/**
 * useStatsData - Calculate stats from deals for the stats banner
 *
 * Stats:
 * 1. Hours Saved: Estimated time saved based on documents processed
 * 2. Projected Commission: Sum from transaction reports (if available) or $0
 * 3. Closing Soon: Count of deals closing within 30 days
 */
export const useStatsData = (
  deals: Deal[],
  documentsProcessed: number = 0,
  transactionReports?: Map<string, TransactionReport>
): StatsData => {
  return useMemo(() => {
    // 1. Hours Saved (yearly): ~15 minutes per document processed
    // For yearly estimate, multiply current documents by 12 (assuming consistent volume)
    const minutesSavedYearly = documentsProcessed * 15 * 12;
    const hoursSavedYearly = Math.round(minutesSavedYearly / 60);
    const hoursDisplay = hoursSavedYearly > 0 ? `~${hoursSavedYearly} hours` : '0 hours';

    // 2. Projected Commission: Get from transaction reports if available
    // Commission data is not yet extracted from documents, so show $0 until it's available
    let totalCommission = 0;
    
    if (transactionReports && transactionReports.size > 0) {
      // TODO: When commission extraction is implemented, calculate from report data
      // For now, commission data is not available in reports, so we show $0
      totalCommission = 0;
    }
    
    const commissionDisplay =
      totalCommission > 0
        ? `$${Math.round(totalCommission).toLocaleString()}`
        : '$0';

    // 3. Closing Soon: Count deals closing within 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const closingSoonDeals = deals.filter((deal) => {
      if (!deal.closingDate || deal.closingDate === 'TBD') return false;
      const closingDate = new Date(deal.closingDate);
      return closingDate >= now && closingDate <= thirtyDaysFromNow;
    });

    // Find the nearest closing date for subtitle
    let closingSoonSubtitle = 'in next 30 days';
    if (closingSoonDeals.length > 0) {
      const sortedByDate = [...closingSoonDeals].sort((a, b) => {
        const dateA = new Date(a.closingDate);
        const dateB = new Date(b.closingDate);
        return dateA.getTime() - dateB.getTime();
      });
      const nearestClosing = new Date(sortedByDate[0].closingDate);
      const daysUntilClosing = Math.ceil(
        (nearestClosing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilClosing === 1) {
        closingSoonSubtitle = 'next closes tomorrow';
      } else if (daysUntilClosing <= 7) {
        closingSoonSubtitle = `next closes in ${daysUntilClosing} days`;
      }
    }

    return {
      hoursSaved: hoursDisplay,
      hoursSubtitle: 'this year',
      projectedCommission: commissionDisplay,
      commissionSubtitle: 'incoming',
      closingSoonCount: closingSoonDeals.length,
      closingSoonSubtitle,
    };
  }, [deals, documentsProcessed, transactionReports]);
};

export default useStatsData;

