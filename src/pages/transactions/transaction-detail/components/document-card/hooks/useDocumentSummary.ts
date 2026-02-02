import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useDocumentsStore } from 'modules/documents/store/documents.store';
import { useAuthStore } from 'modules/auth/store/auth.store';
import {
  useDocumentSummaryControllerGenerateSummary,
  documentSummaryControllerGetSummaryByDocument,
  type DocumentSummaryDto,
} from '@contreai/api-client';

export const useDocumentSummary = (documentId: string, isAnalyzed: boolean) => {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // SWR mutation hook for generating summaries
  const { trigger: generateSummaryTrigger, isMutating: isGenerating } =
    useDocumentSummaryControllerGenerateSummary();

  // Store for state management
  const { currentTransactionDocuments, setSummary, getSummary } = useDocumentsStore();
  const { user } = useAuthStore();

  const document = currentTransactionDocuments.find((doc) => doc.id === documentId);
  const transactionId = document?.transactionId || '';
  const summary = getSummary(transactionId, documentId);

  // Fallback to document.metadata.summary if no DocumentSummary exists
  const summaryContent = summary?.summaryContent || document?.metadata?.summary;

  // Helper to fetch summary - returns DocumentSummaryDto directly (no wrapper)
  const fetchSummary = useCallback(async (): Promise<DocumentSummaryDto | null> => {
    setIsFetchingSummary(true);
    try {
      const summaryResult = await documentSummaryControllerGetSummaryByDocument(documentId);
      return summaryResult || null;
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      return null;
    } finally {
      setIsFetchingSummary(false);
    }
  }, [documentId]);

  // Fetch summary on mount if analyzed
  useEffect(() => {
    if (isAnalyzed && !summary && transactionId) {
      console.log('Fetching summary for document:', documentId);
      fetchSummary().then((result) => {
        console.log('Summary fetched:', result);
        if (result) {
          setSummary(result.transactionId || transactionId, documentId, result);
        }
      });
    }
  }, [isAnalyzed, documentId, summary, transactionId, fetchSummary, setSummary]);

  const handleGenerateSummary = async () => {
    if (!user?.id) return;

    setIsPolling(true);
    try {
      // GenerateSummaryResponseDto is the data directly (no wrapper)
      const response = await generateSummaryTrigger({
        documentId: documentId,
        userId: user.id,
        userName: user.name || user.email || 'User',
      });
      console.log('Summary generation response:', response);

      const jobId = response?.jobId;
      console.log('Summary generation queued, jobId:', jobId);

      enqueueSnackbar('Summary generation started! Running in background...', {
        variant: 'info',
        autoHideDuration: 3000,
      });

      // Poll for summary after delays
      const pollIntervals = [3000, 5000, 8000, 10000];
      for (const delay of pollIntervals) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        const fetchedSummary = await fetchSummary();
        if (fetchedSummary?.generatedStatus === 'completed') {
          setSummary(fetchedSummary.transactionId || transactionId, documentId, fetchedSummary);
          enqueueSnackbar('Summary generation completed!', { variant: 'success' });
          break;
        }
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      enqueueSnackbar('Failed to generate summary', { variant: 'error' });
    } finally {
      setIsPolling(false);
    }
  };

  const handleViewSummary = async () => {
    if (!summaryOpen && !summary) {
      const result = await fetchSummary();
      if (result) {
        setSummary(result.transactionId || transactionId, documentId, result);
      }
    }
    setSummaryOpen(!summaryOpen);
  };

  return {
    summaryContent,
    summaryOpen,
    isPolling,
    isGenerating,
    isFetchingSummary,
    handleGenerateSummary,
    handleViewSummary,
  };
};
