import { Stack, Typography, TextField, Box, IconButton } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import IconifyIcon from 'components/base/IconifyIcon';
import FileDropZone from 'components/base/FileDropZone';
import type { UploadDocumentFormData } from './schemas/upload-document.schema';

interface UploadDocumentFormProps {
  selectedFile: File | null;
  onFileDrop: (files: File[]) => void;
  onFileRemove: () => void;
}

const UploadDocumentForm = ({ selectedFile, onFileDrop, onFileRemove }: UploadDocumentFormProps) => {
  const { control, formState: { errors } } = useFormContext<UploadDocumentFormData>();

  return (
    <Stack spacing={3} direction="column">
      {/* Document Name */}
      <Stack spacing={1} direction="column">
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Document Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
        </Typography>
        <Controller
          name="documentName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              placeholder="Enter document name"
              error={!!errors.documentName}
              helperText={errors.documentName?.message}
            />
          )}
        />
      </Stack>

      {/* File Upload */}
      <Stack spacing={1} direction="column">
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Upload File <Box component="span" sx={{ color: 'error.main' }}>*</Box>
        </Typography>
        
        {selectedFile ? (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.light',
              bgcolor: 'success.lighter',
            }}
          >
            <IconifyIcon icon="material-symbols:description-outline" sx={{ fontSize: 32, color: 'success.main' }} />
            <Stack flex={1}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Stack>
            <IconButton onClick={onFileRemove} size="small" aria-label="Remove file">
              <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        ) : (
          <Box>
            <FileDropZone
              onDrop={onFileDrop}
              accept={{
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'image/*': ['.png', '.jpg', '.jpeg'],
              }}
              maxFiles={1}
              sx={(theme) => ({
                bgcolor: 'background.elevation1',
                borderColor: 'success.light',
                borderStyle: 'dashed',
                borderWidth: 2,
                '&:hover': {
                  bgcolor: 'success.lighter',
                  borderColor: 'success.main',
                },
                ...theme.applyStyles('dark', {
                  bgcolor: 'background.elevation2',
                  '&:hover': {
                    bgcolor: 'success.darker',
                  },
                }),
              })}
            />
            {errors.file && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 1, display: 'block' }}>
                {errors.file.message as string}
              </Typography>
            )}
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default UploadDocumentForm;

