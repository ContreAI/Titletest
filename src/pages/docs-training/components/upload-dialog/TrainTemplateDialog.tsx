import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useDropzone } from 'react-dropzone';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useOcrTemplatesControllerTrainTemplate,
  useOcrTemplatesControllerGetTrainingStatus,
  type TrainingStatusDtoStatus,
} from '@contreai/api-client';
import type { DocumentCategory } from '../../data/categoriesData';

interface TrainTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  category: DocumentCategory | null;
  documentType: string;
  onSuccess?: () => void;
}

type TrainingStep = 'upload' | 'processing' | 'result';

interface TrainingResult {
  status: TrainingStatusDtoStatus;
  templateId?: string;
  templateName?: string;
  isExisting?: boolean;
  fieldCount?: number;
}

const TrainTemplateDialog = ({ open, onClose, category, documentType, onSuccess }: TrainTemplateDialogProps) => {
  const [step, setStep] = useState<TrainingStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { trigger: trainTemplate, isMutating } = useOcrTemplatesControllerTrainTemplate();

  // Poll for job status when we have a jobId and are in processing step
  const shouldPoll = step === 'processing' && jobId !== null;
  const { data: jobStatus } = useOcrTemplatesControllerGetTrainingStatus(jobId || '', {
    swr: {
      enabled: shouldPoll,
      refreshInterval: shouldPoll ? 2000 : 0,
    },
  });

  // Handle job status updates - GetTrainingStatusResponseDto is the data directly (no wrapper)
  useEffect(() => {
    if (!jobStatus) return;

    const { status, templateId, templateName, isExisting, fieldCount, errorMessage } = jobStatus;

    if (status === 'completed') {
      setResult({
        status,
        templateId,
        templateName,
        isExisting,
        fieldCount,
      });
      setStep('result');
      onSuccess?.();
    } else if (status === 'error') {
      setError(errorMessage || 'Training failed');
      setStep('upload');
      setJobId(null);
    }
  }, [jobStatus, onSuccess]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleTrain = async () => {
    if (!selectedFile) return;

    setStep('processing');
    setError(null);

    try {
      const response = await trainTemplate({
        file: selectedFile,
        category: category?.id || '',
        documentType,
      });

      // TrainTemplateResponseDto is TrainingJobDto directly (no wrapper)
      // TrainingJobDto: { jobId: string, status, fileName, message? }
      if (response?.jobId) {
        setJobId(response.jobId);
      } else {
        console.error('Training failed:', response);
        setError('Failed to queue training job. Please try again.');
        setStep('upload');
      }
    } catch (err) {
      console.error('Training error:', err);
      setError((err as Error).message || 'An error occurred');
      setStep('upload');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setJobId(null);
    setResult(null);
    setError(null);
    onClose();
  };

  const getStatusColor = (status: TrainingStatusDtoStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: TrainingStatusDtoStatus) => {
    switch (status) {
      case 'completed':
        return 'material-symbols:check-circle';
      case 'error':
        return 'material-symbols:error';
      default:
        return 'material-symbols:info';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconifyIcon icon="material-symbols:school" sx={{ fontSize: 24 }} />
          <Typography variant="h6">Train Template</Typography>
        </Stack>
        {category && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Category: {category.title}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 'upload' && (
          <Box>
            <Box
              {...getRootProps()}
              sx={(theme) => ({
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'primary.lighter' : 'background.elevation1',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.lighter',
                },
                ...theme.applyStyles('dark', {
                  bgcolor: isDragActive ? 'primary.darker' : 'background.elevation2',
                  '&:hover': {
                    bgcolor: 'primary.darker',
                  },
                }),
              })}
            >
              <input {...getInputProps()} />
              <IconifyIcon
                icon="material-symbols:upload-file"
                sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant="body1" gutterBottom>
                {isDragActive
                  ? 'Drop the PDF here...'
                  : 'Drag & drop a PDF file here, or click to select'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum file size: 50MB
              </Typography>
            </Box>

            {selectedFile && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'success.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <IconifyIcon icon="material-symbols:picture-as-pdf" sx={{ color: 'error.main' }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {step === 'processing' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <IconifyIcon
              icon="material-symbols:sync"
              sx={{
                fontSize: 48,
                color: 'primary.main',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Training in Progress
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              OCR processing and template matching...
            </Typography>
            <LinearProgress sx={{ mt: 3, mx: 'auto', maxWidth: 300 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This may take 1-2 minutes
            </Typography>
          </Box>
        )}

        {step === 'result' && result && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <IconifyIcon
              icon={getStatusIcon(result.status)}
              sx={{
                fontSize: 64,
                color: `${getStatusColor(result.status)}.main`,
              }}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Template Trained!
            </Typography>

            <Box sx={(theme) => ({ mt: 3, textAlign: 'left', bgcolor: 'background.elevation1', p: 2, borderRadius: 1, ...theme.applyStyles('dark', { bgcolor: 'background.elevation2' }) })}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label="TRAINED"
                    size="small"
                    color="success"
                  />
                </Stack>

                {result.templateName && (
                  <Stack direction="column" spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Template Name
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {result.templateName}
                    </Typography>
                  </Stack>
                )}

                {result.fieldCount !== undefined && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Fields Extracted
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {result.fieldCount}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>

            {result.isExisting !== undefined && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {result.isExisting
                  ? 'Matched an existing template'
                  : 'Created a new template'}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          {step === 'result' ? 'Close' : 'Cancel'}
        </Button>
        {step === 'upload' && (
          <LoadingButton
            variant="contained"
            onClick={handleTrain}
            disabled={!selectedFile}
            loading={isMutating}
            startIcon={<IconifyIcon icon="material-symbols:play-arrow" />}
          >
            Start Training
          </LoadingButton>
        )}
        {step === 'result' && result && (
          <Button
            variant="contained"
            onClick={handleClose}
            startIcon={<IconifyIcon icon="material-symbols:check" />}
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TrainTemplateDialog;
