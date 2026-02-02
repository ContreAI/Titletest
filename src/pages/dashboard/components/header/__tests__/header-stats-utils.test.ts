import { describe, it, expect } from 'vitest';
import { calculateErrorsDetected, calculateHeaderStats } from '../header-stats-utils';
import type { DealWithReport } from '../../../hooks';
import type { FormattedUsage } from 'modules/subscription/typings/subscription.types';

const createDeal = (
  id: string,
  riskCounts: { high?: number; medium?: number; low?: number }
): DealWithReport => ({
  transaction: {
    id,
    transactionName: `Deal ${id}`,
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

const createDealWithoutReport = (id: string): DealWithReport => ({
  transaction: {
    id,
    transactionName: `Deal ${id}`,
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
  report: null,
});

const createFormattedUsage = (timeSavedValue: number): FormattedUsage => ({
  documentsAnalyzed: { value: 10, max: 100 },
  timeSaved: { value: timeSavedValue, max: 100 },
  criticalErrors: { value: 5, max: 50 },
});

describe('header-stats-utils', () => {
  describe('calculateErrorsDetected', () => {
    it('should return 0 for empty deals array', () => {
      expect(calculateErrorsDetected([])).toBe(0);
    });

    it('should return 0 for deals without reports', () => {
      const deals = [createDealWithoutReport('txn-1'), createDealWithoutReport('txn-2')];
      expect(calculateErrorsDetected(deals)).toBe(0);
    });

    it('should sum high_risk_count from single deal', () => {
      const deals = [createDeal('txn-1', { high: 5, medium: 3, low: 1 })];
      expect(calculateErrorsDetected(deals)).toBe(5);
    });

    it('should sum high_risk_count from multiple deals', () => {
      const deals = [
        createDeal('txn-1', { high: 2 }),
        createDeal('txn-2', { high: 3 }),
        createDeal('txn-3', { high: 1 }),
      ];
      expect(calculateErrorsDetected(deals)).toBe(6);
    });

    it('should handle mixed deals with and without reports', () => {
      const deals = [
        createDeal('txn-1', { high: 4 }),
        createDealWithoutReport('txn-2'),
        createDeal('txn-3', { high: 2 }),
      ];
      expect(calculateErrorsDetected(deals)).toBe(6);
    });

    it('should handle deals with undefined high_risk_count', () => {
      const deal: DealWithReport = {
        transaction: {
          id: 'txn-1',
          transactionName: 'Test',
          representing: 'buyer',
          propertyAddress: {
            streetAddress: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
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
          data: {}, // No risk counts defined
          createdAt: '',
          updatedAt: '',
        },
      };
      expect(calculateErrorsDetected([deal])).toBe(0);
    });
  });

  describe('calculateHeaderStats', () => {
    it('should return correct labels', () => {
      const stats = calculateHeaderStats([], createFormattedUsage(0));
      expect(stats).toHaveLength(3);
      expect(stats[0].label).toBe('Errors Detected');
      expect(stats[1].label).toBe('Brokerage Time Saved');
      expect(stats[2].label).toBe('Agent Time Saved');
    });

    it('should calculate errors from deals', () => {
      const deals = [createDeal('txn-1', { high: 3 }), createDeal('txn-2', { high: 2 })];
      const stats = calculateHeaderStats(deals, createFormattedUsage(0));
      expect(stats[0].count).toBe(5);
    });

    it('should split time saved 60/40 between brokerage and agent', () => {
      const stats = calculateHeaderStats([], createFormattedUsage(100));
      expect(stats[1].count).toBe(60); // Brokerage: 60%
      expect(stats[2].count).toBe(40); // Agent: 40%
    });

    it('should round time saved values', () => {
      const stats = calculateHeaderStats([], createFormattedUsage(7));
      // 7 * 0.6 = 4.2 -> rounds to 4
      // 7 * 0.4 = 2.8 -> rounds to 3
      expect(stats[1].count).toBe(4);
      expect(stats[2].count).toBe(3);
    });

    it('should handle zero time saved', () => {
      const stats = calculateHeaderStats([], createFormattedUsage(0));
      expect(stats[1].count).toBe(0);
      expect(stats[2].count).toBe(0);
    });

    it('should handle combined scenario with deals and time saved', () => {
      const deals = [
        createDeal('txn-1', { high: 10 }),
        createDeal('txn-2', { high: 5 }),
        createDealWithoutReport('txn-3'),
      ];
      const stats = calculateHeaderStats(deals, createFormattedUsage(50));

      expect(stats[0].count).toBe(15); // Errors: 10 + 5
      expect(stats[1].count).toBe(30); // Brokerage: 50 * 0.6
      expect(stats[2].count).toBe(20); // Agent: 50 * 0.4
    });
  });
});
