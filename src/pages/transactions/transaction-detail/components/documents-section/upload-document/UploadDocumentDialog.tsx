import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import IconifyIcon from 'components/base/IconifyIcon';
import { useDocuments } from 'modules/documents';
import { useDocumentControllerUploadDocument } from '@contreai/api-client';
import { uploadDocumentSchema, UploadDocumentFormData } from './schemas/upload-document.schema';
import UploadDocumentForm from './UploadDocumentForm';

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  /** Optional initial file from page drop zone */
  initialFile?: File;
}

/**
 * Upload Document Dialog
 * Follows auth page pattern: Dialog wrapper + Form component + Schema
 */
const UploadDocumentDialog = ({ open, onClose, transactionId, initialFile }: UploadDocumentDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { addDocument } = useDocuments();
  const { trigger: uploadDocument, isMutating: isUploading } = useDocumentControllerUploadDocument();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const methods = useForm<UploadDocumentFormData>({
    resolver: yupResolver(uploadDocumentSchema),
    defaultValues: {
      documentName: '',
      file: undefined,
    },
  });

  const { handleSubmit, setValue, setError, reset } = methods;

  // Handle initial file from page drop zone or reset when no initial file
  useEffect(() => {
    if (open) {
      if (initialFile) {
        setSelectedFile(initialFile);
        setValue('file', initialFile);
        // Auto-fill document name from file name (remove extension)
        const fileNameWithoutExt = initialFile.name.replace(/\.[^/.]+$/, '');
        setValue('documentName', fileNameWithoutExt);
      } else {
        // Reset form when opening without initial file
        setSelectedFile(null);
        reset();
      }
    }
  }, [initialFile, open, setValue, reset]);

  const handleFileDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setValue('file', file);

      // Auto-fill document name from file name (remove extension)
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setValue('documentName', fileNameWithoutExt);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValue('file', undefined);
  };

  const onSubmit = async (data: UploadDocumentFormData) => {
    if (!selectedFile) {
      setError('file', { message: 'Please select a file to upload' });
      return;
    }

    try {
      // UploadDocumentResponseDto is the document data directly (no wrapper)
      // Note: documentType is empty - AI will auto-classify the document during processing
      const docData = await uploadDocument({
        file: selectedFile,
        documentName: data.documentName,
        documentType: '', // Empty - AI auto-classification will determine type
        transactionId: transactionId,
      });

      if (docData?.id) {
        const newDocument = {
          id: docData.id,
          transactionId: docData.transactionId || transactionId,
          documentName: docData.documentName,
          documentType: docData.documentType || 'Pending Classification',
          fileName: docData.documentName, // DocumentDto doesn't have fileName, use documentName
          filePath: docData.filePath,
          fileUrl: docData.fileUrl,
          fileSize: docData.fileSize,
          mimeType: docData.mimeType,
          parsedStatus: (docData.parsedStatus || 'pending') as 'pending' | 'processing' | 'completed' | 'error',
          metadata: {},
          parsedData: {},
          uploadedBy: docData.userId,
          createdAt: docData.createdAt || new Date().toISOString(),
          updatedAt: docData.updatedAt || new Date().toISOString(),
        };

        addDocument(newDocument);

        enqueueSnackbar('Document uploaded successfully! Processing in background', { variant: 'success' });
      } else {
        enqueueSnackbar('Document uploaded but response was invalid', { variant: 'warning' });
      }

      handleClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleClose = () => {
    reset();
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
            Upload Document
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
              }
            }}
          >
            <IconifyIcon icon="material-symbols:close" />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <UploadDocumentForm
              selectedFile={selectedFile}
              onFileDrop={handleFileDrop}
              onFileRemove={handleRemoveFile}
            />
          </form>
        </FormProvider>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          disabled={isUploading}
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
        <LoadingButton
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          loading={isUploading}
          startIcon={<IconifyIcon icon="material-symbols:cloud-upload-outline" />}
          sx={{
            textTransform: 'none',
            px: 3,
          }}
        >
          Upload Document
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDocumentDialog;

