import { useShallow } from 'zustand/react/shallow';
import { useDocumentsStore } from '../store/documents.store';

/**
 * Custom hook to access documents store with proper reactivity.
 * Uses useShallow to prevent unnecessary re-renders when unrelated state changes.
 * State only - use SWR hooks (useDocumentApi) for API calls
 */
export const useDocuments = () => {
  // State - use useShallow for proper shallow comparison
  const state = useDocumentsStore(
    useShallow((s) => ({
      documents: s.documents,
      currentTransactionDocuments: s.currentTransactionDocuments,
      documentSummaries: s.documentSummaries,
      isLoading: s.isLoading,
      isUploading: s.isUploading,
    }))
  );

  // Actions - these are stable references
  const actions = useDocumentsStore(
    useShallow((s) => ({
      setDocuments: s.setDocuments,
      setCurrentTransactionDocuments: s.setCurrentTransactionDocuments,
      addDocument: s.addDocument,
      removeDocument: s.removeDocument,
      setSummary: s.setSummary,
      getSummary: s.getSummary,
      setLoading: s.setLoading,
      setUploading: s.setUploading,
      clearDocuments: s.clearDocuments,
    }))
  );

  return {
    ...state,
    ...actions,
  };
};

