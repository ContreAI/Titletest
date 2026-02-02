import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useDocumentsStore } from '../store/documents.store';
import type { Document, DocumentSummaryDto } from '../typings/documents.types';

// Mock socket service
vi.mock('services/socket/socket.service', () => ({
  socketService: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

/**
 * Comprehensive tests for DocumentsStore
 * Testing all state management functions and socket listeners
 */

const createMockDocument = (overrides: Partial<Document> = {}): Document => ({
  id: 'doc-1',
  transactionId: 'txn-1',
  documentName: 'Test Document',
  documentType: 'PSA',
  fileName: 'test.pdf',
  parsedStatus: 'pending',
  uploadedBy: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createMockSummary = (overrides: Partial<DocumentSummaryDto> = {}): DocumentSummaryDto => ({
  id: 'summary-1',
  documentId: 'doc-1',
  transactionId: 'txn-1',
  userId: 'user-1',
  documentName: 'Test Document',
  documentType: 'PSA',
  summaryContent: 'Test summary content',
  generatedBy: 'openai',
  generatedStatus: 'completed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('Documents Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDocumentsStore.getState().clearDocuments();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      useDocumentsStore.getState().clearDocuments();
      const state = useDocumentsStore.getState();
      expect(state.documents).toEqual([]);
      expect(state.currentTransactionDocuments).toEqual([]);
      expect(Object.keys(state.documentSummaries).length).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.isUploading).toBe(false);
    });
  });

  describe('setDocuments', () => {
    it('should set documents array', () => {
      const docs = [createMockDocument({ id: 'doc-1' }), createMockDocument({ id: 'doc-2' })];

      useDocumentsStore.getState().setDocuments(docs);

      expect(useDocumentsStore.getState().documents).toHaveLength(2);
      expect(useDocumentsStore.getState().documents[0].id).toBe('doc-1');
    });

    it('should replace existing documents', () => {
      useDocumentsStore.setState({ documents: [createMockDocument({ id: 'old-doc' })] });

      const newDocs = [createMockDocument({ id: 'new-doc' })];
      useDocumentsStore.getState().setDocuments(newDocs);

      expect(useDocumentsStore.getState().documents).toHaveLength(1);
      expect(useDocumentsStore.getState().documents[0].id).toBe('new-doc');
    });
  });

  describe('setCurrentTransactionDocuments', () => {
    it('should set current transaction documents', () => {
      const docs = [createMockDocument({ id: 'txn-doc-1' })];

      useDocumentsStore.getState().setCurrentTransactionDocuments(docs);

      expect(useDocumentsStore.getState().currentTransactionDocuments).toHaveLength(1);
      expect(useDocumentsStore.getState().currentTransactionDocuments[0].id).toBe('txn-doc-1');
    });
  });

  describe('addDocument', () => {
    it('should add document to both arrays', () => {
      const existingDoc = createMockDocument({ id: 'existing' });
      useDocumentsStore.setState({
        documents: [existingDoc],
        currentTransactionDocuments: [existingDoc],
      });

      const newDoc = createMockDocument({ id: 'new-doc' });
      useDocumentsStore.getState().addDocument(newDoc);

      expect(useDocumentsStore.getState().documents).toHaveLength(2);
      expect(useDocumentsStore.getState().currentTransactionDocuments).toHaveLength(2);
    });

    it('should append to empty arrays', () => {
      const newDoc = createMockDocument({ id: 'first-doc' });
      useDocumentsStore.getState().addDocument(newDoc);

      expect(useDocumentsStore.getState().documents).toHaveLength(1);
      expect(useDocumentsStore.getState().currentTransactionDocuments).toHaveLength(1);
    });
  });

  describe('removeDocument', () => {
    it('should remove document from both arrays', () => {
      const doc1 = createMockDocument({ id: 'doc-1' });
      const doc2 = createMockDocument({ id: 'doc-2' });
      useDocumentsStore.setState({
        documents: [doc1, doc2],
        currentTransactionDocuments: [doc1, doc2],
      });

      useDocumentsStore.getState().removeDocument('doc-1');

      expect(useDocumentsStore.getState().documents).toHaveLength(1);
      expect(useDocumentsStore.getState().documents[0].id).toBe('doc-2');
      expect(useDocumentsStore.getState().currentTransactionDocuments).toHaveLength(1);
    });

    it('should handle removing non-existent document', () => {
      const doc = createMockDocument({ id: 'doc-1' });
      useDocumentsStore.setState({
        documents: [doc],
        currentTransactionDocuments: [doc],
      });

      useDocumentsStore.getState().removeDocument('non-existent');

      expect(useDocumentsStore.getState().documents).toHaveLength(1);
    });
  });

  describe('updateDocumentStatus', () => {
    it('should update document status in both arrays', () => {
      const doc = createMockDocument({ id: 'doc-1', parsedStatus: 'pending' });
      useDocumentsStore.setState({
        documents: [doc],
        currentTransactionDocuments: [doc],
      });

      useDocumentsStore.getState().updateDocumentStatus('doc-1', 'completed');

      expect(useDocumentsStore.getState().documents[0].parsedStatus).toBe('completed');
      expect(useDocumentsStore.getState().currentTransactionDocuments[0].parsedStatus).toBe('completed');
    });

    it('should only update matching document', () => {
      const doc1 = createMockDocument({ id: 'doc-1', parsedStatus: 'pending' });
      const doc2 = createMockDocument({ id: 'doc-2', parsedStatus: 'pending' });
      useDocumentsStore.setState({
        documents: [doc1, doc2],
        currentTransactionDocuments: [doc1, doc2],
      });

      useDocumentsStore.getState().updateDocumentStatus('doc-1', 'completed');

      expect(useDocumentsStore.getState().documents[0].parsedStatus).toBe('completed');
      expect(useDocumentsStore.getState().documents[1].parsedStatus).toBe('pending');
    });

    it('should handle all status values', () => {
      const doc = createMockDocument({ id: 'doc-1' });
      useDocumentsStore.setState({ documents: [doc], currentTransactionDocuments: [doc] });

      const statuses: Document['parsedStatus'][] = ['pending', 'processing', 'completed', 'error'];
      for (const status of statuses) {
        useDocumentsStore.getState().updateDocumentStatus('doc-1', status);
        expect(useDocumentsStore.getState().documents[0].parsedStatus).toBe(status);
      }
    });
  });

  describe('updateDocumentProcessing', () => {
    it('should update processing step and percentage', () => {
      const doc = createMockDocument({ id: 'doc-1' });
      useDocumentsStore.setState({
        documents: [doc],
        currentTransactionDocuments: [doc],
      });

      useDocumentsStore.getState().updateDocumentProcessing('doc-1', 'reviewing', 25);

      const updatedDoc = useDocumentsStore.getState().documents[0];
      expect(updatedDoc.processingStep).toBe('reviewing');
      expect(updatedDoc.progressPercentage).toBe(25);
      expect(updatedDoc.parsedStatus).toBe('processing');
    });

    it('should set parsedStatus to processing when step is set', () => {
      const doc = createMockDocument({ id: 'doc-1', parsedStatus: 'pending' });
      useDocumentsStore.setState({
        documents: [doc],
        currentTransactionDocuments: [doc],
      });

      useDocumentsStore.getState().updateDocumentProcessing('doc-1', 'standardizing', 50);

      expect(useDocumentsStore.getState().documents[0].parsedStatus).toBe('processing');
    });

    it('should keep original status when no step provided', () => {
      const doc = createMockDocument({ id: 'doc-1', parsedStatus: 'completed' });
      useDocumentsStore.setState({
        documents: [doc],
        currentTransactionDocuments: [doc],
      });

      useDocumentsStore.getState().updateDocumentProcessing('doc-1', undefined, 100);

      expect(useDocumentsStore.getState().documents[0].parsedStatus).toBe('completed');
    });

    it('should handle all processing steps', () => {
      const doc = createMockDocument({ id: 'doc-1' });
      useDocumentsStore.setState({ documents: [doc], currentTransactionDocuments: [doc] });

      const steps: Document['processingStep'][] = [
        'reviewing',
        'standardizing',
        'distilling',
        'enablingAssistance',
        'indexing',
        'identifyingComponents',
        'finalizing',
      ];

      for (const step of steps) {
        useDocumentsStore.getState().updateDocumentProcessing('doc-1', step, 50);
        expect(useDocumentsStore.getState().documents[0].processingStep).toBe(step);
      }
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      useDocumentsStore.getState().setLoading(true);
      expect(useDocumentsStore.getState().isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      useDocumentsStore.setState({ isLoading: true });
      useDocumentsStore.getState().setLoading(false);
      expect(useDocumentsStore.getState().isLoading).toBe(false);
    });
  });

  describe('setUploading', () => {
    it('should set uploading state to true', () => {
      useDocumentsStore.getState().setUploading(true);
      expect(useDocumentsStore.getState().isUploading).toBe(true);
    });

    it('should set uploading state to false', () => {
      useDocumentsStore.setState({ isUploading: true });
      useDocumentsStore.getState().setUploading(false);
      expect(useDocumentsStore.getState().isUploading).toBe(false);
    });
  });

  describe('setupSocketListeners', () => {
    it('should remove existing listeners and add new ones', async () => {
      const { socketService } = await import('services/socket/socket.service');

      useDocumentsStore.getState().setupSocketListeners();

      expect(socketService.off).toHaveBeenCalledWith('document:progress');
      expect(socketService.on).toHaveBeenCalledWith(
        'document:progress',
        expect.any(Function)
      );
    });

    it('should handle processing progress events', async () => {
      const { socketService } = await import('services/socket/socket.service');

      const doc = createMockDocument({ id: 'doc-1', parsedStatus: 'pending' });
      useDocumentsStore.setState({
        documents: [doc],
        currentTransactionDocuments: [doc],
      });

      useDocumentsStore.getState().setupSocketListeners();

      // Get the handler that was registered
      const onCall = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'document:progress'
      );
      expect(onCall).toBeDefined();

      const handler = onCall![1] as (data: any) => void;

      // Simulate processing progress event
      handler({
        documentId: 'doc-1',
        step: 'reviewing',
        percentage: 25,
        message: 'Reviewing document',
        timestamp: new Date().toISOString(),
      });

      expect(useDocumentsStore.getState().documents[0].processingStep).toBe('reviewing');
      expect(useDocumentsStore.getState().documents[0].progressPercentage).toBe(25);
    });

    it('should mark document as completed on completed step', async () => {
      const { socketService } = await import('services/socket/socket.service');

      const doc = createMockDocument({ id: 'doc-1', parsedStatus: 'processing' });
      useDocumentsStore.setState({
        documents: [doc],
        currentTransactionDocuments: [doc],
      });

      useDocumentsStore.getState().setupSocketListeners();

      const onCall = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'document:progress'
      );
      const handler = onCall![1] as (data: any) => void;

      // Simulate completed event
      handler({
        documentId: 'doc-1',
        step: 'completed',
        percentage: 100,
        message: 'Processing complete',
        timestamp: new Date().toISOString(),
      });

      expect(useDocumentsStore.getState().documents[0].parsedStatus).toBe('completed');
      expect(useDocumentsStore.getState().documents[0].progressPercentage).toBe(100);
    });

    it('should ignore invalid processing steps', async () => {
      const { socketService } = await import('services/socket/socket.service');

      const doc = createMockDocument({ id: 'doc-1', parsedStatus: 'pending' });
      useDocumentsStore.setState({
        documents: [doc],
        currentTransactionDocuments: [doc],
      });

      useDocumentsStore.getState().setupSocketListeners();

      const onCall = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'document:progress'
      );
      const handler = onCall![1] as (data: any) => void;

      // Simulate event with invalid step
      handler({
        documentId: 'doc-1',
        step: 'invalid_step',
        percentage: 50,
        message: 'Invalid step',
        timestamp: new Date().toISOString(),
      });

      // Should update status to processing but not set invalid step
      expect(useDocumentsStore.getState().documents[0].processingStep).toBeUndefined();
      expect(useDocumentsStore.getState().documents[0].progressPercentage).toBe(50);
    });
  });
});

