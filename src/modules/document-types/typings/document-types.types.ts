/**
 * Document Types Module Types
 * Uses generated types from @contreai/api-client
 */

import type { DocumentTypeDto } from '@contreai/api-client';

// Re-export for convenience
export type DocumentType = DocumentTypeDto;

export interface DocumentTypesStore {
  // State
  documentTypes: DocumentType[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp of last successful fetch

  // Actions
  fetchDocumentTypes: () => Promise<void>;
  getDocumentTypeById: (id: string) => DocumentType | undefined;
  getDocumentTypeByName: (name: string) => DocumentType | undefined;
  clearError: () => void;
}

