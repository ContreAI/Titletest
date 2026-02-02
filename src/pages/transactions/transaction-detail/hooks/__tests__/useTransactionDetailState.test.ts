import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionDetailState } from '../useTransactionDetailState';

// Helper to create mock files
const createMockFile = (name: string, size: number = 1024): File => {
  const file = new File(['test content'], name, { type: 'application/pdf' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('useTransactionDetailState', () => {
  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useTransactionDetailState());

      expect(result.current.uploadDialogOpen).toBe(false);
      expect(result.current.reportDrawerOpen).toBe(false);
      expect(result.current.selectedDocumentId).toBeNull();
      expect(result.current.droppedFiles).toEqual([]);
    });
  });

  describe('upload dialog state', () => {
    it('should open upload dialog via setUploadDialogOpen', () => {
      const { result } = renderHook(() => useTransactionDetailState());

      act(() => {
        result.current.setUploadDialogOpen(true);
      });

      expect(result.current.uploadDialogOpen).toBe(true);
    });

    it('should close upload dialog via setUploadDialogOpen', () => {
      const { result } = renderHook(() => useTransactionDetailState());

      act(() => {
        result.current.setUploadDialogOpen(true);
      });

      act(() => {
        result.current.setUploadDialogOpen(false);
      });

      expect(result.current.uploadDialogOpen).toBe(false);
    });
  });

  describe('report drawer state', () => {
    it('should open report drawer and set document id via handleViewReport', () => {
      const { result } = renderHook(() => useTransactionDetailState());

      act(() => {
        result.current.handleViewReport('doc-123');
      });

      expect(result.current.reportDrawerOpen).toBe(true);
      expect(result.current.selectedDocumentId).toBe('doc-123');
    });

    it('should close report drawer and clear document id via handleCloseReportDrawer', () => {
      const { result } = renderHook(() => useTransactionDetailState());

      // Open first
      act(() => {
        result.current.handleViewReport('doc-123');
      });

      // Then close
      act(() => {
        result.current.handleCloseReportDrawer();
      });

      expect(result.current.reportDrawerOpen).toBe(false);
      expect(result.current.selectedDocumentId).toBeNull();
    });

    it('should update selected document when viewing different document', () => {
      const { result } = renderHook(() => useTransactionDetailState());

      act(() => {
        result.current.handleViewReport('doc-123');
      });

      expect(result.current.selectedDocumentId).toBe('doc-123');

      act(() => {
        result.current.handleViewReport('doc-456');
      });

      expect(result.current.selectedDocumentId).toBe('doc-456');
      expect(result.current.reportDrawerOpen).toBe(true);
    });
  });

  describe('page file drop handling', () => {
    it('should open upload dialog when files are dropped', () => {
      const { result } = renderHook(() => useTransactionDetailState());
      const mockFile = createMockFile('test.pdf');

      act(() => {
        result.current.handlePageFileDrop([mockFile]);
      });

      expect(result.current.uploadDialogOpen).toBe(true);
    });

    it('should store dropped files when files are dropped', () => {
      const { result } = renderHook(() => useTransactionDetailState());
      const mockFile1 = createMockFile('test1.pdf');
      const mockFile2 = createMockFile('test2.pdf');

      act(() => {
        result.current.handlePageFileDrop([mockFile1, mockFile2]);
      });

      expect(result.current.droppedFiles).toHaveLength(2);
      expect(result.current.droppedFiles[0]).toBe(mockFile1);
      expect(result.current.droppedFiles[1]).toBe(mockFile2);
    });

    it('should not open dialog when empty array is dropped', () => {
      const { result } = renderHook(() => useTransactionDetailState());

      act(() => {
        result.current.handlePageFileDrop([]);
      });

      expect(result.current.uploadDialogOpen).toBe(false);
      expect(result.current.droppedFiles).toEqual([]);
    });

    it('should clear dropped files via clearDroppedFiles', () => {
      const { result } = renderHook(() => useTransactionDetailState());
      const mockFile = createMockFile('test.pdf');

      // Drop file first
      act(() => {
        result.current.handlePageFileDrop([mockFile]);
      });

      expect(result.current.droppedFiles).toHaveLength(1);

      // Clear files
      act(() => {
        result.current.clearDroppedFiles();
      });

      expect(result.current.droppedFiles).toEqual([]);
    });

    it('should handle multiple drop operations', () => {
      const { result } = renderHook(() => useTransactionDetailState());
      const mockFile1 = createMockFile('test1.pdf');
      const mockFile2 = createMockFile('test2.pdf');

      // First drop
      act(() => {
        result.current.handlePageFileDrop([mockFile1]);
      });

      expect(result.current.droppedFiles).toEqual([mockFile1]);

      // Second drop replaces first
      act(() => {
        result.current.handlePageFileDrop([mockFile2]);
      });

      expect(result.current.droppedFiles).toEqual([mockFile2]);
    });
  });

  describe('combined state management', () => {
    it('should maintain independent state between dialogs', () => {
      const { result } = renderHook(() => useTransactionDetailState());

      // Open report drawer
      act(() => {
        result.current.handleViewReport('doc-123');
      });

      // Open upload dialog
      act(() => {
        result.current.setUploadDialogOpen(true);
      });

      // Both should be open
      expect(result.current.reportDrawerOpen).toBe(true);
      expect(result.current.uploadDialogOpen).toBe(true);

      // Close upload dialog
      act(() => {
        result.current.setUploadDialogOpen(false);
      });

      // Report drawer should still be open
      expect(result.current.reportDrawerOpen).toBe(true);
      expect(result.current.uploadDialogOpen).toBe(false);
    });

    it('should handle file drop while report drawer is open', () => {
      const { result } = renderHook(() => useTransactionDetailState());
      const mockFile = createMockFile('test.pdf');

      // Open report drawer first
      act(() => {
        result.current.handleViewReport('doc-123');
      });

      // Drop file
      act(() => {
        result.current.handlePageFileDrop([mockFile]);
      });

      // Both should be open
      expect(result.current.reportDrawerOpen).toBe(true);
      expect(result.current.uploadDialogOpen).toBe(true);
      expect(result.current.droppedFiles).toHaveLength(1);
    });
  });

  describe('callback stability', () => {
    it('should return stable callback references', () => {
      const { result, rerender } = renderHook(() => useTransactionDetailState());

      const initialHandlePageFileDrop = result.current.handlePageFileDrop;
      const initialClearDroppedFiles = result.current.clearDroppedFiles;

      rerender();

      expect(result.current.handlePageFileDrop).toBe(initialHandlePageFileDrop);
      expect(result.current.clearDroppedFiles).toBe(initialClearDroppedFiles);
    });
  });
});
