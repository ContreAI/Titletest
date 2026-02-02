import { useRef, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTransactionReports, ReportGenerationJob } from 'modules/transaction-reports';
import { useClipboard } from 'modules/clipboard';
import { useTransactionControllerDeleteTransaction } from '@contreai/api-client';
import axiosInstance from 'services/axios/axiosInstance';

interface UseTransactionDetailHeaderHandlersParams {
  transactionId: string | undefined;
  aiSummaryData: {
    fullAiSummary: string;
  };
}

// Polling configuration
const POLL_INTERVAL_MS = 2000; // Poll every 2 seconds
const MAX_POLL_ATTEMPTS = 60; // Max 2 minutes of polling (60 * 2s)

/**
 * Hook for transaction detail header action handlers
 */
export const useTransactionDetailHeaderHandlers = ({
  transactionId,
  aiSummaryData,
}: UseTransactionDetailHeaderHandlersParams) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { fetchTransactionReport, setActiveJob, pollJobStatus, setTransactionReport } = useTransactionReports();
  const { copyToClipboard } = useClipboard();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { trigger: deleteTransaction, isMutating: isDeleting } = useTransactionControllerDeleteTransaction(transactionId || '');

  const handleCopySummary = async () => {
    await copyToClipboard(aiSummaryData.fullAiSummary, 'Summary copied to clipboard');
  };

  // Stop polling and clean up
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Start polling for job status
  const startPolling = useCallback((jobId: string, txnId: string) => {
    let attempts = 0;

    const poll = async () => {
      attempts++;

      if (attempts > MAX_POLL_ATTEMPTS) {
        stopPolling();
        setIsGeneratingReport(false);
        setActiveJob(txnId, null);
        enqueueSnackbar('Report generation timed out. Please try again.', { variant: 'warning' });
        return;
      }

      const jobStatus = await pollJobStatus(jobId, txnId);

      if (!jobStatus) {
        // Error polling - stop
        stopPolling();
        setIsGeneratingReport(false);
        return;
      }

      if (jobStatus.status === 'completed') {
        stopPolling();
        setIsGeneratingReport(false);
        enqueueSnackbar('Report generated successfully!', { variant: 'success' });
        // Clear cached report so it gets re-fetched
        setTransactionReport(txnId, null);
        // Fetch the newly generated report
        await fetchTransactionReport(txnId);
      } else if (jobStatus.status === 'failed') {
        stopPolling();
        setIsGeneratingReport(false);
        enqueueSnackbar(`Report generation failed: ${jobStatus.error || 'Unknown error'}`, { variant: 'error' });
      }
      // Otherwise, continue polling (waiting, active, delayed, queued)
    };

    // Start the interval
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    // Also poll immediately
    poll();
  }, [stopPolling, pollJobStatus, setActiveJob, setTransactionReport, fetchTransactionReport, enqueueSnackbar]);

  const handleGenerateReport = async () => {
    if (!transactionId) return;

    try {
      setIsGeneratingReport(true);

      // Call the API to queue the job
      const response = await axiosInstance.post('/api/v1/transaction-reports/generate', {
        transactionId,
      }) as { jobId: string; transactionId: string; status: string; message: string };

      // Store the active job
      const job: ReportGenerationJob = {
        jobId: response.jobId,
        transactionId: response.transactionId,
        status: response.status as ReportGenerationJob['status'],
        progress: 0,
      };
      setActiveJob(transactionId, job);

      enqueueSnackbar('Report generation started. Tracking progress...', { variant: 'info' });

      // Start polling for status
      startPolling(response.jobId, transactionId);
    } catch {
      setIsGeneratingReport(false);
      enqueueSnackbar('Failed to start report generation. Please try again.', { variant: 'error' });
    }
  };

  const handleShare = async () => {
    await copyToClipboard(window.location.href, 'Page URL copied to clipboard');
  };

  const handleDelete = async () => {
    if (!transactionId) return;
    try {
      await deleteTransaction();
      enqueueSnackbar('Transaction deleted successfully', { variant: 'success' });
      navigate('/transactions');
    } catch {
      enqueueSnackbar('Failed to delete transaction. Please try again.', { variant: 'error' });
    }
  };

  return {
    handleCopySummary,
    handleGenerateReport,
    handleShare,
    handleDelete,
    isDeleting,
    isGeneratingReport,
  };
};

