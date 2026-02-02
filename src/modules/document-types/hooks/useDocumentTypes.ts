import { useEffect } from 'react';
import { useDocumentTypesStore } from '../store/document-types.store';

/**
 * Hook to use document types store
 * Automatically fetches document types on mount if not already loaded
 */
export const useDocumentTypes = () => {
  const store = useDocumentTypesStore();

  useEffect(() => {
    // Fetch document types on mount if we don't have any
    if (store.documentTypes.length === 0 && !store.isLoading && !store.error) {
      console.log('[useDocumentTypes] Fetching document types on mount...');
      store.fetchDocumentTypes();
    } else {
      console.log('[useDocumentTypes] Document types already loaded or loading:', {
        count: store.documentTypes.length,
        isLoading: store.isLoading,
        error: store.error,
      });
    }
  }, [store.documentTypes.length, store.isLoading, store.error, store]); // Re-run if these change

  // Log when document types are loaded
  useEffect(() => {
    if (store.documentTypes.length > 0) {
      console.log('[useDocumentTypes] Document types loaded:', store.documentTypes.length);
    }
  }, [store.documentTypes.length]);

  return {
    documentTypes: store.documentTypes,
    isLoading: store.isLoading,
    error: store.error,
    fetchDocumentTypes: store.fetchDocumentTypes,
    getDocumentTypeById: store.getDocumentTypeById,
    getDocumentTypeByName: store.getDocumentTypeByName,
    clearError: store.clearError,
  };
};

