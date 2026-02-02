import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTransactionPropertyTypesStore } from '../store/transaction-property-types.store';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  transactionPropertyTypeControllerGetAllTypes: vi.fn(),
}));

describe('Transaction Property Types Store', () => {
  const mockPropertyTypes = [
    { id: 'pt-1', propertyType: 'Single Family', description: 'Single family home' },
    { id: 'pt-2', propertyType: 'Condo', description: 'Condominium' },
    { id: 'pt-3', propertyType: 'Commercial', description: 'Commercial property' },
  ];

  beforeEach(() => {
    // Reset store state
    useTransactionPropertyTypesStore.setState({
      propertyTypes: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTransactionPropertyTypesStore.getState();
      expect(state.propertyTypes).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetched).toBeNull();
    });
  });

  describe('fetchPropertyTypes', () => {
    it('should fetch and store property types', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionPropertyTypeControllerGetAllTypes).mockResolvedValueOnce(
        mockPropertyTypes as any
      );

      await useTransactionPropertyTypesStore.getState().fetchPropertyTypes();

      expect(apiClient.transactionPropertyTypeControllerGetAllTypes).toHaveBeenCalled();
      expect(useTransactionPropertyTypesStore.getState().propertyTypes).toHaveLength(3);
      expect(useTransactionPropertyTypesStore.getState().isLoading).toBe(false);
      expect(useTransactionPropertyTypesStore.getState().lastFetched).not.toBeNull();
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.transactionPropertyTypeControllerGetAllTypes).mockReturnValueOnce(
        promise as any
      );

      const fetchPromise = useTransactionPropertyTypesStore.getState().fetchPropertyTypes();
      expect(useTransactionPropertyTypesStore.getState().isLoading).toBe(true);

      resolvePromise!(mockPropertyTypes);
      await fetchPromise;
      expect(useTransactionPropertyTypesStore.getState().isLoading).toBe(false);
    });

    it('should skip fetch if already loading', async () => {
      const apiClient = await import('@contreai/api-client');
      useTransactionPropertyTypesStore.setState({ isLoading: true });

      await useTransactionPropertyTypesStore.getState().fetchPropertyTypes();

      expect(apiClient.transactionPropertyTypeControllerGetAllTypes).not.toHaveBeenCalled();
    });

    it('should use cached data if fresh', async () => {
      const apiClient = await import('@contreai/api-client');
      const recentTimestamp = Date.now() - 60000; // 1 minute ago
      useTransactionPropertyTypesStore.setState({
        propertyTypes: mockPropertyTypes as any,
        lastFetched: recentTimestamp,
      });

      await useTransactionPropertyTypesStore.getState().fetchPropertyTypes();

      expect(apiClient.transactionPropertyTypeControllerGetAllTypes).not.toHaveBeenCalled();
    });

    it('should refetch if cache is stale', async () => {
      const apiClient = await import('@contreai/api-client');
      const staleTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago
      useTransactionPropertyTypesStore.setState({
        propertyTypes: mockPropertyTypes as any,
        lastFetched: staleTimestamp,
      });
      vi.mocked(apiClient.transactionPropertyTypeControllerGetAllTypes).mockResolvedValueOnce(
        mockPropertyTypes as any
      );

      await useTransactionPropertyTypesStore.getState().fetchPropertyTypes();

      expect(apiClient.transactionPropertyTypeControllerGetAllTypes).toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionPropertyTypeControllerGetAllTypes).mockRejectedValueOnce({
        response: { data: { message: 'Fetch failed' } },
      });

      await useTransactionPropertyTypesStore.getState().fetchPropertyTypes();

      expect(useTransactionPropertyTypesStore.getState().error).toBe('Fetch failed');
      expect(useTransactionPropertyTypesStore.getState().isLoading).toBe(false);
    });
  });

  describe('getPropertyTypeById', () => {
    it('should return property type by id', () => {
      useTransactionPropertyTypesStore.setState({ propertyTypes: mockPropertyTypes as any });

      const result = useTransactionPropertyTypesStore.getState().getPropertyTypeById('pt-2');

      expect(result).toEqual(mockPropertyTypes[1]);
    });

    it('should return undefined for non-existent id', () => {
      useTransactionPropertyTypesStore.setState({ propertyTypes: mockPropertyTypes as any });

      const result = useTransactionPropertyTypesStore.getState().getPropertyTypeById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getPropertyTypeByName', () => {
    it('should return property type by name', () => {
      useTransactionPropertyTypesStore.setState({ propertyTypes: mockPropertyTypes as any });

      const result = useTransactionPropertyTypesStore.getState().getPropertyTypeByName('Condo');

      expect(result).toEqual(mockPropertyTypes[1]);
    });

    it('should return undefined for non-existent name', () => {
      useTransactionPropertyTypesStore.setState({ propertyTypes: mockPropertyTypes as any });

      const result = useTransactionPropertyTypesStore.getState().getPropertyTypeByName('Unknown');

      expect(result).toBeUndefined();
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useTransactionPropertyTypesStore.setState({ error: 'Some error' });
      useTransactionPropertyTypesStore.getState().clearError();
      expect(useTransactionPropertyTypesStore.getState().error).toBeNull();
    });
  });
});
