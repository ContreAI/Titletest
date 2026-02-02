import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import PageDropZone from '../PageDropZone';

// Create a minimal theme for testing
const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Helper to create a mock DragEvent
const createDragEvent = (type: string, files: File[] = []): DragEvent => {
  const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      types: files.length > 0 ? ['Files'] : [],
      files,
      dropEffect: 'none',
    },
    writable: true,
  });
  return event;
};

// Helper to create a mock File
const createMockFile = (name: string, size: number = 1024, type: string = 'application/pdf'): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('PageDropZone', () => {
  const mockOnFileDrop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render children', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div data-testid="child-content">Child Content</div>
        </PageDropZone>
      );

      expect(screen.getByTestId('child-content')).toBeTruthy();
    });

    it('should not show overlay by default', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      expect(screen.queryByRole('region')).toBeNull();
    });
  });

  describe('drag events', () => {
    it('should show overlay when files are dragged over', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');
      const dragEnterEvent = createDragEvent('dragenter', [mockFile]);

      act(() => {
        document.dispatchEvent(dragEnterEvent);
      });

      expect(screen.getByRole('region')).toBeTruthy();
      expect(screen.getByText('Drop files to upload')).toBeTruthy();
    });

    it('should hide overlay when drag leaves', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
      });

      expect(screen.getByRole('region')).toBeTruthy();

      act(() => {
        document.dispatchEvent(createDragEvent('dragleave'));
      });

      expect(screen.queryByRole('region')).toBeNull();
    });

    it('should not show overlay for non-file drag events', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      // Create drag event without files
      const dragEnterEvent = createDragEvent('dragenter', []);

      act(() => {
        document.dispatchEvent(dragEnterEvent);
      });

      expect(screen.queryByRole('region')).toBeNull();
    });

    it('should not show overlay when disabled', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop} enabled={false}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');
      const dragEnterEvent = createDragEvent('dragenter', [mockFile]);

      act(() => {
        document.dispatchEvent(dragEnterEvent);
      });

      expect(screen.queryByRole('region')).toBeNull();
    });
  });

  describe('file drop', () => {
    it('should call onFileDrop when files are dropped', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
      });

      const dropEvent = createDragEvent('drop', [mockFile]);

      act(() => {
        document.dispatchEvent(dropEvent);
      });

      expect(mockOnFileDrop).toHaveBeenCalledTimes(1);
      expect(mockOnFileDrop).toHaveBeenCalledWith([mockFile]);
    });

    it('should hide overlay after drop', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
      });

      expect(screen.getByRole('region')).toBeTruthy();

      act(() => {
        document.dispatchEvent(createDragEvent('drop', [mockFile]));
      });

      expect(screen.queryByRole('region')).toBeNull();
    });

    it('should not call onFileDrop when disabled', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop} enabled={false}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');
      const dropEvent = createDragEvent('drop', [mockFile]);

      act(() => {
        document.dispatchEvent(dropEvent);
      });

      expect(mockOnFileDrop).not.toHaveBeenCalled();
    });
  });

  describe('file filtering', () => {
    it('should filter files by accepted types', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop} accept=".pdf,.doc">
          <div>Content</div>
        </PageDropZone>
      );

      const pdfFile = createMockFile('document.pdf', 1024, 'application/pdf');
      const txtFile = createMockFile('notes.txt', 512, 'text/plain');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [pdfFile, txtFile]));
      });

      act(() => {
        document.dispatchEvent(createDragEvent('drop', [pdfFile, txtFile]));
      });

      expect(mockOnFileDrop).toHaveBeenCalledWith([pdfFile]);
    });

    it('should filter files by max size', () => {
      const maxSize = 1000; // 1000 bytes

      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop} maxSize={maxSize}>
          <div>Content</div>
        </PageDropZone>
      );

      const smallFile = createMockFile('small.pdf', 500);
      const largeFile = createMockFile('large.pdf', 2000);

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [smallFile, largeFile]));
      });

      act(() => {
        document.dispatchEvent(createDragEvent('drop', [smallFile, largeFile]));
      });

      expect(mockOnFileDrop).toHaveBeenCalledWith([smallFile]);
    });

    it('should not call onFileDrop if no files pass filter', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop} accept=".pdf">
          <div>Content</div>
        </PageDropZone>
      );

      const txtFile = createMockFile('notes.txt', 512, 'text/plain');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [txtFile]));
      });

      act(() => {
        document.dispatchEvent(createDragEvent('drop', [txtFile]));
      });

      expect(mockOnFileDrop).not.toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should dismiss overlay on Escape key', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
      });

      expect(screen.getByRole('region')).toBeTruthy();

      act(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
      });

      expect(screen.queryByRole('region')).toBeNull();
    });
  });

  describe('drag counter behavior', () => {
    it('should handle nested drag enter/leave events correctly', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');

      // Simulate multiple nested drag enters (as would happen with nested elements)
      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
      });

      expect(screen.getByRole('region')).toBeTruthy();

      // Simulate drag leaves - overlay should stay until counter reaches 0
      act(() => {
        document.dispatchEvent(createDragEvent('dragleave'));
      });
      expect(screen.getByRole('region')).toBeTruthy();

      act(() => {
        document.dispatchEvent(createDragEvent('dragleave'));
      });
      expect(screen.getByRole('region')).toBeTruthy();

      act(() => {
        document.dispatchEvent(createDragEvent('dragleave'));
      });
      expect(screen.queryByRole('region')).toBeNull();
    });

    it('should not go negative on extra drag leave events', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      // Fire more drag leaves than enters
      act(() => {
        document.dispatchEvent(createDragEvent('dragleave'));
        document.dispatchEvent(createDragEvent('dragleave'));
        document.dispatchEvent(createDragEvent('dragleave'));
      });

      // Should not crash and overlay should remain hidden
      expect(screen.queryByRole('region')).toBeNull();

      // Should still work for new drag operations
      const mockFile = createMockFile('test.pdf');
      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
      });
      expect(screen.getByRole('region')).toBeTruthy();
    });
  });

  describe('enabled state changes', () => {
    it('should reset state when enabled changes to false', () => {
      const { rerender } = renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop} enabled={true}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
      });

      expect(screen.getByRole('region')).toBeTruthy();

      // Disable the component
      rerender(
        <ThemeProvider theme={theme}>
          <PageDropZone onFileDrop={mockOnFileDrop} enabled={false}>
            <div>Content</div>
          </PageDropZone>
        </ThemeProvider>
      );

      expect(screen.queryByRole('region')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes on overlay', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
      });

      const overlay = screen.getByRole('region');
      expect(overlay.getAttribute('aria-label')).toBe('Drop zone active - release files to upload');
      expect(overlay.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('file extension handling', () => {
    it('should handle files without extensions', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop} accept=".pdf">
          <div>Content</div>
        </PageDropZone>
      );

      const noExtFile = createMockFile('README', 512, '');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [noExtFile]));
      });

      act(() => {
        document.dispatchEvent(createDragEvent('drop', [noExtFile]));
      });

      // File without extension should not match .pdf filter
      expect(mockOnFileDrop).not.toHaveBeenCalled();
    });

    it('should handle files with multiple dots in name', () => {
      renderWithTheme(
        <PageDropZone onFileDrop={mockOnFileDrop} accept=".pdf">
          <div>Content</div>
        </PageDropZone>
      );

      const multiDotFile = createMockFile('document.v2.final.pdf', 1024, 'application/pdf');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [multiDotFile]));
      });

      act(() => {
        document.dispatchEvent(createDragEvent('drop', [multiDotFile]));
      });

      expect(mockOnFileDrop).toHaveBeenCalledWith([multiDotFile]);
    });
  });

  describe('error handling', () => {
    it('should handle errors in onFileDrop callback gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithTheme(
        <PageDropZone onFileDrop={errorCallback}>
          <div>Content</div>
        </PageDropZone>
      );

      const mockFile = createMockFile('test.pdf');

      act(() => {
        document.dispatchEvent(createDragEvent('dragenter', [mockFile]));
      });

      // Should not throw
      expect(() => {
        act(() => {
          document.dispatchEvent(createDragEvent('drop', [mockFile]));
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Error in onFileDrop callback:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
