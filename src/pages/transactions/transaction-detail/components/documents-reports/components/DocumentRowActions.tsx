import { Stack, Button, IconButton, Tooltip } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import type { Document, DocumentSummaryDto } from 'modules/documents';
import { useDocumentDelete } from '../../document-card/hooks/useDocumentDelete';

interface DocumentRowActionsProps {
  doc: Document;
  hasReport: boolean;
  isProcessing: boolean;
  isNotProcessed: boolean;
  disableDelete: boolean;
  summary?: DocumentSummaryDto;
  onViewReport: (docId: string) => void;
  onViewOriginal: (docId: string) => void;
  onAnalyze: (docId: string) => void;
  onDownload: (docId: string) => void;
  onEmailReport: (docId: string) => void;
  onCopyReport: (docId: string, summary?: DocumentSummaryDto) => void;
}

// Common icon button styles
const iconButtonSx = {
  width: 28,
  height: 28,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1.5,
  bgcolor: 'background.paper',
  color: 'text.secondary',
  fontSize: '13px',
  '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
  '&:disabled': {
    borderColor: 'divider',
    color: 'action.disabled',
    bgcolor: 'background.paper',
    cursor: 'not-allowed',
  },
};

const DocumentRowActions = ({
  doc,
  hasReport,
  isProcessing,
  isNotProcessed,
  disableDelete,
  summary,
  onViewReport,
  onViewOriginal,
  onAnalyze,
  onDownload,
  onEmailReport,
  onCopyReport,
}: DocumentRowActionsProps) => {
  // Use the delete hook for this specific document
  const { handleDelete, isDeleting } = useDocumentDelete({ documentId: doc.id, transactionId: doc.transactionId });

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{
        flexShrink: 0,
        justifyContent: { xs: 'flex-start', md: 'flex-end' },
      }}
    >
      {/* View report - primary action */}
      <Button
        variant="contained"
        size="small"
        disabled={!hasReport}
        onClick={() => onViewReport(doc.id)}
        sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
          fontWeight: 500,
          px: 1.5,
          py: 0.75,
          minWidth: 'auto',
          minHeight: 28,
          borderRadius: 1.5,
          boxShadow: 'none',
          bgcolor: 'success.dark',
          '&:hover': {
            bgcolor: 'success.darker',
            boxShadow: 'none',
          },
          '&:disabled': {
            bgcolor: 'action.disabledBackground',
            color: 'action.disabled',
            cursor: 'not-allowed',
          },
        }}
      >
        View report
      </Button>

      {/* View original doc */}
      <Tooltip title="View original document" arrow>
        <IconButton size="small" onClick={() => onViewOriginal(doc.id)} sx={iconButtonSx} aria-label="View original document">
          <IconifyIcon icon="mdi:file-document-outline" width={14} height={14} />
        </IconButton>
      </Tooltip>

      {/* Analyze / Re-analyze */}
      <Tooltip title={isNotProcessed ? 'Analyze this document' : 'Re-analyze this document'} arrow>
        <span>
          <IconButton size="small" disabled={isProcessing} onClick={() => onAnalyze(doc.id)} sx={iconButtonSx} aria-label={isNotProcessed ? 'Analyze document' : 'Re-analyze document'}>
            <IconifyIcon icon="mdi:refresh" width={14} height={14} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Download Report */}
      <Tooltip title="Download report" arrow>
        <span>
          <IconButton size="small" disabled={!hasReport} onClick={() => onDownload(doc.id)} sx={iconButtonSx} aria-label="Download report">
            <IconifyIcon icon="mdi:download" width={14} height={14} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Email report */}
      <Tooltip title="Email report to client" arrow>
        <span>
          <IconButton size="small" disabled={!hasReport} onClick={() => onEmailReport(doc.id)} sx={iconButtonSx} aria-label="Email report to client">
            <IconifyIcon icon="mdi:email-outline" width={14} height={14} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Copy report */}
      <Tooltip title="Copy report text" arrow>
        <span>
          <IconButton size="small" disabled={!hasReport} onClick={() => onCopyReport(doc.id, summary)} sx={iconButtonSx} aria-label="Copy report text">
            <IconifyIcon icon="mdi:content-copy" width={14} height={14} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Delete - red variant */}
      <Tooltip title="Delete document and its report" arrow>
        <span>
          <IconButton
            size="small"
            onClick={handleDelete}
            disabled={disableDelete || isDeleting}
            aria-label="Delete document and its report"
            sx={{
              width: 28,
              height: 28,
              border: '1px solid',
              borderColor: 'error.lighter',
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              color: 'error.main',
              fontSize: '13px',
              '&:hover': {
                bgcolor: 'error.lighter',
                borderColor: 'error.light',
              },
              '&:disabled': {
                borderColor: 'divider',
                color: 'action.disabled',
                bgcolor: 'background.paper',
                cursor: 'not-allowed',
              },
            }}
          >
            <IconifyIcon icon="mdi:delete-outline" width={14} height={14} />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
};

export default DocumentRowActions;

