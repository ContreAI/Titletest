import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useSubscriptionStore } from '../store/subscription.store';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  subscriptionControllerGetCurrentSubscription: vi.fn(),
  subscriptionControllerGetAvailablePlans: vi.fn(),
}));

describe('Subscription Store', () => {
  const mockSubscription = {
    id: 'sub-1',
    planName: 'Pro',
    status: 'active',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-02-01T00:00:00Z',
    usage: {
      documentsProcessed: 50,
      documentsLimit: 100,
    },
  };

  const mockPlans = [
    { id: 'plan-free', name: 'Free', price: 0, features: ['Basic features'] },
    { id: 'plan-pro', name: 'Pro', price: 29, features: ['All features'] },
  ];

  beforeEach(() => {
    useSubscriptionStore.getState().reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useSubscriptionStore.getState();
      expect(state.subscription).toBeNull();
      expect(state.availablePlans).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchSubscription', () => {
    it('should fetch and store subscription', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.subscriptionControllerGetCurrentSubscription).mockResolvedValueOnce(
        mockSubscription as any
      );

      await useSubscriptionStore.getState().fetchSubscription();

      expect(apiClient.subscriptionControllerGetCurrentSubscription).toHaveBeenCalled();
      expect(useSubscriptionStore.getState().subscription).toEqual(mockSubscription);
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.subscriptionControllerGetCurrentSubscription).mockReturnValueOnce(
        promise as any
      );

      const fetchPromise = useSubscriptionStore.getState().fetchSubscription();
      expect(useSubscriptionStore.getState().isLoading).toBe(true);

      resolvePromise!(mockSubscription);
      await fetchPromise;
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.subscriptionControllerGetCurrentSubscription).mockRejectedValueOnce(
        new Error('Subscription error')
      );

      await expect(useSubscriptionStore.getState().fetchSubscription()).rejects.toThrow(
        'Subscription error'
      );
      expect(useSubscriptionStore.getState().error).toBe('Subscription error');
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });
  });

  describe('fetchAvailablePlans', () => {
    it('should fetch and store available plans', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.subscriptionControllerGetAvailablePlans).mockResolvedValueOnce(
        mockPlans as any
      );

      await useSubscriptionStore.getState().fetchAvailablePlans();

      expect(apiClient.subscriptionControllerGetAvailablePlans).toHaveBeenCalled();
      expect(useSubscriptionStore.getState().availablePlans).toHaveLength(2);
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.subscriptionControllerGetAvailablePlans).mockReturnValueOnce(promise as any);

      const fetchPromise = useSubscriptionStore.getState().fetchAvailablePlans();
      expect(useSubscriptionStore.getState().isLoading).toBe(true);

      resolvePromise!(mockPlans);
      await fetchPromise;
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.subscriptionControllerGetAvailablePlans).mockRejectedValueOnce(
        new Error('Plans error')
      );

      await expect(useSubscriptionStore.getState().fetchAvailablePlans()).rejects.toThrow(
        'Plans error'
      );
      expect(useSubscriptionStore.getState().error).toBe('Plans error');
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });

    it('should handle null response', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.subscriptionControllerGetAvailablePlans).mockResolvedValueOnce(null as any);

      await useSubscriptionStore.getState().fetchAvailablePlans();

      expect(useSubscriptionStore.getState().availablePlans).toEqual([]);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useSubscriptionStore.setState({ error: 'Some error' });
      useSubscriptionStore.getState().clearError();
      expect(useSubscriptionStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useSubscriptionStore.setState({
        subscription: mockSubscription as any,
        availablePlans: mockPlans as any,
        isLoading: true,
        error: 'Error',
      });

      useSubscriptionStore.getState().reset();

      const state = useSubscriptionStore.getState();
      expect(state.subscription).toBeNull();
      expect(state.availablePlans).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
