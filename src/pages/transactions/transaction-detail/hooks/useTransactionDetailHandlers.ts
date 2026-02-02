import type { Document } from 'modules/documents';
import { useDocumentSummary } from 'modules/documents';
import { useTransactionDetailState } from './useTransactionDetailState';
import { useTransactionDetailHeaderHandlers } from './useTransactionDetailHeaderHandlers';
import { useTransactionDetailDocumentHandlers } from './useTransactionDetailDocumentHandlers';

interface UseTransactionDetailHandlersParams {
  transactionId: string | undefined;
  currentTransactionDocuments: Document[];
  aiSummaryData: {
    fullAiSummary: string;
  };
}

/**
 * Main hook that orchestrates all transaction detail handlers
 * Combines state management, summary fetching, and action handlers
 */
export const useTransactionDetailHandlers = ({
  transactionId,
  currentTransactionDocuments,
  aiSummaryData,
}: UseTransactionDetailHandlersParams) => {
  // State management
  const {
    uploadDialogOpen,
    reportDrawerOpen,
    selectedDocumentId,
    droppedFiles,
    setUploadDialogOpen,
    handleViewReport,
    handleCloseReportDrawer,
    handlePageFileDrop,
    clearDroppedFiles,
  } = useTransactionDetailState();

  // Summary fetching and management
  const { document: selectedDocument, summary: selectedSummary } = useDocumentSummary({
    documentId: selectedDocumentId,
    documents: currentTransactionDocuments,
    shouldFetch: reportDrawerOpen,
  });

  // Header action handlers
  const {
    handleCopySummary,
    handleGenerateReport,
    handleShare,
    handleDelete,
    isDeleting,
    isGeneratingReport,
  } = useTransactionDetailHeaderHandlers({
    transactionId,
    aiSummaryData,
  });

  // Document action handlers
  const {
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
    // Move dialog state
    moveDialogOpen,
    documentToMove,
    handleCloseMoveDialog,
    handleSelectTransactionForMove,
  } = useTransactionDetailDocumentHandlers({
    currentTransactionDocuments,
    selectedSummary,
    transactionId,
  });

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  return {
    // State
    uploadDialogOpen,
    reportDrawerOpen,
    selectedDocumentId,
    selectedDocument,
    selectedSummary,
    droppedFiles,
    // Setters
    setUploadDialogOpen,
    handleCloseReportDrawer,
    clearDroppedFiles,
    // Header handlers
    handleUploadClick,
    handleGenerateReport,
    handleShare,
    handleDelete,
    handleCopySummary,
    // Page-level handlers
    handlePageFileDrop,
    // Loading states
    isDeleting,
    isGeneratingReport,
    isReassigning,
    isDeletingAll,
    // Document handlers
    handleViewReport,
    handleViewOriginal,
    handleEmailReport,
    handleCopyReport,
    handleCopyReportFromDrawer,
    handleDownloadDoc,
    handleAnalyzeDoc,
    handleDeleteAll,
    // Address mismatch handlers
    handleKeepAddressMismatch,
    handleMoveToTransaction,
    handleCreateNewTransaction,
    // Move dialog state
    moveDialogOpen,
    documentToMove,
    handleCloseMoveDialog,
    handleSelectTransactionForMove,
    // Note: handleDeleteDoc is not needed - deletion is handled by useDocumentDelete hook in DocumentRow
  };
};
