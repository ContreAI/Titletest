import { useState, ReactNode } from 'react';
import {
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { GenerateReportDialog, DeleteTransactionDialog } from './components';

export interface TransactionHeaderActionsProps {
  onUploadClick: () => void;
  onGenerateReport: () => void;
  onShare: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  isGeneratingReport?: boolean;
}

/**
 * Transaction header actions component - renders action buttons and dialogs
 * Can be used standalone or passed as actions prop to PageHeader
 */
const TransactionHeaderActions = ({
  onUploadClick,
  onGenerateReport,
  onShare,
  onDelete,
  isDeleting = false,
  isGeneratingReport = false,
}: TransactionHeaderActionsProps): ReactNode => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
  };

  const handleReportConfirm = () => {
    setReportDialogOpen(false);
    onGenerateReport();
  };

  const handleReportCancel = () => {
    setReportDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onDelete();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      {/* Upload Documents - Primary action (Spruce green) */}
      <Button
        variant="contained"
        size="small"
        color="primary"
        startIcon={!isMobile ? <IconifyIcon icon="mdi:upload" /> : undefined}
        onClick={onUploadClick}
      >
        {isMobile ? <IconifyIcon icon="mdi:upload" /> : 'Upload'}
      </Button>

      {/* Generate Full Report - Secondary prominent (River Stone) */}
      <Button
        variant="contained"
        size="small"
        color="secondary"
        startIcon={!isMobile ? <IconifyIcon icon="mdi:file-document-outline" /> : undefined}
        onClick={handleReportClick}
      >
        {isMobile ? <IconifyIcon icon="mdi:file-document-outline" /> : 'Full Report'}
      </Button>

      {/* Share Page - Outlined neutral */}
      <Button
        variant="outlined"
        size="small"
        color="inherit"
        startIcon={!isMobile ? <IconifyIcon icon="mdi:share-variant" /> : undefined}
        onClick={onShare}
        sx={{
          borderColor: 'divider',
          color: 'text.secondary',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        {isMobile ? <IconifyIcon icon="mdi:share-variant" /> : 'Share'}
      </Button>

      {/* Delete Transaction - Error color icon */}
      <IconButton
        size="small"
        onClick={handleDeleteClick}
        aria-label="Delete transaction"
        sx={{
          ml: 0.5,
          color: 'text.secondary',
          '&:hover': {
            color: 'error.main',
            bgcolor: 'error.lighter',
          },
        }}
      >
        <IconifyIcon icon="mdi:delete-outline" />
      </IconButton>

      <GenerateReportDialog
        open={reportDialogOpen}
        onClose={handleReportCancel}
        onConfirm={handleReportConfirm}
        isLoading={isGeneratingReport}
      />

      <DeleteTransactionDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
};

export default TransactionHeaderActions;
