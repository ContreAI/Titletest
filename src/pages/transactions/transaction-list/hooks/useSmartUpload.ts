/**
 * useSmartUpload Hook
 *
 * Manages the smart upload flow:
 * 1. Extract address from dropped document
 * 2. Find matching transactions
 * 3. Confirm and upload to selected transaction
 */

import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { getAxiosInstance, useDocumentControllerUploadDocument } from '@contreai/api-client';
import { useDocuments } from 'modules/documents';

// TODO: Replace raw axios calls with generated API client functions once backend
// OpenAPI spec includes file parameters for address extraction endpoints.
// See: documentControllerStartAddressExtraction, documentControllerGetAddressExtractionStatus

export type SmartUploadState =
  | 'idle'
  | 'analyzing'
  | 'matched'
  | 'no-match'
  | 'uploading'
  | 'success'
  | 'error';

export interface TransactionMatch {
  transactionId: string;
  transactionName: string;
  propertyAddress: string;
  confidence: number;
  reason?: string;
}

export interface UseSmartUploadReturn {
  // State
  dialogState: SmartUploadState;
  extractedAddress: string | null;
  bestMatch: TransactionMatch | null;
  alternativeMatches: TransactionMatch[];
  selectedTransactionId: string | null;
  error: string | null;

  // Actions
  analyzeFile: (file: File) => Promise<void>;
  selectTransaction: (transactionId: string) => void;
  uploadToTransaction: (
    file: File,
    transactionId: string,
    documentName: string
  ) => Promise<boolean>;
  reset: () => void;
}

export const useSmartUpload = (): UseSmartUploadReturn => {
  const { enqueueSnackbar } = useSnackbar();
  const { addDocument } = useDocuments();
  const { trigger: uploadDocument } = useDocumentControllerUploadDocument();

  // State
  const [dialogState, setDialogState] = useState<SmartUploadState>('idle');
  const [extractedAddress, setExtractedAddress] = useState<string | null>(null);
  const [matches, setMatches] = useState<TransactionMatch[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state
  const reset = useCallback(() => {
    setDialogState('idle');
    setExtractedAddress(null);
    setMatches([]);
    setSelectedTransactionId(null);
    setError(null);
  }, []);

  // Poll for extraction status with exponential backoff
  const pollExtractionStatus = useCallback(
    async (jobId: string, maxAttempts = 30): Promise<{
      success: boolean;
      status: string;
      extractedAddress?: string;
      matches?: TransactionMatch[];
      error?: string;
    }> => {
      let attempt = 0;
      let delay = 1000; // Start with 1 second

      while (attempt < maxAttempts) {
        // API returns camelCase keys matching our frontend types
        const result = (await getAxiosInstance().get(`/api/v1/documents/address-extraction/${jobId}`)) as {
          success: boolean;
          status: string;
          extractedAddress?: string;
          matches?: TransactionMatch[];
          error?: string;
        };

        if (result.status === 'completed') {
          return result;
        }

        if (result.status === 'failed') {
          return {
            success: false,
            status: 'failed',
            error: result.error || 'Extraction failed',
          };
        }

        // Still pending/processing, wait and retry
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
        delay = Math.min(delay * 1.5, 5000); // Max 5 second delay
      }

      return {
        success: false,
        status: 'failed',
        error: 'Extraction timed out. Please try again.',
      };
    },
    []
  );

  // Analyze file to extract address and find matches (async webhook-based)
  const analyzeFile = useCallback(async (file: File) => {
    setDialogState('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Step 1: Start async extraction (returns immediately with jobId)
      const startResult = await getAxiosInstance().post('/api/v1/documents/start-address-extraction', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }) as { success: boolean; jobId?: string; message?: string };

      if (!startResult.success || !startResult.jobId) {
        setDialogState('error');
        setError(startResult.message || 'Failed to start document analysis');
        return;
      }

      // Step 2: Poll for completion (webhook processes in background)
      const result = await pollExtractionStatus(startResult.jobId);

      if (!result.success) {
        setDialogState('error');
        setError(result.error || 'Failed to analyze document');
        return;
      }

      setExtractedAddress(result.extractedAddress || null);

      if (result.matches && result.matches.length > 0) {
        setMatches(result.matches);
        setSelectedTransactionId(result.matches[0].transactionId);
        setDialogState('matched');
      } else {
        setMatches([]);
        setDialogState('no-match');
      }
    } catch (err) {
      console.error('Smart upload analysis failed:', err);
      setDialogState('error');
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze document. Please try again or upload manually.'
      );
    }
  }, [pollExtractionStatus]);

  // Select a transaction for upload
  const selectTransaction = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
  }, []);

  // Upload to selected transaction
  // Note: documentType is not passed - AI will auto-classify the document
  const uploadToTransaction = useCallback(
    async (
      file: File,
      transactionId: string,
      documentName: string
    ): Promise<boolean> => {
      setDialogState('uploading');
      setError(null);

      try {
        // UploadDocumentResponseDto is the document data directly (no wrapper)
        // Note: documentType is empty - AI will auto-classify the document during processing
        const docData = await uploadDocument({
          file,
          documentName: documentName,
          documentType: '', // Empty - AI auto-classification will determine type
          transactionId: transactionId,
        });

        // Map response to frontend Document type
        if (docData?.id) {
          const newDocument = {
            id: docData.id,
            transactionId: docData.transactionId || transactionId,
            documentName: docData.documentName,
            documentType: docData.documentType || 'Pending Classification',
            fileName: docData.documentName, // DocumentDto doesn't have fileName, use documentName
            filePath: docData.filePath,
            fileUrl: docData.fileUrl,
            fileSize: docData.fileSize,
            mimeType: docData.mimeType,
            parsedStatus: (docData.parsedStatus || 'pending') as 'pending' | 'processing' | 'completed' | 'error',
            metadata: {},
            parsedData: {},
            uploadedBy: docData.userId,
            createdAt: docData.createdAt || new Date().toISOString(),
            updatedAt: docData.updatedAt || new Date().toISOString(),
          };

          addDocument(newDocument);
        }

        setDialogState('success');
        enqueueSnackbar('Document uploaded successfully! Processing in background.', {
          variant: 'success',
        });

        return true;
      } catch (err) {
        console.error('Upload failed:', err);
        setDialogState('error');
        setError(
          err instanceof Error ? err.message : 'Failed to upload document. Please try again.'
        );
        enqueueSnackbar('Failed to upload document', { variant: 'error' });
        return false;
      }
    },
    [uploadDocument, addDocument, enqueueSnackbar]
  );

  // Computed values
  const bestMatch = matches.length > 0 ? matches[0] : null;
  const alternativeMatches = matches.slice(1);

  return {
    dialogState,
    extractedAddress,
    bestMatch,
    alternativeMatches,
    selectedTransactionId,
    error,
    analyzeFile,
    selectTransaction,
    uploadToTransaction,
    reset,
  };
};
