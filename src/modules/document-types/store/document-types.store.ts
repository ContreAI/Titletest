import { create } from 'zustand';
import { documentTypeControllerGetAllTypes } from '@contreai/api-client';
import type { DocumentTypesStore } from '../typings/document-types.types';

/**
 * Document Types Store
 * Manages document types globally with automatic fetching
 */
export const useDocumentTypesStore = create<DocumentTypesStore>((set, get) => ({
  documentTypes: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchDocumentTypes: async () => {
    const state = get();

    // Prevent duplicate fetches if already loading
    if (state.isLoading) {
      return;
    }

    // If we have fresh data (less than 5 minutes old), skip fetch
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (state.lastFetched && state.lastFetched > fiveMinutesAgo && state.documentTypes.length > 0) {
      console.log('[DocumentTypes] Using cached document types');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log('[DocumentTypes] Fetching document types from API...');

      const response = await documentTypeControllerGetAllTypes();

      set({
        documentTypes: response,
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
      });
    } catch (error: any) {
      console.error('[DocumentTypes] Failed to fetch document types:', error);

      const errorMessage =
        error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch document types';

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  getDocumentTypeById: (id: string) => {
    return get().documentTypes.find((dt) => dt.id === id);
  },

  getDocumentTypeByName: (name: string) => {
    return get().documentTypes.find((dt) => dt.docTypeName === name);
  },

  clearError: () => {
    set({ error: null });
  },
}));

