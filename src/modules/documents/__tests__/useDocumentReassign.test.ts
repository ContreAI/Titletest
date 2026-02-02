import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDocumentReassign } from '../hooks/useDocumentReassign';

// Mock dependencies
const mockEnqueueSnackbar = vi.fn();
const mockRemoveDocument = vi.fn();
const mockAxiosPost = vi.fn();
const mockAxiosPut = vi.fn();

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
  }),
}));

vi.mock('../hooks/useDocuments', () => ({
  useDocuments: () => ({
    removeDocument: mockRemoveDocument,
  }),
}));

vi.mock('@contreai/api-client', () => ({
  getAxiosInstance: () => ({
    post: (...args: unknown[]) => mockAxiosPost(...args),
    put: (...args: unknown[]) => mockAxiosPut(...args),
    get: vi.fn(),
    delete: vi.fn(),
  }),
}));

describe('useDocumentReassign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('reassignDocument', () => {
    it('should successfully reassign a document to a new transaction', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        success: true,
        data: {
          id: 'doc-1',
          transactionId: 'txn-2',
          documentName: 'Test Document',
        },
      });

      const { result } = renderHook(() => useDocumentReassign());

      expect(result.current.isReassigning).toBe(false);

      await act(async () => {
        const success = await result.current.reassignDocument('doc-1', 'txn-2');
        expect(success).toBe(true);
      });

      expect(mockAxiosPost).toHaveBeenCalledWith('/api/v1/documents/doc-1/reassign', {
        newTransactionId: 'txn-2',
      });
      expect(mockRemoveDocument).toHaveBeenCalledWith('doc-1');
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Document moved to new transaction',
        { variant: 'success' }
      );
    });

    it('should handle API failure gracefully', async () => {
      mockAxiosPost.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useDocumentReassign());

      await act(async () => {
        const success = await result.current.reassignDocument('doc-1', 'txn-2');
        expect(success).toBe(false);
      });

      expect(mockRemoveDocument).not.toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Network error', {
        variant: 'error',
      });
    });

    it('should handle API response with success=false', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        success: false,
        message: 'Document not found',
      });

      const { result } = renderHook(() => useDocumentReassign());

      await act(async () => {
        const success = await result.current.reassignDocument('doc-1', 'txn-2');
        expect(success).toBe(false);
      });

      expect(mockRemoveDocument).not.toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Document not found', {
        variant: 'error',
      });
    });

    it('should set isReassigning to true during operation', async () => {
      let resolvePromise: (value: unknown) => void;
      mockAxiosPost.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      );

      const { result } = renderHook(() => useDocumentReassign());

      expect(result.current.isReassigning).toBe(false);

      act(() => {
        result.current.reassignDocument('doc-1', 'txn-2');
      });

      await waitFor(() => {
        expect(result.current.isReassigning).toBe(true);
      });

      await act(async () => {
        resolvePromise!({ success: true });
      });

      await waitFor(() => {
        expect(result.current.isReassigning).toBe(false);
      });
    });
  });

  describe('dismissAddressMismatch', () => {
    it('should successfully dismiss address mismatch alert', async () => {
      mockAxiosPut.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useDocumentReassign());

      await act(async () => {
        const success = await result.current.dismissAddressMismatch('doc-1');
        expect(success).toBe(true);
      });

      expect(mockAxiosPut).toHaveBeenCalledWith('/api/v1/documents/doc-1', {
        addressMismatch: { detected: false },
      });
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Address mismatch dismissed',
        { variant: 'info' }
      );
    });

    it('should handle API failure gracefully', async () => {
      mockAxiosPut.mockRejectedValueOnce(new Error('Server error'));

      const { result } = renderHook(() => useDocumentReassign());

      await act(async () => {
        const success = await result.current.dismissAddressMismatch('doc-1');
        expect(success).toBe(false);
      });

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Server error', {
        variant: 'error',
      });
    });

    it('should set isReassigning to true during operation', async () => {
      let resolvePromise: (value: unknown) => void;
      mockAxiosPut.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      );

      const { result } = renderHook(() => useDocumentReassign());

      expect(result.current.isReassigning).toBe(false);

      act(() => {
        result.current.dismissAddressMismatch('doc-1');
      });

      await waitFor(() => {
        expect(result.current.isReassigning).toBe(true);
      });

      await act(async () => {
        resolvePromise!({ success: true });
      });

      await waitFor(() => {
        expect(result.current.isReassigning).toBe(false);
      });
    });
  });
});