describe('Documents Store - Summary Caching with Transaction Isolation', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDocumentsStore.getState().clearDocuments();
  });

  describe('setSummary and getSummary', () => {
    it('should store and retrieve summary using composite key (transactionId:documentId)', () => {
      const store = useDocumentsStore.getState();
      const summary = createMockSummary({
        transactionId: 'txn-1',
        documentId: 'doc-1',
        summaryContent: 'Summary for transaction 1',
      });

      store.setSummary('txn-1', 'doc-1', summary);

      const retrieved = store.getSummary('txn-1', 'doc-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.summaryContent).toBe('Summary for transaction 1');
    });

    it('should isolate summaries by transaction - same documentId in different transactions', () => {
      const store = useDocumentsStore.getState();

      // Store summary for document in Transaction A
      const summaryA = createMockSummary({
        transactionId: 'txn-A',
        documentId: 'doc-1',
        summaryContent: 'Summary from Transaction A',
      });
      store.setSummary('txn-A', 'doc-1', summaryA);

      // Store summary for same documentId in Transaction B
      const summaryB = createMockSummary({
        transactionId: 'txn-B',
        documentId: 'doc-1',
        summaryContent: 'Summary from Transaction B',
      });
      store.setSummary('txn-B', 'doc-1', summaryB);

      // Both summaries should be retrievable independently
      const retrievedA = store.getSummary('txn-A', 'doc-1');
      const retrievedB = store.getSummary('txn-B', 'doc-1');

      expect(retrievedA?.summaryContent).toBe('Summary from Transaction A');
      expect(retrievedB?.summaryContent).toBe('Summary from Transaction B');
    });

    it('should return undefined for wrong transactionId (no cross-transaction leakage)', () => {
      const store = useDocumentsStore.getState();

      // Store summary only for Transaction A
      const summary = createMockSummary({
        transactionId: 'txn-A',
        documentId: 'doc-1',
        summaryContent: 'Summary from Transaction A',
      });
      store.setSummary('txn-A', 'doc-1', summary);

      // Attempting to get summary with wrong transactionId should return undefined
      const wrongTransaction = store.getSummary('txn-B', 'doc-1');
      expect(wrongTransaction).toBeUndefined();

      // Correct transactionId should still work
      const correctTransaction = store.getSummary('txn-A', 'doc-1');
      expect(correctTransaction).toBeDefined();
    });

    it('should handle multiple documents across multiple transactions', () => {
      const store = useDocumentsStore.getState();

      // Transaction 1: 2 documents
      store.setSummary(
        'txn-1',
        'doc-A',
        createMockSummary({ summaryContent: 'Txn1 DocA' })
      );
      store.setSummary(
        'txn-1',
        'doc-B',
        createMockSummary({ summaryContent: 'Txn1 DocB' })
      );

      // Transaction 2: 2 documents (one with same ID as txn-1)
      store.setSummary(
        'txn-2',
        'doc-A',
        createMockSummary({ summaryContent: 'Txn2 DocA' })
      );
      store.setSummary(
        'txn-2',
        'doc-C',
        createMockSummary({ summaryContent: 'Txn2 DocC' })
      );

      // Verify all summaries are isolated
      expect(store.getSummary('txn-1', 'doc-A')?.summaryContent).toBe('Txn1 DocA');
      expect(store.getSummary('txn-1', 'doc-B')?.summaryContent).toBe('Txn1 DocB');
      expect(store.getSummary('txn-2', 'doc-A')?.summaryContent).toBe('Txn2 DocA');
      expect(store.getSummary('txn-2', 'doc-C')?.summaryContent).toBe('Txn2 DocC');

      // Non-existent combinations should return undefined
      expect(store.getSummary('txn-1', 'doc-C')).toBeUndefined();
      expect(store.getSummary('txn-2', 'doc-B')).toBeUndefined();
    });
  });

  describe('clearDocuments', () => {
    it('should clear all cached summaries when clearDocuments is called', () => {
      const store = useDocumentsStore.getState();

      // Store summaries for multiple transactions
      store.setSummary(
        'txn-1',
        'doc-1',
        createMockSummary({ summaryContent: 'Summary 1' })
      );
      store.setSummary(
        'txn-2',
        'doc-2',
        createMockSummary({ summaryContent: 'Summary 2' })
      );

      // Verify they exist
      expect(store.getSummary('txn-1', 'doc-1')).toBeDefined();
      expect(store.getSummary('txn-2', 'doc-2')).toBeDefined();

      // Clear all documents
      store.clearDocuments();

      // All summaries should be cleared
      expect(store.getSummary('txn-1', 'doc-1')).toBeUndefined();
      expect(store.getSummary('txn-2', 'doc-2')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty transactionId gracefully', () => {
      const store = useDocumentsStore.getState();

      store.setSummary('', 'doc-1', createMockSummary({ summaryContent: 'Empty txn' }));

      expect(store.getSummary('', 'doc-1')?.summaryContent).toBe('Empty txn');
      expect(store.getSummary('other-txn', 'doc-1')).toBeUndefined();
    });

    it('should handle special characters in IDs', () => {
      const store = useDocumentsStore.getState();

      const txnId = 'txn-with:colon';
      const docId = 'doc-with:colon';

      store.setSummary(txnId, docId, createMockSummary({ summaryContent: 'Special chars' }));

      expect(store.getSummary(txnId, docId)?.summaryContent).toBe('Special chars');
    });
  });
});
