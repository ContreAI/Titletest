import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useBillingStore } from '../store/billing.store';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  billingControllerGetInvoices: vi.fn(),
  billingControllerGetPaymentMethods: vi.fn(),
}));

describe('Billing Store', () => {
  const mockInvoice = {
    id: 'inv-123',
    amountDue: 9999,
    amountPaid: 9999,
    status: 'paid',
    createdAt: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-15T00:00:00Z',
    currency: 'USD',
    customerId: 'cus-123',
  };

  const mockPaymentMethod = {
    id: 'pm-123',
    type: 'card',
    cardBrand: 'visa',
    cardLast4: '4242',
    cardExpMonth: 12,
    cardExpYear: 2025,
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Reset store state
    useBillingStore.getState().reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useBillingStore.getState();
      expect(state.invoices).toEqual([]);
      expect(state.paymentMethods).toEqual([]);
      expect(state.pagination).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchInvoices', () => {
    it('should fetch and store invoices', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.billingControllerGetInvoices).mockResolvedValueOnce({
        data: [mockInvoice],
        pagination: { page: 1, limit: 10, total: 1 },
      } as any);

      await useBillingStore.getState().fetchInvoices();

      expect(apiClient.billingControllerGetInvoices).toHaveBeenCalled();
      expect(useBillingStore.getState().invoices).toHaveLength(1);
      expect(useBillingStore.getState().invoices[0].id).toBe('inv-123');
      expect(useBillingStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.billingControllerGetInvoices).mockReturnValueOnce(promise as any);

      const fetchPromise = useBillingStore.getState().fetchInvoices();

      expect(useBillingStore.getState().isLoading).toBe(true);

      resolvePromise!({ data: [], pagination: null });
      await fetchPromise;

      expect(useBillingStore.getState().isLoading).toBe(false);
    });

    it('should pass filter parameters to API', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.billingControllerGetInvoices).mockResolvedValueOnce({
        data: [],
        pagination: null,
      } as any);

      await useBillingStore.getState().fetchInvoices({
        page: 2,
        limit: 20,
        status: 'paid',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(apiClient.billingControllerGetInvoices).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        status: 'paid',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    });

    it('should handle empty response', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.billingControllerGetInvoices).mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      } as any);

      await useBillingStore.getState().fetchInvoices();

      expect(useBillingStore.getState().invoices).toEqual([]);
    });

    it('should store pagination info', async () => {
      const apiClient = await import('@contreai/api-client');
      const pagination = { page: 2, limit: 10, total: 25, totalPages: 3 };
      vi.mocked(apiClient.billingControllerGetInvoices).mockResolvedValueOnce({
        data: [mockInvoice],
        pagination,
      } as any);

      await useBillingStore.getState().fetchInvoices({ page: 2 });

      expect(useBillingStore.getState().pagination).toEqual(pagination);
    });

    it('should handle fetch errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.billingControllerGetInvoices).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(useBillingStore.getState().fetchInvoices()).rejects.toThrow('Network error');

      expect(useBillingStore.getState().isLoading).toBe(false);
      expect(useBillingStore.getState().error).toBe('Network error');
    });

    it('should clear error state before fetching', async () => {
      useBillingStore.setState({ error: 'Previous error' });

      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.billingControllerGetInvoices).mockResolvedValueOnce({
        data: [],
        pagination: null,
      } as any);

      await useBillingStore.getState().fetchInvoices();

      expect(useBillingStore.getState().error).toBeNull();
    });
  });

  describe('fetchPaymentMethods', () => {
    it('should fetch and store payment methods', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.billingControllerGetPaymentMethods).mockResolvedValueOnce([
        mockPaymentMethod,
      ] as any);

      await useBillingStore.getState().fetchPaymentMethods();

      expect(apiClient.billingControllerGetPaymentMethods).toHaveBeenCalled();
      expect(useBillingStore.getState().paymentMethods).toHaveLength(1);
      expect(useBillingStore.getState().paymentMethods[0].id).toBe('pm-123');
      expect(useBillingStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.billingControllerGetPaymentMethods).mockReturnValueOnce(promise as any);

      const fetchPromise = useBillingStore.getState().fetchPaymentMethods();

      expect(useBillingStore.getState().isLoading).toBe(true);

      resolvePromise!([]);
      await fetchPromise;

      expect(useBillingStore.getState().isLoading).toBe(false);
    });

    it('should handle empty payment methods', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.billingControllerGetPaymentMethods).mockResolvedValueOnce([] as any);

      await useBillingStore.getState().fetchPaymentMethods();

      expect(useBillingStore.getState().paymentMethods).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.billingControllerGetPaymentMethods).mockRejectedValueOnce(
        new Error('API error')
      );

      await expect(useBillingStore.getState().fetchPaymentMethods()).rejects.toThrow('API error');

      expect(useBillingStore.getState().isLoading).toBe(false);
      expect(useBillingStore.getState().error).toBe('API error');
    });

    it('should handle null response gracefully', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.billingControllerGetPaymentMethods).mockResolvedValueOnce(null as any);

      await useBillingStore.getState().fetchPaymentMethods();

      expect(useBillingStore.getState().paymentMethods).toEqual([]);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useBillingStore.setState({ error: 'Some error message' });

      useBillingStore.getState().clearError();

      expect(useBillingStore.getState().error).toBeNull();
    });

    it('should not affect other state', () => {
      useBillingStore.setState({
        error: 'Error',
        invoices: [mockInvoice as any],
        isLoading: true,
      });

      useBillingStore.getState().clearError();

      expect(useBillingStore.getState().invoices).toHaveLength(1);
      expect(useBillingStore.getState().isLoading).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useBillingStore.setState({
        invoices: [mockInvoice as any],
        paymentMethods: [mockPaymentMethod as any],
        pagination: { page: 2, limit: 10, total: 50 } as any,
        isLoading: true,
        error: 'Some error',
      });

      useBillingStore.getState().reset();

      const state = useBillingStore.getState();
      expect(state.invoices).toEqual([]);
      expect(state.paymentMethods).toEqual([]);
      expect(state.pagination).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
