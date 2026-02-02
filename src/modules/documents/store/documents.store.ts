import { create } from 'zustand';
import { DocumentsStore, Document, DocumentSummaryDto } from '../typings/documents.types';
import { socketService } from 'services/socket/socket.service';

type ProcessingStep = Document['processingStep'];

/**
 * Documents Store
 * State management only - NO API calls
 * Use SWR hooks (useDocumentApi) for API calls
 */
// Callback registry for document completion events
// Uses a Map with unique IDs to ensure proper cleanup even if the same function reference
// is registered multiple times from different component instances
type DocumentCompletedCallback = (documentId: string, transactionId: string) => void;
type DocumentDeletedCallback = (documentId: string, transactionId: string) => void;
let callbackIdCounter = 0;
const documentCompletedCallbacks = new Map<number, DocumentCompletedCallback>();
const documentDeletedCallbacks = new Map<number, DocumentDeletedCallback>();

export const useDocumentsStore = create<DocumentsStore>((set, get) => ({
  documents: [],
  currentTransactionDocuments: [],
  documentSummaries: {},
  isLoading: false,
  isUploading: false,

  // State setters
  setDocuments: (documents: Document[]) => set({ documents }),
  setCurrentTransactionDocuments: (documents: Document[]) => set({ currentTransactionDocuments: documents }),
  addDocument: (document: Document) => {
    const currentDocs = get().currentTransactionDocuments;
    set({
      currentTransactionDocuments: [...currentDocs, document],
      documents: [...get().documents, document],
    });
  },
  removeDocument: (documentId: string) => {
    set({
      currentTransactionDocuments: get().currentTransactionDocuments.filter((doc) => doc.id !== documentId),
      documents: get().documents.filter((doc) => doc.id !== documentId),
    });
  },
  updateDocument: (documentId: string, updates: Partial<Document>) => {
    const updateList = (list: Document[]) =>
      list.map((doc) => (doc.id === documentId ? { ...doc, ...updates } : doc));
    set({
      currentTransactionDocuments: updateList(get().currentTransactionDocuments),
      documents: updateList(get().documents),
    });
  },
  updateDocumentStatus: (documentId: string, status) => {
    const updateList = (list: Document[]) =>
      list.map((doc) => (doc.id === documentId ? { ...doc, parsedStatus: status } : doc));
    set({
      currentTransactionDocuments: updateList(get().currentTransactionDocuments),
      documents: updateList(get().documents),
    });
  },
  updateDocumentProcessing: (documentId: string, processingStep?: string, progressPercentage?: number) => {
    const updateList = (list: Document[]) =>
      list.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              processingStep: processingStep as any,
              progressPercentage: progressPercentage,
              parsedStatus: processingStep ? 'processing' : doc.parsedStatus,
            }
          : doc
      );
    set({
      currentTransactionDocuments: updateList(get().currentTransactionDocuments),
      documents: updateList(get().documents),
    });
  },
  setSummary: (transactionId: string, documentId: string, summary: DocumentSummaryDto) => {
    const cacheKey = `${transactionId}:${documentId}`;
    set((state) => ({
      documentSummaries: { ...state.documentSummaries, [cacheKey]: summary },
    }));
  },
  getSummary: (transactionId: string, documentId: string) => {
    const cacheKey = `${transactionId}:${documentId}`;
    return get().documentSummaries[cacheKey];
  },
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setUploading: (uploading: boolean) => set({ isUploading: uploading }),

  clearDocuments: () => {
    set({ documents: [], currentTransactionDocuments: [], documentSummaries: {} });
  },

  // Register a callback to be called when document processing completes
  // Returns an unsubscribe function that MUST be called on cleanup to prevent memory leaks
  onDocumentCompleted: (callback: DocumentCompletedCallback) => {
    const id = ++callbackIdCounter;
    documentCompletedCallbacks.set(id, callback);
    // Return unsubscribe function with closure over the specific ID
    return () => {
      documentCompletedCallbacks.delete(id);
    };
  },

  // Register a callback to be called when a document is deleted
  // Returns an unsubscribe function that MUST be called on cleanup to prevent memory leaks
  onDocumentDeleted: (callback: DocumentDeletedCallback) => {
    const id = ++callbackIdCounter;
    documentDeletedCallbacks.set(id, callback);
    // Return unsubscribe function with closure over the specific ID
    return () => {
      documentDeletedCallbacks.delete(id);
    };
  },

  // Setup Socket.IO listeners for real-time document processing updates
  setupSocketListeners: () => {
    console.log('[Documents] Setting up Socket.IO listeners for document processing');

    // Remove existing listeners first to avoid duplicates
    socketService.off('document:progress');
    socketService.off('document:updated');
    socketService.off('document:deleted');

    // Listen for document processing progress updates
    const handleProcessingProgress = (data: {
      documentId: string;
      transactionId?: string;
      step: string;
      percentage: number;
      message: string;
      timestamp: string;
    }) => {
      console.log('[Documents] 📊 Processing progress received:', data);

      const { documentId, transactionId, step, percentage } = data;

      // Update document with processing step and percentage
      if (step === 'completed') {
        // Mark as completed and clear processing step
        get().updateDocumentStatus(documentId, 'completed');
        get().updateDocumentProcessing(documentId, undefined, 100);

        // Notify all registered callbacks that a document completed
        if (transactionId) {
          console.log('[Documents] 🎉 Document completed, notifying callbacks:', { documentId, transactionId, callbackCount: documentCompletedCallbacks.size });
          documentCompletedCallbacks.forEach((callback, id) => {
            try {
              callback(documentId, transactionId);
            } catch (err) {
              console.error(`[Documents] Error in document completed callback (id: ${id}):`, err);
            }
          });
        }
      } else {
        // Update processing step and percentage
        // Type guard: validate step is a valid ProcessingStep before casting
        const validSteps: readonly ProcessingStep[] = [
          'reviewing',
          'standardizing',
          'distilling',
          'enablingAssistance',
          'indexing',
          'identifyingComponents',
          'finalizing',
        ] as const;
        const processingStep: ProcessingStep | undefined = validSteps.includes(step as ProcessingStep)
          ? (step as ProcessingStep)
          : undefined;
        get().updateDocumentProcessing(documentId, processingStep, percentage);
      }
    };

    socketService.on('document:progress', handleProcessingProgress);

    // Listen for document field updates (e.g., document type correction during processing)
    // Updates match backend's UpdateDocumentInput which uses snake_case (database column names)
    const handleDocumentUpdated = (data: {
      documentId: string;
      updates: {
        document_name?: string;
        document_type?: string;
        metadata?: Record<string, unknown>;
        parsed_status?: 'pending' | 'processing' | 'completed' | 'error';
        processing_step?: string | null;
        progress_percentage?: number;
      };
      timestamp: string;
    }) => {
      console.log('[Documents] 📝 Document updated event received:', data);

      const { documentId, updates } = data;

      // Field mapping validators: snake_case backend -> camelCase frontend
      const fieldValidators: Array<{
        source: keyof typeof updates;
        target: keyof Document;
        transform?: (value: unknown) => unknown;
      }> = [
        { source: 'document_name', target: 'documentName' },
        { source: 'document_type', target: 'documentType' },
        { source: 'parsed_status', target: 'parsedStatus' },
        { source: 'processing_step', target: 'processingStep', transform: (v) => v as Document['processingStep'] },
        { source: 'progress_percentage', target: 'progressPercentage' },
      ];

      // Apply field validators to build mapped updates
      const mappedUpdates = fieldValidators.reduce<Partial<Document>>((acc, { source, target, transform }) => {
        const value = updates[source];
        if (value !== undefined) {
          (acc as Record<string, unknown>)[target] = transform ? transform(value) : value;
        }
        return acc;
      }, {});

      // Handle metadata - extract nested fields that map to top-level Document properties
      if (updates.metadata !== undefined) {
        mappedUpdates.metadata = updates.metadata;
        const meta = updates.metadata as Record<string, unknown>;

        // Metadata field extractors
        const metadataExtractors: Array<{
          source: string;
          target: keyof Document;
          transform?: (value: unknown) => unknown;
        }> = [
          { source: 'original_document_type', target: 'originalDocumentType', transform: (v) => v as string },
          { source: 'document_type_corrected', target: 'documentTypeCorrected', transform: (v) => v as boolean },
          { source: 'address_mismatch', target: 'addressMismatch', transform: (v) => v as Document['addressMismatch'] },
        ];

        metadataExtractors.forEach(({ source, target, transform }) => {
          if (meta[source] !== undefined) {
            (mappedUpdates as Record<string, unknown>)[target] = transform ? transform(meta[source]) : meta[source];
          }
        });
      }

      get().updateDocument(documentId, mappedUpdates);

      console.log('[Documents] ✅ Document updated in store:', documentId);
    };

    socketService.on('document:updated', handleDocumentUpdated);

    // Listen for document deletion events
    const handleDocumentDeleted = (data: {
      documentId: string;
      transactionId: string;
      documentName: string;
      timestamp: string;
    }) => {
      console.log('[Documents] 🗑️ Document deleted event received:', data);

      const { documentId, transactionId } = data;

      // Remove the document from both stores
      get().removeDocument(documentId);

      // Also clear the document summary cache for this document
      const cacheKey = `${transactionId}:${documentId}`;
      const currentSummaries = get().documentSummaries;
      if (cacheKey in currentSummaries) {
        const { [cacheKey]: _, ...rest } = currentSummaries;
        set({ documentSummaries: rest });
      }

      // Notify all registered callbacks that a document was deleted
      console.log('[Documents] 🗑️ Document deleted, notifying callbacks:', { documentId, transactionId, callbackCount: documentDeletedCallbacks.size });
      documentDeletedCallbacks.forEach((callback, id) => {
        try {
          callback(documentId, transactionId);
        } catch (err) {
          console.error(`[Documents] Error in document deleted callback (id: ${id}):`, err);
        }
      });

      console.log('[Documents] ✅ Document removed from store:', documentId);
    };

    socketService.on('document:deleted', handleDocumentDeleted);

    console.log('[Documents] ✅ Socket.IO listeners set up for document processing');
  },

  // Remove Socket.IO listeners - called on disconnect
  removeSocketListeners: () => {
    console.log('[Documents] Removing Socket.IO listeners');
    socketService.off('document:progress');
    socketService.off('document:updated');
    socketService.off('document:deleted');
    console.log('[Documents] ✅ Socket.IO listeners removed');
  },
}));
