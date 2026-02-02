import { useEffect, useState, useCallback, ReactNode } from 'react';
import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface PageDropZoneProps {
  /** Callback when files are dropped */
  onFileDrop: (files: File[]) => void;
  /** Whether the drop zone is enabled */
  enabled?: boolean;
  /** Accepted file types (e.g., '.pdf,.doc,.docx') */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Content to render within the drop zone area */
  children: ReactNode;
}

/**
 * Full-page drop zone overlay that activates when files are dragged over the page.
 * Wraps page content and shows an overlay with drop target when dragging files.
 */
const PageDropZone = ({
  onFileDrop,
  enabled = true,
  accept,
  maxSize,
  children,
}: PageDropZoneProps) => {
  const theme = useTheme();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  // Note: dragCounter is used internally to track nested drag events but not read directly
  void dragCounter;

  const isFileTransfer = useCallback((event: DragEvent): boolean => {
    if (!event.dataTransfer) return false;
    // Check if the drag contains files
    return event.dataTransfer.types.includes('Files');
  }, []);

  const getFileExtension = useCallback((filename: string): string => {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === filename.length - 1) return '';
    return filename.substring(lastDot).toLowerCase();
  }, []);

  const isAcceptedFile = useCallback((file: File): boolean => {
    // Check file size if maxSize is specified
    if (maxSize && file.size > maxSize) return false;

    if (!accept) return true;
    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const fileExtension = getFileExtension(file.name);
    const fileMimeType = file.type.toLowerCase();

    return acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      if (type.includes('*')) {
        const [mainType] = type.split('/');
        return fileMimeType.startsWith(mainType + '/');
      }
      return fileMimeType === type;
    });
  }, [accept, maxSize, getFileExtension]);

  const handleDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!enabled || !isFileTransfer(event)) return;

    setDragCounter(prev => prev + 1);
    setIsDraggingOver(true);
  }, [enabled, isFileTransfer]);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setDragCounter(prev => {
      // Guard against going negative
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setIsDraggingOver(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDraggingOver(false);
    setDragCounter(0);

    if (!enabled || !event.dataTransfer) return;

    const files = Array.from(event.dataTransfer.files);
    const acceptedFiles = accept || maxSize ? files.filter(isAcceptedFile) : files;

    if (acceptedFiles.length > 0) {
      try {
        onFileDrop(acceptedFiles);
      } catch (error) {
        console.error('Error in onFileDrop callback:', error);
      }
    }
  }, [enabled, accept, maxSize, isAcceptedFile, onFileDrop]);

  // Handle keyboard escape to dismiss overlay
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isDraggingOver) {
      setIsDraggingOver(false);
      setDragCounter(0);
    }
  }, [isDraggingOver]);

  useEffect(() => {
    // Add listeners to document to capture drag events anywhere on the page
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleKeyDown]);

  // Reset state when enabled changes to false
  useEffect(() => {
    if (!enabled) {
      setIsDraggingOver(false);
      setDragCounter(0);
    }
  }, [enabled]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}

      {/* Full-page overlay when dragging */}
      {isDraggingOver && (
        <Box
          role="region"
          aria-label="Drop zone active - release files to upload"
          aria-live="polite"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: theme.zIndex.modal + 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.default, 0.95),
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)', // Safari support
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          <Box
            sx={{
              p: 6,
              borderRadius: 4,
              borderWidth: 3,
              borderStyle: 'dashed',
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              maxWidth: 500,
              width: '90%',
              textAlign: 'center',
              transition: theme.transitions.create(['border-color', 'background-color'], {
                duration: theme.transitions.duration.short,
              }),
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconifyIcon
                  icon="material-symbols:cloud-upload-outline"
                  sx={{
                    fontSize: 48,
                    color: 'primary.main',
                  }}
                />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                }}
              >
                Drop files to upload
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                Release to upload your documents
              </Typography>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PageDropZone;
