import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTransactionsStore } from '../store/transactions.store';

// Mock the generated API client functions
vi.mock('@contreai/api-client', () => ({
  transactionControllerGetAllTransactions: vi.fn(),
  transactionControllerGetTransaction: vi.fn(),
  transactionControllerCreateTransaction: vi.fn(),
  transactionControllerUpdateTransaction: vi.fn(),
  configureApiClient: vi.fn(),
  getAxiosInstance: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock auth store
vi.mock('modules/auth/store/auth.store', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com' },
    })),
  },
}));

describe('Transactions Store', () => {
  // Mock data uses camelCase to match API client DTOs
  const mockTransactionFromApi = {
    id: 'txn-123',
    transactionName: 'Test Transaction',
    representation: 'buyer',
    propertyAddress: {
      streetAddress: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'United States',
    },
    propertyTypeId: 'single_family',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: 'user-123',
  };

  const mockFormData = {
    transactionName: 'New Transaction',
    representing: 'buyer' as const,
    propertyAddress: {
      streetAddress: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'United States',
    },
    propertyType: 'condo_townhouse',
  };

  beforeEach(async () => {
    // Reset store state
    useTransactionsStore.setState({
      currentTransaction: null,
      transactions: [],
      isCreating: false,
      isEditing: false,
      isLoading: false,
    });

    vi.clearAllMocks();

    // Re-setup auth mock after clearing (vitest v4 clears mock implementations)
    const authStore = await import('modules/auth/store/auth.store');
    vi.mocked(authStore.useAuthStore.getState).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com' },
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTransactionsStore.getState();
      expect(state.currentTransaction).toBeNull();
      expect(state.transactions).toEqual([]);
      expect(state.isCreating).toBe(false);
      expect(state.isEditing).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setCurrentTransaction', () => {
    it('should set the current transaction', () => {
      const transaction = {
        id: 'txn-1',
        transactionName: 'Test',
        representing: 'buyer' as const,
        propertyAddress: {
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States',
        },
        propertyType: 'single_family',
        createdAt: '',
        updatedAt: '',
        status: 'active' as const,
        createdBy: 'user-1',
      };

      useTransactionsStore.getState().setCurrentTransaction(transaction);

      expect(useTransactionsStore.getState().currentTransaction).toEqual(transaction);
    });

    it('should allow setting to null', () => {
      useTransactionsStore.setState({
        currentTransaction: {
          id: 'txn-1',
          transactionName: 'Test',
          representing: 'buyer',
          propertyAddress: {
            streetAddress: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
          },
          propertyType: 'single_family',
          createdAt: '',
          updatedAt: '',
          status: 'active',
          createdBy: 'user-1',
        },
      });

      useTransactionsStore.getState().setCurrentTransaction(null);

      expect(useTransactionsStore.getState().currentTransaction).toBeNull();
    });
  });

  describe('fetchTransactions', () => {
    it('should fetch and store transactions', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionControllerGetAllTransactions).mockResolvedValueOnce({
        data: [mockTransactionFromApi],
      } as any);

      await useTransactionsStore.getState().fetchTransactions();

      expect(apiClient.transactionControllerGetAllTransactions).toHaveBeenCalled();
      expect(useTransactionsStore.getState().transactions).toHaveLength(1);
      expect(useTransactionsStore.getState().transactions[0].id).toBe('txn-123');
      expect(useTransactionsStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.transactionControllerGetAllTransactions).mockReturnValueOnce(promise as any);

      const fetchPromise = useTransactionsStore.getState().fetchTransactions();

      expect(useTransactionsStore.getState().isLoading).toBe(true);

      resolvePromise!({ data: [] });
      await fetchPromise;

      expect(useTransactionsStore.getState().isLoading).toBe(false);
    });

    it('should handle wrapped response with data property', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionControllerGetAllTransactions).mockResolvedValueOnce({
        data: [mockTransactionFromApi],
      } as any);

      await useTransactionsStore.getState().fetchTransactions();

      expect(useTransactionsStore.getState().transactions).toHaveLength(1);
    });

    it('should handle fetch errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionControllerGetAllTransactions).mockRejectedValueOnce(new Error('Network error'));

      await expect(useTransactionsStore.getState().fetchTransactions()).rejects.toThrow(
        'Network error'
      );

      expect(useTransactionsStore.getState().isLoading).toBe(false);
    });

    it('should map API data to frontend Transaction type', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionControllerGetAllTransactions).mockResolvedValueOnce({
        data: [mockTransactionFromApi],
      } as any);

      await useTransactionsStore.getState().fetchTransactions();

      const transaction = useTransactionsStore.getState().transactions[0];
      expect(transaction.id).toBe('txn-123');
      expect(transaction.transactionName).toBe('Test Transaction');
      expect(transaction.representing).toBe('buyer');
      expect(transaction.propertyAddress.streetAddress).toBe('123 Main St');
      expect(transaction.status).toBe('active');
    });
  });

  describe('fetchTransactionById', () => {
    it('should fetch and set a single transaction', async () => {
      const apiClient = await import('@contreai/api-client');
      // API returns data directly (no wrapper)
      vi.mocked(apiClient.transactionControllerGetTransaction).mockResolvedValueOnce(
        mockTransactionFromApi as any
      );

      const result = await useTransactionsStore.getState().fetchTransactionById('txn-123');

      expect(apiClient.transactionControllerGetTransaction).toHaveBeenCalledWith('txn-123');
      expect(result.id).toBe('txn-123');
      expect(useTransactionsStore.getState().currentTransaction?.id).toBe('txn-123');
    });

    it('should handle 404 errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionControllerGetTransaction).mockRejectedValueOnce({
        response: { status: 404 },
      });

      await expect(useTransactionsStore.getState().fetchTransactionById('not-found')).rejects.toThrow(
        'Transaction not found'
      );
    });

    it('should handle missing propertyAddress with default values', async () => {
      const apiClient = await import('@contreai/api-client');
      // API returns data directly (no wrapper)
      vi.mocked(apiClient.transactionControllerGetTransaction).mockResolvedValueOnce({
        id: 'no-address-txn',
        transactionName: 'No Address Transaction',
        representation: 'seller',
        propertyTypeId: 'commercial',
        status: 'draft',
        // No propertyAddress field
      } as any);

      const result = await useTransactionsStore.getState().fetchTransactionById('no-address-txn');

      // Should have default empty address structure
      expect(result.propertyAddress.streetAddress).toBe('');
      expect(result.propertyAddress.city).toBe('');
      expect(result.propertyAddress.country).toBe('United States');
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction and add to store', async () => {
      const apiClient = await import('@contreai/api-client');
      // API returns data directly (no wrapper)
      vi.mocked(apiClient.transactionControllerCreateTransaction).mockResolvedValueOnce({
        id: 'new-txn-123',
        transactionName: mockFormData.transactionName,
        representation: mockFormData.representing,
        propertyAddress: {
          streetAddress: mockFormData.propertyAddress.streetAddress,
          city: mockFormData.propertyAddress.city,
          state: mockFormData.propertyAddress.state,
          zipCode: mockFormData.propertyAddress.zipCode,
          country: mockFormData.propertyAddress.country,
        },
        propertyTypeId: mockFormData.propertyType,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'user-123',
      } as any);

      const result = await useTransactionsStore.getState().createTransaction(mockFormData);

      expect(apiClient.transactionControllerCreateTransaction).toHaveBeenCalledWith({
        transactionName: 'New Transaction',
        representation: 'buyer',
        propertyType: 'condo_townhouse',
        propertyAddress: {
          streetAddress: mockFormData.propertyAddress.streetAddress,
          city: mockFormData.propertyAddress.city,
          state: mockFormData.propertyAddress.state,
          zipCode: mockFormData.propertyAddress.zipCode,
          country: mockFormData.propertyAddress.country,
        },
      });

      expect(result.id).toBe('new-txn-123');
      expect(useTransactionsStore.getState().transactions).toHaveLength(1);
      expect(useTransactionsStore.getState().currentTransaction?.id).toBe('new-txn-123');
    });

    it('should set isCreating during creation', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.transactionControllerCreateTransaction).mockReturnValueOnce(promise as any);

      const createPromise = useTransactionsStore.getState().createTransaction(mockFormData);

      expect(useTransactionsStore.getState().isCreating).toBe(true);

      // API returns data directly (no wrapper)
      resolvePromise!({ id: 'new-txn', transaction_name: mockFormData.transactionName, representation: 'buyer' });
      await createPromise;

      expect(useTransactionsStore.getState().isCreating).toBe(false);
    });

    it('should throw error when not authenticated', async () => {
      const authStore = await import('modules/auth/store/auth.store');
      vi.mocked(authStore.useAuthStore.getState).mockReturnValue({
        isAuthenticated: false,
        user: null,
      } as any);

      await expect(useTransactionsStore.getState().createTransaction(mockFormData)).rejects.toThrow(
        'Please log in to create a transaction'
      );
    });

    it('should handle 401 errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionControllerCreateTransaction).mockRejectedValueOnce({
        response: { status: 401 },
      });

      await expect(useTransactionsStore.getState().createTransaction(mockFormData)).rejects.toThrow(
        'Please log in to create a transaction'
      );
    });

    it('should handle 403 errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.transactionControllerCreateTransaction).mockRejectedValueOnce({
        response: { status: 403 },
      });

      await expect(useTransactionsStore.getState().createTransaction(mockFormData)).rejects.toThrow(
        'You do not have permission to create transactions'
      );
    });

    it('should prepend new transaction to list', async () => {
      const apiClient = await import('@contreai/api-client');

      // Add existing transaction
      useTransactionsStore.setState({
        transactions: [
          {
            id: 'existing-txn',
            transactionName: 'Existing',
            representing: 'seller',
            propertyAddress: {
              streetAddress: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'United States',
            },
            propertyType: 'land',
            createdAt: '',
            updatedAt: '',
            status: 'active',
            createdBy: 'user-1',
          },
        ],
      });

      // API returns data directly (no wrapper)
      vi.mocked(apiClient.transactionControllerCreateTransaction).mockResolvedValueOnce({
        id: 'new-txn',
        transaction_name: mockFormData.transactionName,
        representation: 'buyer',
        status: 'active',
      } as any);

      await useTransactionsStore.getState().createTransaction(mockFormData);

      const transactions = useTransactionsStore.getState().transactions;
      expect(transactions).toHaveLength(2);
      expect(transactions[0].id).toBe('new-txn'); // New one first
      expect(transactions[1].id).toBe('existing-txn');
    });
  });

  describe('updateTransaction', () => {
    it('should update an existing transaction', async () => {
      const apiClient = await import('@contreai/api-client');

      // Set current transaction
      useTransactionsStore.setState({
        currentTransaction: {
          id: 'txn-to-update',
          transactionName: 'Original Name',
          representing: 'buyer',
          propertyAddress: {
            streetAddress: '123 Main St',
            city: 'LA',
            state: 'CA',
            zipCode: '90001',
            country: 'United States',
          },
          propertyType: 'single_family',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          status: 'active',
          createdBy: 'user-1',
        },
      });

      // API returns data directly (no wrapper)
      vi.mocked(apiClient.transactionControllerUpdateTransaction).mockResolvedValueOnce({
        updatedAt: '2024-01-02T00:00:00Z',
      } as any);

      const result = await useTransactionsStore
        .getState()
        .updateTransaction('txn-to-update', { transactionName: 'Updated Name' });

      expect(apiClient.transactionControllerUpdateTransaction).toHaveBeenCalledWith(
        'txn-to-update',
        { transactionName: 'Updated Name' }
      );

      expect(result.transactionName).toBe('Updated Name');
      expect(useTransactionsStore.getState().currentTransaction?.transactionName).toBe(
        'Updated Name'
      );
    });

    it('should set isEditing during update', async () => {
      const apiClient = await import('@contreai/api-client');

      useTransactionsStore.setState({
        currentTransaction: {
          id: 'txn-1',
          transactionName: 'Test',
          representing: 'buyer',
          propertyAddress: {
            streetAddress: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
          },
          propertyType: 'single_family',
          createdAt: '',
          updatedAt: '',
          status: 'active',
          createdBy: 'user-1',
        },
      });

      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.transactionControllerUpdateTransaction).mockReturnValueOnce(promise as any);

      const updatePromise = useTransactionsStore
        .getState()
        .updateTransaction('txn-1', { transactionName: 'New' });

      expect(useTransactionsStore.getState().isEditing).toBe(true);

      // API returns data directly (no wrapper)
      resolvePromise!({ updated_at: '2024-01-02' });
      await updatePromise;

      expect(useTransactionsStore.getState().isEditing).toBe(false);
    });

    it('should throw error when no current transaction', async () => {
      await expect(
        useTransactionsStore.getState().updateTransaction('txn-1', { transactionName: 'New' })
      ).rejects.toThrow(); // Store wraps the error, so we just check it throws
    });
  });

  describe('clearCurrentTransaction', () => {
    it('should clear current transaction and reset flags', () => {
      useTransactionsStore.setState({
        currentTransaction: {
          id: 'txn-1',
          transactionName: 'Test',
          representing: 'buyer',
          propertyAddress: {
            streetAddress: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
          },
          propertyType: 'single_family',
          createdAt: '',
          updatedAt: '',
          status: 'active',
          createdBy: 'user-1',
        },
        isCreating: true,
        isEditing: true,
      });

      useTransactionsStore.getState().clearCurrentTransaction();

      expect(useTransactionsStore.getState().currentTransaction).toBeNull();
      expect(useTransactionsStore.getState().isCreating).toBe(false);
      expect(useTransactionsStore.getState().isEditing).toBe(false);
    });
  });
});
