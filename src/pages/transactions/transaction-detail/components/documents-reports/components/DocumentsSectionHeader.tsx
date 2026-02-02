import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface DocumentsSectionHeaderProps {
  totalDocs: number;
  processedDocs: number;
  docsNeedingAttention: number;
  onUploadClick: () => void;
  onDeleteAll: () => void;
  onMoreActionsClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  moreActionsAnchor: HTMLElement | null;
  onMoreActionsClose: () => void;
  disableUpload?: boolean;
}

const DocumentsSectionHeader = ({
  totalDocs,
  processedDocs,
  docsNeedingAttention,
  onUploadClick,
  onDeleteAll,
  onMoreActionsClick,
  moreActionsAnchor,
  onMoreActionsClose,
  disableUpload = false,
}: DocumentsSectionHeaderProps) => {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleDeleteAllClick = () => {
    onMoreActionsClose();
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    onDeleteAll();
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
  };
  // Format the summary text
  const getSummaryText = () => {
    if (totalDocs === 0) {
      return 'Upload documents to generate client-ready reports.';
    }
    let text = `${totalDocs} document${totalDocs === 1 ? '' : 's'} · ${processedDocs} processed`;
    if (docsNeedingAttention > 0) {
      text += ` · ${docsNeedingAttention} need attention`;
    }
    return text;
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
      sx={{ mb: 2.5 }}
    >
      {/* Left: Title + counts */}
      <Box>
              <Typography
                component="h2"
                variant="h5"
                sx={{
                  fontWeight: 400,
                  color: 'text.primary',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              >
                Documents & Reports
              </Typography>
              <Typography
                component="p"
                variant="caption"
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                }}
              >
          {getSummaryText()}
        </Typography>
      </Box>

      {/* Right: Upload + More actions */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          variant="contained"
          size="small"
          startIcon={<IconifyIcon icon="mdi:upload" width={16} height={16} />}
          onClick={onUploadClick}
          disabled={disableUpload}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 500,
            px: 2,
            py: 0.875,
            bgcolor: 'success.dark',
            borderRadius: 1.5,
            boxShadow: 'none',
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
          Upload documents
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={onMoreActionsClick}
          endIcon={<IconifyIcon icon="mdi:chevron-down" width={14} height={14} />}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 500,
            px: 1.5,
            py: 0.875,
            borderColor: 'divider',
            borderRadius: 1.5,
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          More actions
        </Button>
        <Menu
          anchorEl={moreActionsAnchor}
          open={Boolean(moreActionsAnchor)}
          onClose={onMoreActionsClose}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              onMoreActionsClose();
              onUploadClick();
            }}
            sx={{ fontSize: '0.8125rem' }}
          >
            Upload multiple
          </MenuItem>
          <MenuItem
            onClick={handleDeleteAllClick}
            disabled={totalDocs === 0}
            sx={{ fontSize: '0.8125rem', color: 'error.main' }}
          >
            Delete all documents
          </MenuItem>
        </Menu>
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-all-dialog-title"
        aria-describedby="delete-all-dialog-description"
      >
        <DialogTitle id="delete-all-dialog-title">Delete all documents?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-all-dialog-description">
            This will permanently delete all {totalDocs} document{totalDocs === 1 ? '' : 's'} from this
            transaction. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Delete all
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default DocumentsSectionHeader;

