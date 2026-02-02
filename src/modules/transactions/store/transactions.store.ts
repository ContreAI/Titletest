import { create } from 'zustand';
import { TransactionsStore, Transaction, TransactionFormData, TransactionStatus, TransactionScope } from '../typings/transactions.types';
import {
  transactionControllerGetAllTransactions,
  transactionControllerGetTransaction,
  transactionControllerCreateTransaction,
  transactionControllerUpdateTransaction,
  type CreateTransactionDto,
  type UpdateTransactionDto,
  type TransactionDto,
} from '@contreai/api-client';
import { useAuthStore } from 'modules/auth/store/auth.store';
import { socketService } from 'services/socket/socket.service';
import { mapApiPropertyAddress } from 'lib/address-utils';




/**
 * Transactions Store
 * Manages transaction creation, editing, and state with backend sync
 */
export const useTransactionsStore = create<TransactionsStore>((set, get) => ({
  currentTransaction: null,
  transactions: [],
  isCreating: false,
  isEditing: false,
  isLoading: false,
  transactionScope: 'mine',

  setCurrentTransaction: (transaction) => {
    set({ currentTransaction: transaction });
  },

  setTransactionScope: (scope: TransactionScope) => {
    set({ transactionScope: scope });
    // Re-fetch transactions with new scope
    get().fetchTransactions(scope);
  },

  fetchTransactions: async (scope?: TransactionScope) => {
    set({ isLoading: true });
    const effectiveScope = scope ?? get().transactionScope;

    try {
      // Use generated client - response has { data, total, page, limit } structure (no success wrapper)
      // Pass scope parameter to filter by user's transactions or all brokerage transactions
      // Note: Cast to any to support scope param until API client is regenerated with new types
      const response = await transactionControllerGetAllTransactions({ scope: effectiveScope } as any);

      // Response is ListTransactionsResponseDto with data: TransactionDto[]
      const transactionsData = response.data;

      // Map backend data to frontend Transaction type
      const transactions: Transaction[] = transactionsData.map((apiData: TransactionDto) => ({
        id: apiData.id,
        transactionName: apiData.transactionName,
        representing: apiData.representation as any,
        propertyAddress: mapApiPropertyAddress(apiData.propertyAddress),
        propertyType: apiData.propertyTypeId ?? 'Unknown',
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
        status: apiData.status as any,
        createdBy: apiData.userId,
      }));

      set({ transactions, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },

  fetchTransactionById: async (id: string) => {
    set({ isLoading: true });

    try {
      // Use generated client - response is TransactionDto directly (no wrapper)
      const apiData = await transactionControllerGetTransaction(id);

      // Map backend data to frontend Transaction type
      const transaction: Transaction = {
        id: apiData.id,
        transactionName: apiData.transactionName ?? '',
        representing: apiData.representation as any,
        propertyAddress: mapApiPropertyAddress(apiData.propertyAddress),
        propertyType: apiData.propertyTypeId ?? 'Unknown',
        createdAt: apiData.createdAt ?? '',
        updatedAt: apiData.updatedAt ?? '',
        status: (apiData.status ?? 'draft') as any,
        createdBy: apiData.userId ?? '',
      };

      set({ currentTransaction: transaction, isLoading: false });
      return transaction;
    } catch (error: any) {
      set({ isLoading: false, currentTransaction: null });
      console.error('Failed to fetch transaction:', error);

      if (error.response?.status === 404) {
        throw new Error('Transaction not found');
      }

      throw new Error(error.response?.data?.message || 'Failed to load transaction');
    }
  },

  createTransaction: async (data: TransactionFormData) => {
    set({ isCreating: true });

    try {
      // Map frontend data to backend DTO (camelCase)
      const payload: CreateTransactionDto = {
        transactionName: data.transactionName,
        representation: data.representing as CreateTransactionDto['representation'],
        propertyType: data.propertyType,
        propertyAddress: {
          streetAddress: data.propertyAddress.streetAddress,
          city: data.propertyAddress.city,
          state: data.propertyAddress.state,
          zipCode: data.propertyAddress.zipCode,
          country: data.propertyAddress.country || 'United States',
        },
      };

      // Ensure user session is initialized
      const { isAuthenticated, user } = useAuthStore.getState();
      if (!isAuthenticated || !user) {
        throw new Error('Please log in to create a transaction');
      }

      // Use generated client - response is TransactionDto directly (no wrapper)
      const transactionData = await transactionControllerCreateTransaction(payload);

      if (!transactionData?.id) {
        console.error('Invalid response structure:', transactionData);
        throw new Error('Invalid response from server');
      }

      // Map from API response, fallback to form data if not present
      const propertyAddr = transactionData.propertyAddress
        ? mapApiPropertyAddress(transactionData.propertyAddress)
        : data.propertyAddress;

      const newTransaction: Transaction = {
        id: transactionData.id,
        transactionName: transactionData.transactionName ?? data.transactionName,
        representing: transactionData.representation ?? data.representing,
        propertyAddress: propertyAddr,
        propertyType: transactionData.propertyTypeId ?? data.propertyType,
        createdAt: transactionData.createdAt ?? new Date().toISOString(),
        updatedAt: transactionData.updatedAt ?? transactionData.createdAt ?? new Date().toISOString(),
        status: transactionData.status as any,
        createdBy: transactionData.userId ?? user.id,
      };

      // Add to transactions list
      const currentTransactions = get().transactions;
      set({
        currentTransaction: newTransaction,
        transactions: [newTransaction, ...currentTransactions],
        isCreating: false,
      });
      return newTransaction;
    } catch (error: any) {
      set({ isCreating: false });
      console.error('Failed to create transaction:', error);

      // Handle different error types
      if (error.response?.status === 401) {
        throw new Error('Please log in to create a transaction');
      }

      if (error.response?.status === 403) {
        throw new Error('You do not have permission to create transactions');
      }

      const errorMessage =
        error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create transaction. Please try again.';

      throw new Error(errorMessage);
    }
  },

  updateTransaction: async (id: string, data: Partial<TransactionFormData>) => {
    set({ isEditing: true });

    try {
      const currentTransaction = get().currentTransaction;
      if (!currentTransaction) {
        throw new Error('No current transaction to update');
      }

      // Map frontend data to backend DTO (camelCase)
      const payload: UpdateTransactionDto = {};

      if (data.transactionName) payload.transactionName = data.transactionName;
      if (data.representing) payload.representation = data.representing as UpdateTransactionDto['representation'];
      if (data.propertyType) payload.propertyType = data.propertyType;
      if (data.propertyAddress) {
        payload.propertyAddress = {
          streetAddress: data.propertyAddress.streetAddress,
          city: data.propertyAddress.city,
          state: data.propertyAddress.state,
          zipCode: data.propertyAddress.zipCode,
          country: data.propertyAddress.country || 'United States',
        };
      }

      // Use generated client - response is TransactionDto directly (no wrapper)
      const apiData = await transactionControllerUpdateTransaction(id, payload);

      const updatedTransaction: Transaction = {
        ...currentTransaction,
        ...data,
        updatedAt: apiData.updatedAt ?? new Date().toISOString(),
      };

      set({ currentTransaction: updatedTransaction, isEditing: false });
      return updatedTransaction;
    } catch (error: any) {
      set({ isEditing: false });
      console.error('Failed to update transaction:', error);
      throw new Error(error.response?.data?.message || 'Failed to update transaction');
    }
  },

  updateTransactionStatus: async (id: string, status: TransactionStatus) => {
    const currentTransactions = get().transactions;
    const transactionIndex = currentTransactions.findIndex((t) => t.id === id);

    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    // Optimistic update
    const originalTransaction = currentTransactions[transactionIndex];
    const updatedTransactions = [...currentTransactions];
    updatedTransactions[transactionIndex] = { ...originalTransaction, status };
    set({ transactions: updatedTransactions });

    try {
      const payload: UpdateTransactionDto = { status: status as UpdateTransactionDto['status'] };
      await transactionControllerUpdateTransaction(id, payload);

      // Return updated transaction
      return updatedTransactions[transactionIndex];
    } catch (error: any) {
      // Rollback on failure
      set({ transactions: currentTransactions });
      console.error('Failed to update transaction status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update status');
    }
  },

  clearCurrentTransaction: () => {
    set({ currentTransaction: null, isCreating: false, isEditing: false });
  },

  // Update a transaction from socket events (without API call)
  // Uses atomic set() to prevent race conditions between transactions list and currentTransaction
  updateTransactionFromSocket: (transactionId: string, updates: Partial<Transaction>) => {
    set((state) => {
      const updatedAt = new Date().toISOString();

      // Update in transactions list
      const updatedTransactions = state.transactions.map((t) =>
        t.id === transactionId ? { ...t, ...updates, updatedAt } : t
      );

      // Update current transaction if it matches
      const updatedCurrent = state.currentTransaction?.id === transactionId
        ? { ...state.currentTransaction, ...updates, updatedAt }
        : state.currentTransaction;

      return {
        transactions: updatedTransactions,
        currentTransaction: updatedCurrent,
      };
    });
  },

  // Setup Socket.IO listeners for real-time transaction updates
  setupSocketListeners: () => {
    console.log('[Transactions] Setting up Socket.IO listeners for transaction updates');

    // Remove existing listeners first to avoid duplicates
    socketService.off('transaction:updated');
    socketService.off('transaction:created');
    socketService.off('transaction:deleted');

    // Listen for transaction updates
    // Backend now sends the full transaction state for cache replacement
    const handleTransactionUpdated = (data: {
      transactionId: string;
      transaction: Record<string, any>;
      userId: string;
      timestamp: string;
    }) => {
      console.log('[Transactions] 📝 Transaction updated received:', data);

      const { transactionId, transaction: txData } = data;

      // Map backend response to frontend Transaction type
      const updatedTransaction: Partial<Transaction> = {
        transactionName: txData.transactionName ?? txData.transaction_name ?? '',
        status: txData.status,
        representing: (txData.representation ?? txData.representing) as any,
        propertyAddress: txData.propertyAddress
          ? mapApiPropertyAddress(txData.propertyAddress)
          : undefined,
        propertyType: txData.propertyType ?? 'Unknown',
        updatedAt: txData.updatedAt ?? new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(updatedTransaction).forEach((key) => {
        if (updatedTransaction[key as keyof typeof updatedTransaction] === undefined) {
          delete updatedTransaction[key as keyof typeof updatedTransaction];
        }
      });

      get().updateTransactionFromSocket(transactionId, updatedTransaction);
      console.log('[Transactions] ✅ Transaction updated in store:', { transactionId, updates: updatedTransaction });
    };

    // Listen for new transactions (created by other users/sessions)
    const handleTransactionCreated = (data: {
      transaction: Record<string, any>;
      userId: string;
      timestamp: string;
    }) => {
      console.log('[Transactions] 🆕 New transaction received:', data);

      const apiData = data.transaction;
      const newTransaction: Transaction = {
        id: apiData.id,
        transactionName: apiData.transactionName ?? apiData.transaction_name ?? '',
        representing: (apiData.representation ?? apiData.representing) as any,
        propertyAddress: mapApiPropertyAddress(apiData.propertyAddress),
        propertyType: apiData.propertyTypeId ?? 'Unknown',
        createdAt: apiData.createdAt ?? new Date().toISOString(),
        updatedAt: apiData.updatedAt ?? new Date().toISOString(),
        status: (apiData.status ?? 'draft') as any,
        createdBy: apiData.userId ?? '',
      };

      // Add to transactions list if not already present
      const currentTransactions = get().transactions;
      if (!currentTransactions.some((t) => t.id === newTransaction.id)) {
        set({ transactions: [newTransaction, ...currentTransactions] });
        console.log('[Transactions] ✅ New transaction added to store:', newTransaction.id);
      }
    };

    // Listen for transaction deletions
    const handleTransactionDeleted = (data: {
      transactionId: string;
      userId: string;
      timestamp: string;
    }) => {
      console.log('[Transactions] 🗑️ Transaction deleted received:', data);

      const { transactionId } = data;
      const currentTransactions = get().transactions;
      const currentTransaction = get().currentTransaction;

      // Remove from transactions list
      set({
        transactions: currentTransactions.filter((t) => t.id !== transactionId),
      });

      // Clear current transaction if it was deleted
      if (currentTransaction?.id === transactionId) {
        set({ currentTransaction: null });
      }

      console.log('[Transactions] ✅ Transaction removed from store:', transactionId);
    };

    socketService.on('transaction:updated', handleTransactionUpdated);
    socketService.on('transaction:created', handleTransactionCreated);
    socketService.on('transaction:deleted', handleTransactionDeleted);

    console.log('[Transactions] ✅ Socket.IO listeners set up for transaction updates');
  },

  // Remove Socket.IO listeners - called on disconnect
  removeSocketListeners: () => {
    console.log('[Transactions] Removing Socket.IO listeners');
    socketService.off('transaction:updated');
    socketService.off('transaction:created');
    socketService.off('transaction:deleted');
    console.log('[Transactions] ✅ Socket.IO listeners removed');
  },
}));

/**
 * Backend API Endpoints:
 * 
 * POST /api/transactions
 * Creates a new transaction
 * 
 * Request Body:
 * {
 *   transactionName: string,
 *   representing: "buyer" | "seller" | "both",
 *   address: {
 *     street: string,
 *     city: string,
 *     state: string,
 *     zipCode?: string
 *   },
 *   propertyType: "single_family" | "condo_townhouse" | "land" | "commercial" | "other"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     transactionName: string,
 *     representing: string,
 *     address: object,
 *     propertyType: string,
 *     status: "active",
 *     createdAt: string,
 *     updatedAt: string,
 *     createdBy: string
 *   }
 * }
 * 
 * PUT /api/transactions/{id}
 * Updates an existing transaction
 * 
 * Request Body: Partial<TransactionFormData>
 * Response: Same as POST
 * 
 * GET /api/transactions/{id}
 * Gets a single transaction
 * 
 * Response: Same data structure as POST
 */

