import { useState, useCallback } from 'react';

/**
 * Hook for managing transaction detail page state
 */
export const useTransactionDetailState = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

  const handleViewReport = (docId: string) => {
    setSelectedDocumentId(docId);
    setReportDrawerOpen(true);
  };

  const handleCloseReportDrawer = () => {
    setReportDrawerOpen(false);
    setSelectedDocumentId(null);
  };

  /**
   * Handle files dropped on the page - opens upload dialog with pre-selected file
   */
  const handlePageFileDrop = useCallback((files: File[]) => {
    if (files.length > 0) {
      setDroppedFiles(files);
      setUploadDialogOpen(true);
    }
  }, []);

  /**
   * Clear dropped files when dialog closes
   */
  const clearDroppedFiles = useCallback(() => {
    setDroppedFiles([]);
  }, []);

  return {
    uploadDialogOpen,
    reportDrawerOpen,
    selectedDocumentId,
    droppedFiles,
    setUploadDialogOpen,
    handleViewReport,
    handleCloseReportDrawer,
    handlePageFileDrop,
    clearDroppedFiles,
  };
};

