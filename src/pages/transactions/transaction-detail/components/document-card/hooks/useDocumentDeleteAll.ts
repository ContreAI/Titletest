import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { getAxiosInstance } from '@contreai/api-client';
import { useDocuments } from 'modules/documents';

interface UseDocumentDeleteAllParams {
  transactionId: string;
}

interface DeleteAllResponse {
  message: string;
  deletedCount: number;
}

export const useDocumentDeleteAll = ({ transactionId }: UseDocumentDeleteAllParams) => {
  const { enqueueSnackbar } = useSnackbar();
  const { clearDocuments } = useDocuments();
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDeleteAll = async () => {
    if (!transactionId) {
      enqueueSnackbar('No transaction selected', { variant: 'error' });
      return;
    }

    setIsDeletingAll(true);
    // Optimistically clear documents from UI
    clearDocuments();
    enqueueSnackbar('Deleting all documents...', { variant: 'info', autoHideDuration: 2000 });

    try {
      const axios = getAxiosInstance();
      // Note: axios interceptor unwraps response.data, so result is the data directly
      const result = await axios.delete<DeleteAllResponse>(
        `/api/v1/documents/transaction/${transactionId}/all`
      ) as unknown as DeleteAllResponse;

      if (result?.deletedCount > 0) {
        enqueueSnackbar(result.message || 'All documents deleted successfully', { variant: 'success' });
      } else {
        enqueueSnackbar('No documents to delete', { variant: 'info' });
      }
    } catch (error: unknown) {
      console.error('Failed to delete all documents:', error);
      const errorMessage = (error as { data?: { message?: string }; message?: string })?.data?.message
        || (error as { message?: string })?.message
        || 'Failed to delete documents';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsDeletingAll(false);
    }
  };

  return {
    handleDeleteAll,
    isDeletingAll,
  };
};
