import { useEffect, useCallback } from 'react';
import { useDocuments } from './useDocuments';
import { documentSummaryControllerGetSummaryByDocument } from '@contreai/api-client';
import type { Document, DocumentSummaryDto } from '../typings/documents.types';

interface UseDocumentSummaryParams {
  documentId: string | null;
  documents: Document[];
  shouldFetch?: boolean;
}

/**
 * Hook for fetching and managing a single document summary
 */
export const useDocumentSummary = ({
  documentId,
  documents,
  shouldFetch = true,
}: UseDocumentSummaryParams) => {
  const { getSummary, setSummary } = useDocuments();

  // Get document and transactionId first for cache lookups
  const document = documentId ? documents.find((d) => d.id === documentId) || null : null;
  const transactionId = document?.transactionId || '';

  // Memoized fetch function
  const fetchSummary = useCallback(async (docId: string, txnId: string) => {
    try {
      // Generated client returns DocumentSummaryDto directly (no wrapper)
      const result = await documentSummaryControllerGetSummaryByDocument(docId);

      if (result) {
        console.log('[useDocumentSummary] Setting summary with content length:', result.summaryContent?.length || 0);
        setSummary(result.transactionId || txnId, docId, result);
      }
    } catch (error: any) {
      console.error('Failed to fetch summary:', error);
    }
  }, [setSummary]);

  // Fetch summary when documentId is provided and shouldFetch is true
  useEffect(() => {
    console.log('[useDocumentSummary] Effect running:', { shouldFetch, documentId, transactionId, docCount: documents.length });
    if (shouldFetch && documentId && transactionId) {
      const existingSummary = getSummary(transactionId, documentId);
      console.log('[useDocumentSummary] Existing summary:', existingSummary ? 'found' : 'not found');
      if (!existingSummary) {
        const doc = documents.find((d) => d.id === documentId);
        console.log('[useDocumentSummary] Document found:', doc ? { id: doc.id, parsedStatus: doc.parsedStatus } : 'null');
        if (doc && doc.parsedStatus === 'completed') {
          console.log('[useDocumentSummary] Fetching summary for document:', documentId);
          fetchSummary(documentId, transactionId);
        }
      }
    }
  }, [shouldFetch, documentId, transactionId, documents, getSummary, fetchSummary]);

  // Get summary using composite key
  const summary: DocumentSummaryDto | null = documentId && transactionId ? getSummary(transactionId, documentId) || null : null;

  return {
    document,
    summary,
  };
};

