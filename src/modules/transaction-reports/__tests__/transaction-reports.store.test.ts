import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTransactionReportsStore } from '../store/transaction-reports.store';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  transactionReportControllerGetTransactionReport: vi.fn(),
}));

describe('Transaction Reports Store', () => {
  const mockReport = {
    id: 'report-1',
    transactionId: 'txn-123',
    userId: 'user-1',
    status: 'completed',
    dealData: [
      { field: 'price', value: '$500,000' },
      { field: 'closingDate', value: '2024-06-01' },
    ],
    model: 'gpt-4',
    tokensUsed: 1500,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Reset store state
    useTransactionReportsStore.setState({
      currentTransactionReport: null,
      transactionReports: new Map(),
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTransactionReportsStore.getState();
      expect(state.currentTransactionReport).toBeNull();
      expect(state.transactionReports.size).toBe(0);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setCurrentTransactionReport', () => {
    it('should set current transaction report', () => {
      const report = { id: 'report-1', transactionId: 'txn-1' } as any;
      useTransactionReportsStore.getState().setCurrentTransactionReport(report);
      expect(useTransactionReportsStore.getState().currentTransactionReport).toEqual(report);
    });

    it('should allow setting to null', () => {
      useTransactionReportsStore.setState({ currentTransactionReport: { id: 'r1' } as any });
      useTransactionReportsStore.getState().setCurrentTransactionReport(null);
      expect(useTransactionReportsStore.getState().currentTransactionReport).toBeNull();
    });
  });

  describe('setTransactionReport', () => {
    it('should add report to map', () => {
      const report = { id: 'report-1', transactionId: 'txn-1' } as any;
      useTransactionReportsStore.getState().setTransactionReport('txn-1', report);
      expect(useTransactionReportsStore.getState().transactionReports.get('txn-1')).toEqual(report);
    });

    it('should remove report when null', () => {
      const reports = new Map([['txn-1', { id: 'r1' } as any]]);
      useTransactionReportsStore.setState({ transactionReports: reports });

      useTransactionReportsStore.getState().setTransactionReport('txn-1', null);
      expect(useTransactionReportsStore.getState().transactionReports.has('txn-1')).toBe(false);
    });
  });

  describe('getTransactionReport', () => {
    it('should return report from map', () => {
      const report = { id: 'report-1' } as any;
      const reports = new Map([['txn-1', report]]);
      useTransactionReportsStore.setState({ transactionReports: reports });

      const result = useTransactionReportsStore.getState().getTransactionReport('txn-1');
      expect(result).toEqual(report);
    });

    it('should return null for non-existent report', () => {
      const result = useTransactionReportsStore.getState().getTransactionReport('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('fetchTransactionReport', () => {
    it('should fetch and store transaction report', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionReportControllerGetTransactionReport).mockResolvedValueOnce(
        mockReport as any
      );

      const result = await useTransactionReportsStore.getState().fetchTransactionReport('txn-123');

      expect(apiClient.transactionReportControllerGetTransactionReport).toHaveBeenCalledWith('txn-123');
      expect(result).not.toBeNull();
      expect(result?.transactionId).toBe('txn-123');
      expect(useTransactionReportsStore.getState().currentTransactionReport).not.toBeNull();
      expect(useTransactionReportsStore.getState().transactionReports.has('txn-123')).toBe(true);
    });

    it('should return cached report without API call', async () => {
      const apiClient = await import('@contreai/api-client');
      const cachedReport = { id: 'cached', transactionId: 'txn-123' } as any;
      const reports = new Map([['txn-123', cachedReport]]);
      useTransactionReportsStore.setState({ transactionReports: reports });

      const result = await useTransactionReportsStore.getState().fetchTransactionReport('txn-123');

      expect(apiClient.transactionReportControllerGetTransactionReport).not.toHaveBeenCalled();
      expect(result).toEqual(cachedReport);
    });

    it('should handle 404 errors gracefully', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionReportControllerGetTransactionReport).mockRejectedValueOnce({
        status: 404,
      });

      const result = await useTransactionReportsStore.getState().fetchTransactionReport('non-existent');

      expect(result).toBeNull();
      expect(useTransactionReportsStore.getState().currentTransactionReport).toBeNull();
    });

    it('should handle other errors gracefully', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionReportControllerGetTransactionReport).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await useTransactionReportsStore.getState().fetchTransactionReport('txn-error');

      expect(result).toBeNull();
      expect(useTransactionReportsStore.getState().isLoading).toBe(false);
    });

    it('should convert deal_data array to data object', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionReportControllerGetTransactionReport).mockResolvedValueOnce(
        mockReport as any
      );

      const result = await useTransactionReportsStore.getState().fetchTransactionReport('txn-123');

      expect(result?.data).toEqual({
        price: '$500,000',
        closingDate: '2024-06-01',
      });
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.transactionReportControllerGetTransactionReport).mockReturnValueOnce(
        promise as any
      );

      const fetchPromise = useTransactionReportsStore.getState().fetchTransactionReport('txn-123');
      expect(useTransactionReportsStore.getState().isLoading).toBe(true);

      resolvePromise!(mockReport);
      await fetchPromise;
      expect(useTransactionReportsStore.getState().isLoading).toBe(false);
    });

    it('should handle null response', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionReportControllerGetTransactionReport).mockResolvedValueOnce(
        null as any
      );

      const result = await useTransactionReportsStore.getState().fetchTransactionReport('txn-null');

      expect(result).toBeNull();
      expect(useTransactionReportsStore.getState().currentTransactionReport).toBeNull();
    });
  });

  describe('clearCurrentTransactionReport', () => {
    it('should clear current transaction report', () => {
      useTransactionReportsStore.setState({ currentTransactionReport: { id: 'r1' } as any });
      useTransactionReportsStore.getState().clearCurrentTransactionReport();
      expect(useTransactionReportsStore.getState().currentTransactionReport).toBeNull();
    });
  });
});
