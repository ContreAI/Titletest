import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { getAxiosInstance } from '@contreai/api-client';
import { useDocuments, useDocumentReassign } from 'modules/documents';
import { useClipboard } from 'modules/clipboard';
import { generateDocumentReportPDF, downloadPDF } from '../utils/generateDocumentReportPDF';
import type { Document, DocumentSummaryDto } from 'modules/documents';
import paths from 'routes/paths';
import { useDocumentDeleteAll } from '../components/document-card/hooks';
import { useDocumentsStore } from 'modules/documents/store/documents.store';

interface UseTransactionDetailDocumentHandlersParams {
  currentTransactionDocuments: Document[];
  selectedSummary: DocumentSummaryDto | null;
  transactionId?: string;
}

/**
 * Hook for document action handlers
 */
export const useTransactionDetailDocumentHandlers = ({
  currentTransactionDocuments,
  selectedSummary,
  transactionId,
}: UseTransactionDetailDocumentHandlersParams) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { documentSummaries } = useDocuments();
  const { copyToClipboard } = useClipboard();
  const { dismissAddressMismatch, reassignDocument, isReassigning } = useDocumentReassign();
  const { handleDeleteAll, isDeletingAll } = useDocumentDeleteAll({ transactionId: transactionId || '' });

  // State for transaction select dialog
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null);

  const handleViewOriginal = (docId: string) => {
    const doc = currentTransactionDocuments.find((d) => d.id === docId);
    if (doc?.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
  };

  const handleEmailReport = (docId: string) => {
    const _doc = currentTransactionDocuments.find((d) => d.id === docId);
    // TODO: Call email report API
    void _doc; // Remove when implementing
  };

  const handleCopyReport = async (docId: string, summary?: DocumentSummaryDto) => {
    const reportSummary = summary || documentSummaries[docId];

    if (!reportSummary) {
      const doc = currentTransactionDocuments.find((d) => d.id === docId);
      if (!doc) {
        enqueueSnackbar('Document not found', { variant: 'error' });
        return;
      }

      if (doc.parsedStatus !== 'completed') {
        enqueueSnackbar('Document is not processed yet', { variant: 'warning' });
        return;
      }

      enqueueSnackbar('Report not available. Please view the report first to load it.', { variant: 'warning' });
      return;
    }

    const contentToCopy = reportSummary.summaryContent || '';
    if (!contentToCopy || contentToCopy.trim() === '') {
      enqueueSnackbar('No report content available', { variant: 'warning' });
      return;
    }

    await copyToClipboard(contentToCopy, 'Report copied to clipboard');
  };

  const handleCopyReportFromDrawer = async () => {
    if (!selectedSummary) {
      enqueueSnackbar('Report not available', { variant: 'warning' });
      return;
    }

    const contentToCopy = selectedSummary.summaryContent || '';
    if (!contentToCopy || contentToCopy.trim() === '') {
      enqueueSnackbar('No report content available', { variant: 'warning' });
      return;
    }

    await copyToClipboard(contentToCopy, 'Report copied to clipboard');
  };

  const handleDownloadDoc = async (docId: string) => {
    const doc = currentTransactionDocuments.find((d) => d.id === docId);
    if (!doc) {
      enqueueSnackbar('Document not found', { variant: 'error' });
      return;
    }

    // Get the document summary/report
    const summary = documentSummaries[docId];

    if (!summary) {
      if (doc.parsedStatus !== 'completed') {
        enqueueSnackbar('Document is not processed yet', { variant: 'warning' });
        return;
      }
      enqueueSnackbar('Report not available. Please view the report first to load it.', { variant: 'warning' });
      return;
    }

    try {
      // Generate PDF from document report (now async)
      const pdfBlob = await generateDocumentReportPDF(doc, summary);

      // Create filename
      const sanitizedDocName = doc.documentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedDocName}_report.pdf`;

      // Download the PDF
      downloadPDF(pdfBlob, filename);
      enqueueSnackbar('Report downloaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      enqueueSnackbar('Failed to generate PDF report', { variant: 'error' });
    }
  };

  const handleAnalyzeDoc = useCallback(async (docId: string) => {
    const doc = currentTransactionDocuments.find((d) => d.id === docId);
    if (!doc) {
      enqueueSnackbar('Document not found', { variant: 'error' });
      return;
    }

    // Check if document is already processing
    if (doc.parsedStatus === 'processing') {
      enqueueSnackbar('Document is already being analyzed', { variant: 'warning' });
      return;
    }

    try {
      // Optimistically update the document status in the store
      const updateDocument = useDocumentsStore.getState().updateDocument;
      updateDocument(docId, { parsedStatus: 'pending', processingStep: undefined, progressPercentage: 0 });

      enqueueSnackbar('Document analysis started', { variant: 'info' });

      // Call the reanalyze API
      await getAxiosInstance().post(`/api/v1/documents/${docId}/reanalyze`);
    } catch (error: unknown) {
      // Revert optimistic update on error
      const updateDocument = useDocumentsStore.getState().updateDocument;
      updateDocument(docId, { parsedStatus: doc.parsedStatus });

      const errorMessage = error instanceof Error
        ? error.message
        : (error as { data?: { message?: string } })?.data?.message || 'Failed to start document analysis';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  }, [currentTransactionDocuments, enqueueSnackbar]);

  /**
   * Handle "Keep" action on address mismatch alert
   * Dismisses the alert and keeps document in current transaction
   */
  const handleKeepAddressMismatch = useCallback(async (docId: string) => {
    await dismissAddressMismatch(docId);
  }, [dismissAddressMismatch]);

  /**
   * Handle "Move to Transaction" action on address mismatch alert
   * Opens transaction selection dialog
   */
  const handleMoveToTransaction = useCallback((docId: string) => {
    const doc = currentTransactionDocuments.find((d) => d.id === docId);
    if (doc) {
      setDocumentToMove(doc);
      setMoveDialogOpen(true);
    }
  }, [currentTransactionDocuments]);

  /**
   * Handle closing the move dialog
   */
  const handleCloseMoveDialog = useCallback(() => {
    setMoveDialogOpen(false);
    setDocumentToMove(null);
  }, []);

  /**
   * Handle selecting a transaction in the move dialog
   * Calls the reassign API
   */
  const handleSelectTransactionForMove = useCallback(async (newTransactionId: string) => {
    if (!documentToMove) return;

    const success = await reassignDocument(documentToMove.id, newTransactionId);
    if (success) {
      // Note: removeDocument is called internally by reassignDocument hook
      handleCloseMoveDialog();
    }
  }, [documentToMove, reassignDocument, handleCloseMoveDialog]);

  /**
   * Handle "Create New Transaction" action on address mismatch alert
   * Navigates to create transaction page with document address pre-filled
   */
  const handleCreateNewTransaction = useCallback((docId: string) => {
    const doc = currentTransactionDocuments.find((d) => d.id === docId);
    if (!doc?.addressMismatch?.documentAddress) {
      enqueueSnackbar('No address available from document', { variant: 'warning' });
      return;
    }

    // Store document info in sessionStorage for retrieval after transaction creation
    sessionStorage.setItem('pendingDocumentReassign', JSON.stringify({
      documentId: doc.id,
      documentName: doc.documentName,
      sourceTransactionId: transactionId,
      documentAddress: doc.addressMismatch.documentAddress,
    }));

    // Navigate to create transaction with address as query param
    const addressParam = encodeURIComponent(doc.addressMismatch.documentAddress);
    navigate(`${paths.createTransaction}?prefillAddress=${addressParam}&fromDocumentReassign=true`);
  }, [currentTransactionDocuments, transactionId, navigate, enqueueSnackbar]);

  return {
    handleViewOriginal,
    handleEmailReport,
    handleCopyReport,
    handleCopyReportFromDrawer,
    handleDownloadDoc,
    handleAnalyzeDoc,
    // Delete all handler
    handleDeleteAll,
    isDeletingAll,
    // Address mismatch handlers
    handleKeepAddressMismatch,
    handleMoveToTransaction,
    handleCreateNewTransaction,
    isReassigning,
    // Move dialog state and handlers
    moveDialogOpen,
    documentToMove,
    handleCloseMoveDialog,
    handleSelectTransactionForMove,
  };
};

