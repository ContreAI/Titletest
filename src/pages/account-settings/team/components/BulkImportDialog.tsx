import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  dialogClasses,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import FileDropZone from 'components/base/FileDropZone';
import {
  useTeamInvites,
  parseCsvFile,
  downloadCsvTemplate,
  convertRowsToPayload,
  MAX_CSV_ROWS,
  type CsvValidationResult,
  type ParsedCsvRow,
} from 'modules/team';

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = ['Upload CSV', 'Review & Validate', 'Confirm'];

const BulkImportDialog = ({ open, onClose }: BulkImportDialogProps) => {
  const { sendBulkInvites, isInviting } = useTeamInvites();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [_file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ sent: number; failed: number } | null>(null);

  const handleClose = () => {
    setActiveStep(0);
    setFile(null);
    setValidationResult(null);
    setError(null);
    setImportResult(null);
    onClose();
  };

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const selectedFile = files[0];
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);

    try {
      const result = await parseCsvFile(selectedFile);
      setValidationResult(result);
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleImport = async () => {
    if (!validationResult) return;

    setError(null);
    try {
      const payload = convertRowsToPayload(validationResult.rows);
      const result = await sendBulkInvites(payload);
      setImportResult(result);
      setActiveStep(2);
      enqueueSnackbar(
        `Successfully sent ${result.sent} invite${result.sent !== 1 ? 's' : ''}`,
        { variant: 'success' }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import invites');
    }
  };

  const renderUploadStep = () => (
    <Stack spacing={3}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a CSV file with team member information. Maximum {MAX_CSV_ROWS} rows.
        </Typography>
        <Button
          variant="text"
          size="small"
          startIcon={<IconifyIcon icon="mdi:download" />}
          onClick={downloadCsvTemplate}
        >
          Download Template
        </Button>
      </Box>

      <FileDropZone
        onDrop={handleFileSelect}
        accept={{ 'text/csv': ['.csv'] }}
        maxFiles={1}
        disabled={isProcessing}
      />

      {isProcessing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Processing CSV...
          </Typography>
        </Box>
      )}
    </Stack>
  );

  const renderValidationStep = () => {
    if (!validationResult) return null;

    const { rows, validRows, invalidRows, totalRows } = validationResult;

    return (
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`${totalRows} total rows`}
            variant="outlined"
          />
          <Chip
            label={`${validRows} valid`}
            color="success"
            variant="outlined"
          />
          {invalidRows > 0 && (
            <Chip
              label={`${invalidRows} invalid`}
              color="error"
              variant="outlined"
            />
          )}
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width={50}>#</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: ParsedCsvRow) => (
                <TableRow
                  key={row.rowIndex}
                  sx={{
                    bgcolor: row.isValid ? 'inherit' : 'error.lighter',
                  }}
                >
                  <TableCell>{row.rowIndex + 1}</TableCell>
                  <TableCell>{row.email || '-'}</TableCell>
                  <TableCell>{row.role || '-'}</TableCell>
                  <TableCell>
                    {[row.firstName, row.lastName].filter(Boolean).join(' ') || '-'}
                  </TableCell>
                  <TableCell>
                    {row.isValid ? (
                      <Chip label="Valid" color="success" size="small" />
                    ) : (
                      <Chip
                        label={row.errors.join(', ')}
                        color="error"
                        size="small"
                        sx={{ maxWidth: 200 }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {invalidRows > 0 && (
          <Alert severity="warning">
            {invalidRows} row(s) have validation errors and will be skipped.
            Only valid rows will be imported.
          </Alert>
        )}
      </Stack>
    );
  };

  const renderConfirmStep = () => (
    <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
      {importResult ? (
        <>
          <IconifyIcon
            icon="mdi:check-circle"
            sx={{ fontSize: 64, color: 'success.main' }}
          />
          <Typography variant="h6">Import Complete!</Typography>
          <Typography variant="body2" color="text.secondary">
            Successfully sent {importResult.sent} invite(s).
            {importResult.failed > 0 && ` ${importResult.failed} failed.`}
          </Typography>
        </>
      ) : (
        <CircularProgress />
      )}
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <IconifyIcon icon="mdi:file-upload-outline" sx={{ fontSize: 24 }} />
          Bulk Import Team Members
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && renderUploadStep()}
        {activeStep === 1 && renderValidationStep()}
        {activeStep === 2 && renderConfirmStep()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {activeStep === 0 && (
          <Button variant="soft" color="neutral" onClick={handleClose}>
            Cancel
          </Button>
        )}

        {activeStep === 1 && (
          <>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => {
                setActiveStep(0);
                setFile(null);
                setValidationResult(null);
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={isInviting || !validationResult || validationResult.validRows === 0}
              startIcon={
                isInviting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <IconifyIcon icon="mdi:send-outline" />
                )
              }
            >
              {isInviting
                ? 'Importing...'
                : `Import ${validationResult?.validRows || 0} Invite(s)`}
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkImportDialog;
