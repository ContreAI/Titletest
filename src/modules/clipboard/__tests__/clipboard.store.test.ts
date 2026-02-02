import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useClipboardStore } from '../store/clipboard.store';

describe('Clipboard Store', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  describe('copyToClipboard', () => {
    it('should return false for empty text', async () => {
      const result = await useClipboardStore.getState().copyToClipboard('');
      expect(result).toBe(false);
    });

    it('should return false for whitespace-only text', async () => {
      const result = await useClipboardStore.getState().copyToClipboard('   ');
      expect(result).toBe(false);
    });

    it('should use modern clipboard API when available', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: {
            writeText: mockWriteText,
          },
        },
        writable: true,
      });

      const result = await useClipboardStore.getState().copyToClipboard('test text');

      expect(mockWriteText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    it('should return false when clipboard API fails', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Permission denied'));
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: {
            writeText: mockWriteText,
          },
        },
        writable: true,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await useClipboardStore.getState().copyToClipboard('test text');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should fallback to execCommand when clipboard API not available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: undefined,
        },
        writable: true,
      });

      const mockTextArea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
      };
      const mockCreateElement = vi.fn().mockReturnValue(mockTextArea);
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockExecCommand = vi.fn().mockReturnValue(true);

      vi.spyOn(document, 'createElement').mockImplementation(mockCreateElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
      // Define execCommand on document before spying (not available in jsdom)
      (document as any).execCommand = vi.fn();
      vi.spyOn(document, 'execCommand').mockImplementation(mockExecCommand);

      const result = await useClipboardStore.getState().copyToClipboard('test text');

      expect(mockCreateElement).toHaveBeenCalledWith('textarea');
      expect(mockTextArea.value).toBe('test text');
      expect(mockTextArea.focus).toHaveBeenCalled();
      expect(mockTextArea.select).toHaveBeenCalled();
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when execCommand fails', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: undefined,
        },
        writable: true,
      });

      const mockTextArea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockTextArea as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockTextArea as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockTextArea as any);
      // Define execCommand on document before spying (not available in jsdom)
      (document as any).execCommand = vi.fn();
      vi.spyOn(document, 'execCommand').mockReturnValue(false);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await useClipboardStore.getState().copyToClipboard('test text');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
