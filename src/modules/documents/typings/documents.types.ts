/**
 * Documents Module Types
 * Uses camelCase to match TypeScript conventions
 */

import type { DocumentSummaryDto, DocumentDtoProcessingStep, DocumentDtoParsedStatus } from '@contreai/api-client';

// Re-export types for convenience
export type { DocumentSummaryDto, DocumentDtoProcessingStep, DocumentDtoParsedStatus };

export interface Document {
  id: string;
  transactionId: string;
  documentName: string;
  documentType: string;
  originalDocumentType?: string;
  documentTypeCorrected?: boolean;
  fileName: string;
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;

  // Processing status (uses API type)
  parsedStatus: DocumentDtoParsedStatus;

  // Detailed processing step (uses API type)
  processingStep?: DocumentDtoProcessingStep;

  // Progress percentage (0-100)
  progressPercentage?: number;

  // Extracted data
  metadata?: Record<string, any>;
  parsedData?: Record<string, any>;

  // Address mismatch detection
  addressMismatch?: {
    detected: boolean;
    documentAddress: string;
    transactionAddress: string;
    confidence: number;
  };

  // Metadata
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsStore {
  // State
  documents: Document[];
  currentTransactionDocuments: Document[];
  /** Summary cache using Record for proper Zustand reactivity (Map causes issues with reference equality) */
  documentSummaries: Record<string, DocumentSummaryDto>;
  isLoading: boolean;
  isUploading: boolean;

  // State setters
  setDocuments: (documents: Document[]) => void;
  setCurrentTransactionDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  removeDocument: (documentId: string) => void;
  updateDocument: (documentId: string, updates: Partial<Document>) => void;
  updateDocumentStatus: (documentId: string, status: Document['parsedStatus']) => void;
  updateDocumentProcessing: (
    documentId: string,
    processingStep?: Document['processingStep'],
    progressPercentage?: number
  ) => void;
  setSummary: (transactionId: string, documentId: string, summary: DocumentSummaryDto) => void;
  getSummary: (transactionId: string, documentId: string) => DocumentSummaryDto | undefined;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  clearDocuments: () => void;

  // WebSocket listeners setup/teardown
  setupSocketListeners: () => void;
  removeSocketListeners: () => void;

  // Document completion callback - called when a document finishes processing
  onDocumentCompleted: (callback: (documentId: string, transactionId: string) => void) => () => void;

  // Document deletion callback - called when a document is deleted
  onDocumentDeleted: (callback: (documentId: string, transactionId: string) => void) => () => void;
}
