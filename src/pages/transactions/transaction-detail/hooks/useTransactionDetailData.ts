import { useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTransactionsStore } from 'modules/transactions/store/transactions.store';
import { useBackgroundSummaryFetch } from 'modules/documents';
import { useDocumentsStore } from 'modules/documents/store/documents.store';
import { useTransactionReports } from 'modules/transaction-reports';
import { useDocumentControllerGetTransactionDocuments, type DocumentDto } from '@contreai/api-client';

// Extended DocumentDto with fields from backend that aren't in the generated API client
interface ExtendedDocumentDto extends DocumentDto {
  metadata?: Record<string, unknown>;
  parsedData?: Record<string, unknown>;
  addressMismatch?: {
    detected: boolean;
    documentAddress: string;
    transactionAddress: string;
    confidence: number;
  };
  originalDocumentType?: string;
  documentTypeCorrected?: boolean;
}

export const useTransactionDetailData = (transactionId: string | undefined) => {
  // Use direct selectors with useShallow for better reactivity
  const { currentTransaction, isLoading: isLoadingTransaction } = useTransactionsStore(
    useShallow((s) => ({
      currentTransaction: s.currentTransaction,
      isLoading: s.isLoading,
    }))
  );
  const fetchTransactionById = useTransactionsStore((s) => s.fetchTransactionById);

  const { currentTransactionDocuments, setCurrentTransactionDocuments, onDocumentCompleted, onDocumentDeleted } = useDocumentsStore(
    useShallow((s) => ({
      currentTransactionDocuments: s.currentTransactionDocuments,
      setCurrentTransactionDocuments: s.setCurrentTransactionDocuments,
      onDocumentCompleted: s.onDocumentCompleted,
      onDocumentDeleted: s.onDocumentDeleted,
    }))
  );
  const { currentTransactionReport, fetchTransactionReport, setTransactionReport, isLoading: isLoadingReport } = useTransactionReports();

  // Use the SWR query hook for documents - it fetches automatically when transactionId is provided
  const { data: documentsData, isLoading: isFetchingDocuments } = useDocumentControllerGetTransactionDocuments(
    transactionId || '',
    { swr: { enabled: !!transactionId } }
  );

  // Note: WebSocket listeners are now centrally managed by socket.events.ts
  // They are initialized when the socket connects (in socket.store.ts)

  // Transform and set documents when data arrives from SWR
  // API returns ListDocumentsResponseDto with data: DocumentDto[]
  useEffect(() => {
    if (documentsData?.data) {
      const documents = (documentsData.data as ExtendedDocumentDto[]).map((apiData) => ({
        id: apiData.id,
        transactionId: apiData.transactionId,
        documentName: apiData.documentName,
        documentType: apiData.documentType || 'Unknown',
        fileName: apiData.documentName,
        filePath: apiData.filePath,
        fileUrl: apiData.fileUrl,
        fileSize: apiData.fileSize,
        mimeType: apiData.mimeType,
        parsedStatus: apiData.parsedStatus || 'pending',
        processingStep: apiData.processingStep,
        progressPercentage: apiData.progressPercentage,
        metadata: apiData.metadata,
        parsedData: apiData.parsedData,
        uploadedBy: apiData.userId,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
        addressMismatch: apiData.addressMismatch,
        originalDocumentType: apiData.originalDocumentType,
        documentTypeCorrected: apiData.documentTypeCorrected,
      }));
      setCurrentTransactionDocuments(documents);
    }
  }, [documentsData, setCurrentTransactionDocuments]);

  // Fetch transaction and report when transactionId changes
  useEffect(() => {
    if (transactionId) {
      Promise.all([
        fetchTransactionById(transactionId),
        fetchTransactionReport(transactionId)
          .then((report) => {
            console.log('[TransactionDetail] Report fetched successfully:', report);
            return report;
          })
          .catch((error) => {
            // Report might not exist yet if no documents are uploaded
            console.log('[TransactionDetail] Transaction report not available:', error);
            return null;
          }),
      ]).catch((error) => {
        console.error('Failed to load transaction data:', error);
      });
    }
  }, [transactionId, fetchTransactionById, fetchTransactionReport]);

  // Automatically fetch summaries for processed documents in the background
  useBackgroundSummaryFetch({ documents: currentTransactionDocuments });

  // Refresh the transaction report when a document completes processing
  // The backend generates/updates the report after each document is processed
  const handleDocumentCompleted = useCallback(
    (_documentId: string, completedTransactionId: string) => {
      // Only refresh if it's for this transaction
      if (completedTransactionId === transactionId) {
        console.log('[TransactionDetail] Document completed, refreshing transaction report');
        // Clear the cached report first to force a fresh fetch
        setTransactionReport(completedTransactionId, null);
        // Fetch the updated report
        fetchTransactionReport(completedTransactionId).catch((error) => {
          console.log('[TransactionDetail] Failed to refresh report after document completion:', error);
        });
      }
    },
    [transactionId, setTransactionReport, fetchTransactionReport]
  );

  // Subscribe to document completion events
  useEffect(() => {
    const unsubscribe = onDocumentCompleted(handleDocumentCompleted);
    return unsubscribe;
  }, [onDocumentCompleted, handleDocumentCompleted]);

  // Refresh the transaction report when a document is deleted
  // The backend regenerates the report after document deletion to update key dates
  const handleDocumentDeleted = useCallback(
    (_documentId: string, deletedTransactionId: string) => {
      // Only refresh if it's for this transaction
      if (deletedTransactionId === transactionId) {
        console.log('[TransactionDetail] Document deleted, refreshing transaction report');
        // Clear the cached report first to force a fresh fetch
        setTransactionReport(deletedTransactionId, null);
        // Fetch the updated report
        fetchTransactionReport(deletedTransactionId).catch((error) => {
          console.log('[TransactionDetail] Failed to refresh report after document deletion:', error);
        });
      }
    },
    [transactionId, setTransactionReport, fetchTransactionReport]
  );

  // Subscribe to document deletion events
  useEffect(() => {
    const unsubscribe = onDocumentDeleted(handleDocumentDeleted);
    return unsubscribe;
  }, [onDocumentDeleted, handleDocumentDeleted]);

  const isLoading = isLoadingTransaction || isFetchingDocuments || isLoadingReport;

  return {
    currentTransaction,
    currentTransactionDocuments,
    currentTransactionReport,
    isLoading,
  };
};
