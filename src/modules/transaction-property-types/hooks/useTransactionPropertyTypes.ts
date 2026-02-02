import { useEffect } from 'react';
import { useTransactionPropertyTypesStore } from '../store/transaction-property-types.store';

/**
 * Hook to use transaction property types store
 * Automatically fetches property types on mount if not already loaded
 */
export const useTransactionPropertyTypes = () => {
  const store = useTransactionPropertyTypesStore();

  useEffect(() => {
    // Fetch property types on mount if we don't have any
    if (store.propertyTypes.length === 0 && !store.isLoading && !store.error) {
      console.log('[useTransactionPropertyTypes] Fetching property types on mount...');
      store.fetchPropertyTypes();
    } else {
      console.log('[useTransactionPropertyTypes] Property types already loaded or loading:', {
        count: store.propertyTypes.length,
        isLoading: store.isLoading,
        error: store.error,
      });
    }
  }, [store.propertyTypes.length, store.isLoading, store.error, store]); // Re-run if these change

  // Log when property types are loaded
  useEffect(() => {
    if (store.propertyTypes.length > 0) {
      console.log('[useTransactionPropertyTypes] Property types loaded:', store.propertyTypes.length);
    }
  }, [store.propertyTypes.length]);

  return {
    propertyTypes: store.propertyTypes,
    isLoading: store.isLoading,
    error: store.error,
    fetchPropertyTypes: store.fetchPropertyTypes,
    getPropertyTypeById: store.getPropertyTypeById,
    getPropertyTypeByName: store.getPropertyTypeByName,
    clearError: store.clearError,
  };
};

