import { useSnackbar } from 'notistack';
import { useClipboardStore } from '../store/clipboard.store';

/**
 * Custom hook to access clipboard store with snackbar integration
 */
export const useClipboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const copyToClipboardStore = useClipboardStore((state) => state.copyToClipboard);

  const copyToClipboard = async (
    text: string,
    successMessage = 'Copied to clipboard',
    errorMessage = 'Failed to copy to clipboard'
  ): Promise<boolean> => {
    if (!text || text.trim() === '') {
      enqueueSnackbar('No content to copy', { variant: 'warning' });
      return false;
    }

    const success = await copyToClipboardStore(text);

    if (success) {
      enqueueSnackbar(successMessage, { variant: 'success' });
      return true;
    } else {
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    }
  };

  return { copyToClipboard };
};

