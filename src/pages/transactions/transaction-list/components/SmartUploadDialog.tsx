/**
 * Smart Upload Dialog
 *
 * Handles the smart upload flow with address matching:
 * 1. Analyzing state - Show spinner while extracting address
 * 2. Matched state - Show best match, ask for confirmation
 * 3. No-match state - Show transaction picker
 * 4. Uploading state - Show upload progress
 * 5. Error state - Show error with fallback to picker
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { setPendingFile } from '../../create-transaction/pending-file-store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Paper,
  Chip,
  TextField,
  Divider,
  Alert,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Radio,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import IconifyIcon from 'components/base/IconifyIcon';
import { useSmartUpload, TransactionMatch } from '../hooks/useSmartUpload';

interface SmartUploadDialogProps {
  open: boolean;
  onClose: () => void;
  initialFile?: File;
}

interface UploadFormData {
  documentName: string;
}

/**
 * Get confidence color based on score
 */
const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
  if (confidence >= 0.85) return 'success';
  if (confidence >= 0.7) return 'warning';
  return 'error';
};

/**
 * Format confidence as percentage
 */
const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};

const SmartUploadDialog = ({ open, onClose, initialFile }: SmartUploadDialogProps) => {
  const navigate = useNavigate();
  const {
    dialogState,
    extractedAddress,
    bestMatch,
    alternativeMatches,
    selectedTransactionId,
    error,
    analyzeFile,
    selectTransaction,
    uploadToTransaction,
    reset,
  } = useSmartUpload();

  const [showPicker, setShowPicker] = useState(false);
  const hasNavigatedRef = useRef(false);

  const methods = useForm<UploadFormData>({
    defaultValues: {
      documentName: '',
    },
  });

  const { control, handleSubmit, setValue, reset: resetForm } = methods;

  // Auto-fill document name when file provided
  useEffect(() => {
    if (open && initialFile) {
      const fileNameWithoutExt = initialFile.name.replace(/\.[^/.]+$/, '');
      setValue('documentName', fileNameWithoutExt);
      // Start analyzing immediately
      analyzeFile(initialFile);
    }
  }, [open, initialFile, setValue, analyzeFile]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      resetForm();
      setShowPicker(false);
      hasNavigatedRef.current = false;
    }
  }, [open, reset, resetForm]);

  // Auto-navigate to create transaction when no match found but address extracted
  useEffect(() => {
    if (dialogState === 'no-match' && extractedAddress && !hasNavigatedRef.current) {
      // Mark as navigated to prevent double-navigation on re-renders
      hasNavigatedRef.current = true;

      // Store the actual file in the pending file store (File objects can't be serialized in navigation state)
      if (initialFile) {
        setPendingFile(initialFile);
      }

      // Navigate to create transaction with pre-filled address
      // Don't call reset/onClose - navigation will unmount this component
      navigate('/transactions/new', {
        state: {
          extractedAddress,
          hasPendingFile: !!initialFile,
        },
      });
    }
  }, [dialogState, extractedAddress, initialFile, navigate]);

  const handleClose = () => {
    reset();
    resetForm();
    setShowPicker(false);
    onClose();
  };

  const handleUpload = async (data: UploadFormData) => {
    if (!initialFile || !selectedTransactionId) return;

    // Note: documentType is not passed - AI will auto-classify the document
    const success = await uploadToTransaction(
      initialFile,
      selectedTransactionId,
      data.documentName
    );

    if (success) {
      handleClose();
    }
  };

  const handleSelectAlternative = (match: TransactionMatch) => {
    selectTransaction(match.transactionId);
    setShowPicker(false);
  };

  const renderAnalyzingState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <CircularProgress size={64} sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        Analyzing Document...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Extracting address to find matching transaction
      </Typography>
    </Box>
  );

  const renderMatchedState = () => {
    if (!bestMatch) return null;

    const selectedMatch =
      [...(bestMatch ? [bestMatch] : []), ...alternativeMatches].find(
        (m) => m.transactionId === selectedTransactionId
      ) || bestMatch;

    return (
      <Stack spacing={3} direction="column" sx={{ width: '100%' }}>
        {/* Extracted Address */}
        {extractedAddress && (
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Address found in document:
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {extractedAddress}
            </Typography>
          </Box>
        )}

        {/* Best Match Card */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderColor: `${getConfidenceColor(selectedMatch.confidence)}.main`,
            borderWidth: 2,
            bgcolor: `${getConfidenceColor(selectedMatch.confidence)}.lighter`,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedMatch.transactionName}
              </Typography>
              <Chip
                label={formatConfidence(selectedMatch.confidence)}
                color={getConfidenceColor(selectedMatch.confidence)}
                size="small"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {selectedMatch.propertyAddress}
            </Typography>
          </Stack>
        </Paper>

        {/* Alternative matches */}
        {alternativeMatches.length > 0 && !showPicker && (
          <Button
            variant="text"
            size="small"
            onClick={() => setShowPicker(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Choose different transaction ({alternativeMatches.length} other{' '}
            {alternativeMatches.length === 1 ? 'match' : 'matches'})
          </Button>
        )}

        {/* Transaction picker */}
        {showPicker && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select transaction:
            </Typography>
            <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
              {[bestMatch, ...alternativeMatches].map((match) => (
                <ListItemButton
                  key={match.transactionId}
                  selected={match.transactionId === selectedTransactionId}
                  onClick={() => handleSelectAlternative(match)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Radio checked={match.transactionId === selectedTransactionId} size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={match.transactionName}
                    secondary={match.propertyAddress}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip
                    label={formatConfidence(match.confidence)}
                    color={getConfidenceColor(match.confidence)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}

        <Divider />

        {/* Upload form - Document type is auto-classified by AI */}
        <FormProvider {...methods}>
          <Stack spacing={2}>
            <Controller
              name="documentName"
              control={control}
              rules={{ required: 'Document name is required', minLength: 3 }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Document Name"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Stack>
        </FormProvider>
      </Stack>
    );
  };

  const handleCreateNewTransaction = () => {
    // Store the actual file in the pending file store before navigating
    if (initialFile) {
      setPendingFile(initialFile);
    }

    handleClose();
    // Navigate to create transaction page with extracted address in state
    navigate('/transactions/new', {
      state: {
        extractedAddress,
        hasPendingFile: !!initialFile,
      },
    });
  };

  const renderNoMatchState = () => (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {extractedAddress ? (
        // Address found but no matching transaction
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              py: 2,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'info.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <IconifyIcon icon="material-symbols:search-off" width={32} color="info.main" />
            </Box>
            <Typography variant="h6" gutterBottom>
              No Matching Transaction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We found an address but no existing transaction matches it.
            </Typography>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Address found in document:
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {extractedAddress}
            </Typography>
          </Paper>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Create a new transaction with this address?
          </Typography>
        </>
      ) : (
        // Could not extract address
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 3,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'warning.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <IconifyIcon icon="material-symbols:location-off-outline" width={32} color="warning.main" />
          </Box>
          <Typography variant="h6" gutterBottom>
            No Address Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
            We couldn&apos;t extract a property address from this document. You can still create a new
            transaction manually.
          </Typography>
        </Box>
      )}
    </Stack>
  );

  const renderErrorState = () => (
    <Stack spacing={3}>
      <Alert severity="error">{error || 'An error occurred while analyzing the document'}</Alert>

      <Typography variant="body2" color="text.secondary">
        Please try again or upload the document from the transaction detail page.
      </Typography>
    </Stack>
  );

  const renderUploadingState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <CircularProgress size={64} sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        Uploading Document...
      </Typography>
    </Box>
  );

  const renderContent = () => {
    switch (dialogState) {
      case 'analyzing':
        return renderAnalyzingState();
      case 'matched':
        return renderMatchedState();
      case 'no-match':
        return renderNoMatchState();
      case 'error':
        return renderErrorState();
      case 'uploading':
        return renderUploadingState();
      case 'success':
        return null; // Dialog will close
      default:
        return null;
    }
  };

  const canUpload =
    (dialogState === 'matched' || dialogState === 'uploading') && selectedTransactionId && methods.formState.isValid;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: (theme) => theme.zIndex.modal }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'visible',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Smart Upload
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            aria-label="Close dialog"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 1,
              width: 36,
              height: 36,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <IconifyIcon icon="material-symbols:close" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 3, display: 'flex', flexDirection: 'column' }}>{renderContent()}</DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={dialogState === 'uploading'}
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            textTransform: 'none',
            px: 3,
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          Cancel
        </Button>

        {(dialogState === 'matched' || dialogState === 'uploading') && (
          <LoadingButton
            onClick={handleSubmit(handleUpload)}
            variant="contained"
            color="primary"
            loading={dialogState === 'uploading'}
            disabled={!canUpload || dialogState === 'uploading'}
            startIcon={<IconifyIcon icon="material-symbols:cloud-upload-outline" />}
            sx={{
              textTransform: 'none',
              px: 3,
            }}
          >
            Upload to This Transaction
          </LoadingButton>
        )}

        {dialogState === 'no-match' && (
          <Button
            onClick={handleCreateNewTransaction}
            variant="contained"
            color="primary"
            startIcon={<IconifyIcon icon="material-symbols:add" />}
            sx={{ textTransform: 'none', px: 3 }}
          >
            {extractedAddress ? 'Create New Transaction' : 'Create Manually'}
          </Button>
        )}

        {dialogState === 'error' && (
          <Button
            onClick={handleClose}
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none', px: 3 }}
          >
            OK
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SmartUploadDialog;
