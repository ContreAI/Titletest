import { describe, it, expect } from 'vitest';
import {
  calculateRiskCounts,
  getDealsWithRisks,
  filterDealsByRiskLevel,
} from '../risk-utils';
import type { DealWithReport } from '../../../hooks';

describe('risk-utils', () => {
  const createDeal = (
    id: string,
    name: string,
    riskCounts: { high?: number; medium?: number; low?: number }
  ): DealWithReport => ({
    transaction: {
      id,
      transactionName: name,
      representing: 'buyer',
      propertyAddress: {
        streetAddress: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'United States',
      },
      propertyType: 'single_family',
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      createdBy: 'user-1',
    },
    report: {
      id: `report-${id}`,
      transactionId: id,
      userId: 'user-1',
      status: 'Active',
      data: {
        high_risk_count: riskCounts.high || 0,
        medium_risk_count: riskCounts.medium || 0,
        low_risk_count: riskCounts.low || 0,
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  });

  describe('calculateRiskCounts', () => {
    it('should return zeros for empty deals array', () => {
      const result = calculateRiskCounts([]);
      expect(result).toEqual({ high: 0, medium: 0, low: 0, total: 0 });
    });

    it('should return zeros for deals without reports', () => {
      const deals: DealWithReport[] = [
        {
          transaction: {
            id: 'txn-1',
            transactionName: 'Test',
            representing: 'buyer',
            propertyAddress: { streetAddress: '', city: '', state: '', zipCode: '', country: '' },
            propertyType: 'single_family',
            status: 'active',
            createdAt: '',
            updatedAt: '',
            createdBy: '',
          },
          report: null,
        },
      ];
      const result = calculateRiskCounts(deals);
      expect(result).toEqual({ high: 0, medium: 0, low: 0, total: 0 });
    });

    it('should aggregate risk counts from single deal', () => {
      const deals = [createDeal('txn-1', 'Deal 1', { high: 2, medium: 3, low: 5 })];
      const result = calculateRiskCounts(deals);

      expect(result.high).toBe(2);
      expect(result.medium).toBe(3);
      expect(result.low).toBe(5);
      expect(result.total).toBe(10);
    });

    it('should aggregate risk counts from multiple deals', () => {
      const deals = [
        createDeal('txn-1', 'Deal 1', { high: 2, medium: 1, low: 3 }),
        createDeal('txn-2', 'Deal 2', { high: 1, medium: 4, low: 2 }),
        createDeal('txn-3', 'Deal 3', { high: 0, medium: 2, low: 1 }),
      ];
      const result = calculateRiskCounts(deals);

      expect(result.high).toBe(3); // 2 + 1 + 0
      expect(result.medium).toBe(7); // 1 + 4 + 2
      expect(result.low).toBe(6); // 3 + 2 + 1
      expect(result.total).toBe(16);
    });

    it('should handle undefined risk counts as zero', () => {
      const deal: DealWithReport = {
        transaction: {
          id: 'txn-1',
          transactionName: 'Test',
          representing: 'buyer',
          propertyAddress: { streetAddress: '', city: '', state: '', zipCode: '', country: '' },
          propertyType: 'single_family',
          status: 'active',
          createdAt: '',
          updatedAt: '',
          createdBy: '',
        },
        report: {
          id: 'r1',
          transactionId: 'txn-1',
          userId: 'u1',
          status: 'Active',
          data: {}, // No risk counts
          createdAt: '',
          updatedAt: '',
        },
      };
      const result = calculateRiskCounts([deal]);
      expect(result).toEqual({ high: 0, medium: 0, low: 0, total: 0 });
    });
  });

  describe('getDealsWithRisks', () => {
    it('should return empty array for empty deals', () => {
      expect(getDealsWithRisks([])).toEqual([]);
    });

    it('should exclude deals with no risks', () => {
      const deals = [createDeal('txn-1', 'Deal 1', { high: 0, medium: 0, low: 0 })];
      const result = getDealsWithRisks(deals);
      expect(result).toHaveLength(0);
    });

    it('should include deals with any risk', () => {
      const deals = [
        createDeal('txn-1', 'Deal 1', { high: 0, medium: 0, low: 1 }), // Only low risk
        createDeal('txn-2', 'Deal 2', { high: 0, medium: 1, low: 0 }), // Only medium risk
        createDeal('txn-3', 'Deal 3', { high: 1, medium: 0, low: 0 }), // Only high risk
      ];
      const result = getDealsWithRisks(deals);
      expect(result).toHaveLength(3);
    });

    it('should set correct dominant risk level', () => {
      const deals = [
        createDeal('txn-1', 'High Risk Deal', { high: 1, medium: 5, low: 10 }),
        createDeal('txn-2', 'Medium Risk Deal', { high: 0, medium: 3, low: 10 }),
        createDeal('txn-3', 'Low Risk Deal', { high: 0, medium: 0, low: 5 }),
      ];
      const result = getDealsWithRisks(deals);

      // Find deals by name
      const highRiskDeal = result.find((d) => d.dealName === 'High Risk Deal');
      const mediumRiskDeal = result.find((d) => d.dealName === 'Medium Risk Deal');
      const lowRiskDeal = result.find((d) => d.dealName === 'Low Risk Deal');

      expect(highRiskDeal?.dominantRisk).toBe('high');
      expect(mediumRiskDeal?.dominantRisk).toBe('medium');
      expect(lowRiskDeal?.dominantRisk).toBe('low');
    });

    it('should sort deals by high risk count first', () => {
      const deals = [
        createDeal('txn-1', 'Deal A', { high: 1, medium: 10, low: 10 }),
        createDeal('txn-2', 'Deal B', { high: 3, medium: 1, low: 1 }),
        createDeal('txn-3', 'Deal C', { high: 2, medium: 5, low: 5 }),
      ];
      const result = getDealsWithRisks(deals);

      expect(result[0].dealName).toBe('Deal B'); // 3 high
      expect(result[1].dealName).toBe('Deal C'); // 2 high
      expect(result[2].dealName).toBe('Deal A'); // 1 high
    });

    it('should sort by medium risk count when high risk is equal', () => {
      const deals = [
        createDeal('txn-1', 'Deal A', { high: 1, medium: 2, low: 10 }),
        createDeal('txn-2', 'Deal B', { high: 1, medium: 5, low: 1 }),
        createDeal('txn-3', 'Deal C', { high: 1, medium: 3, low: 5 }),
      ];
      const result = getDealsWithRisks(deals);

      expect(result[0].dealName).toBe('Deal B'); // 5 medium
      expect(result[1].dealName).toBe('Deal C'); // 3 medium
      expect(result[2].dealName).toBe('Deal A'); // 2 medium
    });

    it('should sort by total risk when high and medium are equal', () => {
      const deals = [
        createDeal('txn-1', 'Deal A', { high: 1, medium: 2, low: 3 }),
        createDeal('txn-2', 'Deal B', { high: 1, medium: 2, low: 10 }),
        createDeal('txn-3', 'Deal C', { high: 1, medium: 2, low: 5 }),
      ];
      const result = getDealsWithRisks(deals);

      expect(result[0].totalRiskCount).toBe(13); // Deal B
      expect(result[1].totalRiskCount).toBe(8); // Deal C
      expect(result[2].totalRiskCount).toBe(6); // Deal A
    });

    it('should use transaction name as deal name', () => {
      const deals = [createDeal('txn-1', 'My Custom Deal Name', { high: 1 })];
      const result = getDealsWithRisks(deals);
      expect(result[0].dealName).toBe('My Custom Deal Name');
    });

    it('should fallback to street address when transaction name is empty', () => {
      const deal: DealWithReport = {
        transaction: {
          id: 'txn-1',
          transactionName: '',
          representing: 'buyer',
          propertyAddress: {
            streetAddress: '789 Elm Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'United States',
          },
          propertyType: 'single_family',
          status: 'active',
          createdAt: '',
          updatedAt: '',
          createdBy: '',
        },
        report: {
          id: 'r1',
          transactionId: 'txn-1',
          userId: 'u1',
          status: 'Active',
          data: { high_risk_count: 1 },
          createdAt: '',
          updatedAt: '',
        },
      };
      const result = getDealsWithRisks([deal]);
      expect(result[0].dealName).toBe('789 Elm Street');
    });
  });

  describe('filterDealsByRiskLevel', () => {
    const riskyDeals = [
      {
        transactionId: 'txn-1',
        dealName: 'High Only',
        highRiskCount: 2,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        totalRiskCount: 2,
        dominantRisk: 'high' as const,
      },
      {
        transactionId: 'txn-2',
        dealName: 'Medium Only',
        highRiskCount: 0,
        mediumRiskCount: 3,
        lowRiskCount: 0,
        totalRiskCount: 3,
        dominantRisk: 'medium' as const,
      },
      {
        transactionId: 'txn-3',
        dealName: 'Low Only',
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 5,
        totalRiskCount: 5,
        dominantRisk: 'low' as const,
      },
      {
        transactionId: 'txn-4',
        dealName: 'All Risks',
        highRiskCount: 1,
        mediumRiskCount: 2,
        lowRiskCount: 3,
        totalRiskCount: 6,
        dominantRisk: 'high' as const,
      },
    ];

    it('should filter by high risk level', () => {
      const result = filterDealsByRiskLevel(riskyDeals, 'high');
      expect(result).toHaveLength(2);
      expect(result.map((d) => d.dealName)).toContain('High Only');
      expect(result.map((d) => d.dealName)).toContain('All Risks');
    });

    it('should filter by medium risk level', () => {
      const result = filterDealsByRiskLevel(riskyDeals, 'medium');
      expect(result).toHaveLength(2);
      expect(result.map((d) => d.dealName)).toContain('Medium Only');
      expect(result.map((d) => d.dealName)).toContain('All Risks');
    });

    it('should filter by low risk level', () => {
      const result = filterDealsByRiskLevel(riskyDeals, 'low');
      expect(result).toHaveLength(2);
      expect(result.map((d) => d.dealName)).toContain('Low Only');
      expect(result.map((d) => d.dealName)).toContain('All Risks');
    });

    it('should return empty array for empty input', () => {
      expect(filterDealsByRiskLevel([], 'high')).toEqual([]);
    });
  });
});
