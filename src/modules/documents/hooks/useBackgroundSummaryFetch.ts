import { useEffect, useRef } from 'react';
import { useDocuments } from './useDocuments';
import { documentSummaryControllerGetSummaryByDocument } from '@contreai/api-client';
import type { Document } from '../typings/documents.types';

interface UseBackgroundSummaryFetchParams {
  documents: Document[];
}

/**
 * Hook to automatically fetch and store summaries for processed documents in the background
 * This ensures summaries are available immediately when users click "View report" or "Copy report"
 */
export const useBackgroundSummaryFetch = ({ documents }: UseBackgroundSummaryFetchParams) => {
  const { getSummary, setSummary } = useDocuments();
  const fetchingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Filter for processed documents that don't have summaries yet
    // Use composite key (transactionId:documentId) for cache lookup
    const processedDocs = documents.filter(
      (doc) => doc.parsedStatus === 'completed' && !getSummary(doc.transactionId, doc.id) && !fetchingRef.current.has(doc.id)
    );

    if (processedDocs.length === 0) {
      return;
    }

    // Fetch summaries for all processed documents in parallel
    processedDocs.forEach((doc) => {
      fetchingRef.current.add(doc.id);

      documentSummaryControllerGetSummaryByDocument(doc.id)
        .then((summary) => {
          // Generated client returns DocumentSummaryDto directly (no wrapper)
          if (summary) {
            // Validate required fields - don't mask missing data
            if (!summary.documentType) {
              console.warn(`[BackgroundSummaryFetch] Missing documentType for document ${doc.id}`);
            }
            setSummary(doc.transactionId, doc.id, summary);
          }
        })
        .catch((error: any) => {
          // 404 is expected if summary doesn't exist yet
          if (error?.status !== 404) {
            console.warn(`[BackgroundSummaryFetch] Failed to fetch summary for document ${doc.id}:`, error);
          }
        })
        .finally(() => {
          fetchingRef.current.delete(doc.id);
        });
    });
  }, [documents, getSummary, setSummary]);
};
