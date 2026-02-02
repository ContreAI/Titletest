import { create } from 'zustand';
import { transactionPropertyTypeControllerGetAllTypes } from '@contreai/api-client';
import type { TransactionPropertyTypesStore } from '../typings/transaction-property-types.types';

/**
 * Transaction Property Types Store
 * Manages transaction property types globally with automatic fetching
 */
export const useTransactionPropertyTypesStore = create<TransactionPropertyTypesStore>((set, get) => ({
  propertyTypes: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchPropertyTypes: async () => {
    const state = get();

    // Prevent duplicate fetches if already loading
    if (state.isLoading) {
      return;
    }

    // If we have fresh data (less than 5 minutes old), skip fetch
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (state.lastFetched && state.lastFetched > fiveMinutesAgo && state.propertyTypes.length > 0) {
      console.log('[TransactionPropertyTypes] Using cached property types');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log('[TransactionPropertyTypes] Fetching property types from API...');

      const response = await transactionPropertyTypeControllerGetAllTypes();

      set({
        propertyTypes: response,
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
      });
    } catch (error: any) {
      console.error('[TransactionPropertyTypes] Failed to fetch property types:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch transaction property types';

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  getPropertyTypeById: (id: string) => {
    return get().propertyTypes.find((pt) => pt.id === id);
  },

  getPropertyTypeByName: (name: string) => {
    return get().propertyTypes.find((pt) => pt.propertyType === name);
  },

  clearError: () => {
    set({ error: null });
  },
}));

