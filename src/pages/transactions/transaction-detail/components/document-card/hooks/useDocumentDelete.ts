import { useSnackbar } from 'notistack';
import { useDocumentControllerDeleteDocument } from '@contreai/api-client';
import { useDocuments } from 'modules/documents';

interface UseDocumentDeleteParams {
  documentId: string;
  transactionId?: string;
}

export const useDocumentDelete = ({ documentId }: UseDocumentDeleteParams) => {
  const { enqueueSnackbar } = useSnackbar();
  const { removeDocument } = useDocuments();
  const { trigger: deleteDocument, isMutating: isDeleting } = useDocumentControllerDeleteDocument(documentId);

  const handleDelete = async () => {
    // Optimistically remove from UI immediately
    removeDocument(documentId);
    enqueueSnackbar('Document deletion started...', { variant: 'info', autoHideDuration: 2000 });

    try {
      // Trigger background deletion job
      const response = await deleteDocument();
      // Cast to any since axios interceptor unwraps the response
      const result = response as any;

      if (result?.success) {
        enqueueSnackbar('Document deleted. Report will update automatically...', { variant: 'success' });
        // Report and documents will be automatically updated via notification listener
        // when the backend job completes (see notification.store.ts)
      }
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      enqueueSnackbar(error?.message || 'Failed to delete document', { variant: 'error' });
      // Note: Document was already removed from UI, but deletion failed
      // In a production app, you might want to restore it or show a retry option
    }
  };

  return {
    handleDelete,
    isDeleting,
  };
};
