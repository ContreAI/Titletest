/**
 * useDocumentReassign Hook
 *
 * Handles reassigning a document to a different transaction
 * Used when address mismatch is detected and user wants to move the document
 */

import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { getAxiosInstance } from '@contreai/api-client';
import { useDocuments } from './useDocuments';

interface ReassignDocumentResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    transactionId: string;
    documentName: string;
  };
}

interface UseDocumentReassignReturn {
  /** Reassign document to a different transaction */
  reassignDocument: (documentId: string, newTransactionId: string) => Promise<boolean>;
  /** Dismiss address mismatch alert (keep document in current transaction) */
  dismissAddressMismatch: (documentId: string) => Promise<boolean>;
  /** Whether a reassign operation is in progress */
  isReassigning: boolean;
}

/**
 * Hook for reassigning documents between transactions
 * Primarily used for resolving address mismatch alerts
 */
export const useDocumentReassign = (): UseDocumentReassignReturn => {
  const { enqueueSnackbar } = useSnackbar();
  const { removeDocument } = useDocuments();
  const [isReassigning, setIsReassigning] = useState(false);

  const reassignDocument = useCallback(async (documentId: string, newTransactionId: string): Promise<boolean> => {
    setIsReassigning(true);

    try {
      // Use getAxiosInstance() since generated function doesn't support body parameters
      // Note: axios interceptor unwraps response.data, so result is the data directly
      const result = await getAxiosInstance().post(
        `/api/v1/documents/${documentId}/reassign`,
        { newTransactionId }
      ) as unknown as ReassignDocumentResponse;

      if (result?.success !== false) {
        // Remove document from current transaction's list
        removeDocument(documentId);
        enqueueSnackbar('Document moved to new transaction', { variant: 'success' });
        return true;
      } else {
        enqueueSnackbar(result.message || 'Failed to move document', { variant: 'error' });
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { data?: { message?: string } })?.data?.message || 'Failed to move document';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setIsReassigning(false);
    }
  }, [enqueueSnackbar, removeDocument]);

  const dismissAddressMismatch = useCallback(async (documentId: string): Promise<boolean> => {
    setIsReassigning(true);

    try {
      // Clear the address mismatch by updating the document
      // Use getAxiosInstance() since UpdateDocumentDto doesn't have addressMismatch field
      await getAxiosInstance().put(`/api/v1/documents/${documentId}`, {
        addressMismatch: { detected: false }
      });

      enqueueSnackbar('Address mismatch dismissed', { variant: 'info' });
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to dismiss alert';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setIsReassigning(false);
    }
  }, [enqueueSnackbar]);

  return {
    reassignDocument,
    dismissAddressMismatch,
    isReassigning,
  };
};
