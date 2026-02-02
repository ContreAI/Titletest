import type { DealWithReport } from '../../hooks';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskCounts {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface RiskDeal {
  transactionId: string;
  dealName: string;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalRiskCount: number;
  dominantRisk: RiskLevel;
}

/**
 * Calculate aggregate risk counts from all active deals.
 */
export function calculateRiskCounts(deals: DealWithReport[]): RiskCounts {
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const { report } of deals) {
    if (report?.data) {
      high += report.data.high_risk_count || 0;
      medium += report.data.medium_risk_count || 0;
      low += report.data.low_risk_count || 0;
    }
  }

  return { high, medium, low, total: high + medium + low };
}

/**
 * Get deals with risks, sorted by severity.
 */
export function getDealsWithRisks(deals: DealWithReport[]): RiskDeal[] {
  const riskyDeals: RiskDeal[] = [];

  for (const { transaction, report } of deals) {
    if (!report?.data) continue;

    const highRiskCount = report.data.high_risk_count || 0;
    const mediumRiskCount = report.data.medium_risk_count || 0;
    const lowRiskCount = report.data.low_risk_count || 0;
    const totalRiskCount = highRiskCount + mediumRiskCount + lowRiskCount;

    if (totalRiskCount > 0) {
      // Determine dominant risk level
      let dominantRisk: RiskLevel = 'low';
      if (highRiskCount > 0) dominantRisk = 'high';
      else if (mediumRiskCount > 0) dominantRisk = 'medium';

      riskyDeals.push({
        transactionId: transaction.id,
        dealName: transaction.transactionName || transaction.propertyAddress?.streetAddress || 'Unnamed Deal',
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        totalRiskCount,
        dominantRisk,
      });
    }
  }

  // Sort by severity: high risk first, then medium, then low
  return riskyDeals.sort((a, b) => {
    // First by high risk count
    if (b.highRiskCount !== a.highRiskCount) {
      return b.highRiskCount - a.highRiskCount;
    }
    // Then by medium risk count
    if (b.mediumRiskCount !== a.mediumRiskCount) {
      return b.mediumRiskCount - a.mediumRiskCount;
    }
    // Then by total
    return b.totalRiskCount - a.totalRiskCount;
  });
}

/**
 * Filter deals by risk level.
 */
export function filterDealsByRiskLevel(deals: RiskDeal[], level: RiskLevel): RiskDeal[] {
  return deals.filter((deal) => {
    switch (level) {
      case 'high':
        return deal.highRiskCount > 0;
      case 'medium':
        return deal.mediumRiskCount > 0;
      case 'low':
        return deal.lowRiskCount > 0;
      default:
        return false;
    }
  });
}
