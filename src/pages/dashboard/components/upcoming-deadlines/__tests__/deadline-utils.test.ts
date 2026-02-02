import { describe, it, expect } from 'vitest';
import {
  parseDeadlineDate,
  calculateDaysRemaining,
  getUrgencyLevel,
  extractDeadlinesFromDeal,
  getUpcomingDeadlines,
} from '../deadline-utils';
import type { DealWithReport } from '../../../hooks';

describe('deadline-utils', () => {
  describe('parseDeadlineDate', () => {
    it('should return null for null/undefined input', () => {
      expect(parseDeadlineDate(null)).toBeNull();
      expect(parseDeadlineDate(undefined)).toBeNull();
      expect(parseDeadlineDate('')).toBeNull();
    });

    it('should parse ISO date strings', () => {
      const result = parseDeadlineDate('2024-06-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      // Note: ISO date strings without time are parsed as UTC, so we use UTC methods
      expect(result?.getUTCMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(result?.getUTCDate()).toBe(15);
    });

    it('should parse ISO datetime strings', () => {
      const result = parseDeadlineDate('2024-06-15T10:30:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should parse MM/DD/YYYY format', () => {
      const result = parseDeadlineDate('06/15/2024');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(5); // June
      expect(result?.getDate()).toBe(15);
    });

    it('should parse M/D/YYYY format (single digit month/day)', () => {
      const result = parseDeadlineDate('6/5/2024');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getMonth()).toBe(5); // June
      expect(result?.getDate()).toBe(5);
    });

    it('should return null for invalid date strings', () => {
      expect(parseDeadlineDate('invalid')).toBeNull();
      expect(parseDeadlineDate('not-a-date')).toBeNull();
    });
  });

  describe('calculateDaysRemaining', () => {
    it('should return 0 for today', () => {
      const today = new Date();
      expect(calculateDaysRemaining(today, today)).toBe(0);
    });

    it('should return 1 for tomorrow', () => {
      const today = new Date('2024-06-15');
      const tomorrow = new Date('2024-06-16');
      expect(calculateDaysRemaining(tomorrow, today)).toBe(1);
    });

    it('should return negative for past dates', () => {
      const today = new Date('2024-06-15');
      const yesterday = new Date('2024-06-14');
      expect(calculateDaysRemaining(yesterday, today)).toBe(-1);
    });

    it('should return correct days for future dates', () => {
      const today = new Date('2024-06-15');
      const futureDate = new Date('2024-06-22');
      expect(calculateDaysRemaining(futureDate, today)).toBe(7);
    });

    it('should ignore time component', () => {
      const today = new Date('2024-06-15T23:59:59');
      const tomorrow = new Date('2024-06-16T00:00:01');
      expect(calculateDaysRemaining(tomorrow, today)).toBe(1);
    });
  });

  describe('getUrgencyLevel', () => {
    it('should return critical for 0-2 days', () => {
      expect(getUrgencyLevel(0)).toBe('critical');
      expect(getUrgencyLevel(1)).toBe('critical');
      expect(getUrgencyLevel(2)).toBe('critical');
    });

    it('should return warning for 3-5 days', () => {
      expect(getUrgencyLevel(3)).toBe('warning');
      expect(getUrgencyLevel(4)).toBe('warning');
      expect(getUrgencyLevel(5)).toBe('warning');
    });

    it('should return normal for 6+ days', () => {
      expect(getUrgencyLevel(6)).toBe('normal');
      expect(getUrgencyLevel(7)).toBe('normal');
      expect(getUrgencyLevel(30)).toBe('normal');
    });
  });

  describe('extractDeadlinesFromDeal', () => {
    const referenceDate = new Date('2024-06-15');

    const createDeal = (reportData: Record<string, string | number | null>): DealWithReport => ({
      transaction: {
        id: 'txn-123',
        transactionName: 'Test Deal',
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
        id: 'report-123',
        transactionId: 'txn-123',
        userId: 'user-1',
        status: 'Active',
        data: reportData as any,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    });

    it('should return empty array if no report', () => {
      const deal: DealWithReport = {
        transaction: {
          id: 'txn-123',
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
      };
      expect(extractDeadlinesFromDeal(deal, 7, referenceDate)).toEqual([]);
    });

    it('should extract inspection deadline', () => {
      const deal = createDeal({ inspection_deadline: '2024-06-18' }); // 3 days away
      const deadlines = extractDeadlinesFromDeal(deal, 7, referenceDate);

      expect(deadlines).toHaveLength(1);
      expect(deadlines[0].deadlineType).toBe('inspection');
      expect(deadlines[0].daysRemaining).toBe(3);
    });

    it('should extract financing deadline', () => {
      const deal = createDeal({ financing_deadline: '2024-06-20' }); // 5 days away
      const deadlines = extractDeadlinesFromDeal(deal, 7, referenceDate);

      expect(deadlines).toHaveLength(1);
      expect(deadlines[0].deadlineType).toBe('financing');
      expect(deadlines[0].daysRemaining).toBe(5);
    });

    it('should extract closing date', () => {
      const deal = createDeal({ closing_date: '2024-06-22' }); // 7 days away
      const deadlines = extractDeadlinesFromDeal(deal, 7, referenceDate);

      expect(deadlines).toHaveLength(1);
      expect(deadlines[0].deadlineType).toBe('closing');
      expect(deadlines[0].daysRemaining).toBe(7);
    });

    it('should extract multiple deadlines from same deal', () => {
      const deal = createDeal({
        inspection_deadline: '2024-06-16', // 1 day away
        financing_deadline: '2024-06-18', // 3 days away
        closing_date: '2024-06-20', // 5 days away
      });
      const deadlines = extractDeadlinesFromDeal(deal, 7, referenceDate);

      expect(deadlines).toHaveLength(3);
    });

    it('should exclude past deadlines', () => {
      const deal = createDeal({ inspection_deadline: '2024-06-14' }); // Yesterday
      const deadlines = extractDeadlinesFromDeal(deal, 7, referenceDate);

      expect(deadlines).toHaveLength(0);
    });

    it('should exclude deadlines beyond maxDays', () => {
      const deal = createDeal({ closing_date: '2024-06-30' }); // 15 days away
      const deadlines = extractDeadlinesFromDeal(deal, 7, referenceDate);

      expect(deadlines).toHaveLength(0);
    });

    it('should include deadlines on current day', () => {
      const deal = createDeal({ inspection_deadline: '2024-06-15' }); // Today
      const deadlines = extractDeadlinesFromDeal(deal, 7, referenceDate);

      expect(deadlines).toHaveLength(1);
      expect(deadlines[0].daysRemaining).toBe(0);
    });

    it('should use transaction name as deal name', () => {
      const deal = createDeal({ inspection_deadline: '2024-06-18' });
      const deadlines = extractDeadlinesFromDeal(deal, 7, referenceDate);

      expect(deadlines[0].dealName).toBe('Test Deal');
    });

    it('should fallback to street address if no transaction name', () => {
      const deal: DealWithReport = {
        transaction: {
          id: 'txn-123',
          transactionName: '',
          representing: 'buyer',
          propertyAddress: {
            streetAddress: '456 Oak Ave',
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
          transactionId: 'txn-123',
          userId: 'u1',
          status: 'Active',
          data: { inspection_deadline: '2024-06-18' },
          createdAt: '',
          updatedAt: '',
        },
      };
      const deadlines = extractDeadlinesFromDeal(deal, 7, referenceDate);

      expect(deadlines[0].dealName).toBe('456 Oak Ave');
    });
  });

  describe('getUpcomingDeadlines', () => {
    const referenceDate = new Date('2024-06-15');

    it('should return empty array for empty deals', () => {
      expect(getUpcomingDeadlines([], 7, referenceDate)).toEqual([]);
    });

    it('should aggregate deadlines from multiple deals', () => {
      const deals: DealWithReport[] = [
        {
          transaction: {
            id: 'txn-1',
            transactionName: 'Deal 1',
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
            data: { inspection_deadline: '2024-06-18' },
            createdAt: '',
            updatedAt: '',
          },
        },
        {
          transaction: {
            id: 'txn-2',
            transactionName: 'Deal 2',
            representing: 'seller',
            propertyAddress: { streetAddress: '', city: '', state: '', zipCode: '', country: '' },
            propertyType: 'condo',
            status: 'active',
            createdAt: '',
            updatedAt: '',
            createdBy: '',
          },
          report: {
            id: 'r2',
            transactionId: 'txn-2',
            userId: 'u1',
            status: 'Active',
            data: { closing_date: '2024-06-20' },
            createdAt: '',
            updatedAt: '',
          },
        },
      ];

      const deadlines = getUpcomingDeadlines(deals, 7, referenceDate);
      expect(deadlines).toHaveLength(2);
    });

    it('should sort deadlines by urgency (most urgent first)', () => {
      const deals: DealWithReport[] = [
        {
          transaction: {
            id: 'txn-1',
            transactionName: 'Deal 1',
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
            data: { closing_date: '2024-06-22' }, // 7 days away (least urgent)
            createdAt: '',
            updatedAt: '',
          },
        },
        {
          transaction: {
            id: 'txn-2',
            transactionName: 'Deal 2',
            representing: 'seller',
            propertyAddress: { streetAddress: '', city: '', state: '', zipCode: '', country: '' },
            propertyType: 'condo',
            status: 'active',
            createdAt: '',
            updatedAt: '',
            createdBy: '',
          },
          report: {
            id: 'r2',
            transactionId: 'txn-2',
            userId: 'u1',
            status: 'Active',
            data: { inspection_deadline: '2024-06-16' }, // 1 day away (most urgent)
            createdAt: '',
            updatedAt: '',
          },
        },
      ];

      const deadlines = getUpcomingDeadlines(deals, 7, referenceDate);

      expect(deadlines[0].daysRemaining).toBe(1); // Most urgent first
      expect(deadlines[1].daysRemaining).toBe(7); // Least urgent last
    });
  });
});
