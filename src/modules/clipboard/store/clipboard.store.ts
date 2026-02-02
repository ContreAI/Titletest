import { create } from 'zustand';
import { ClipboardStore } from '../typings/clipboard.types';

/**
 * Clipboard Store
 * Core clipboard functionality without React dependencies
 */
export const useClipboardStore = create<ClipboardStore>((_set, _get) => ({
  copyToClipboard: async (text: string): Promise<boolean> => {
    if (!text || text.trim() === '') {
      return false;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            return true;
          } else {
            throw new Error('Copy command failed');
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error: any) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  },
}));

