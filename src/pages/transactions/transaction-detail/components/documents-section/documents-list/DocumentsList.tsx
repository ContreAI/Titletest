import { useState } from 'react';
import { Button, Paper, Typography, Stack } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import IconifyIcon from 'components/base/IconifyIcon';
import DocumentTimelineItem from './DocumentTimelineItem';
import UploadDocumentDialog from '../upload-document/UploadDocumentDialog';

interface Document {
  name: string;
  filename: string;
  date: string;
}

interface DocumentsListProps {
  transactionId: string;
  documents: Document[];
  onDocumentClick?: (doc: Document) => void;
  disableUpload?: boolean; // Disable upload when any document is processing
}

const DocumentsList = ({ transactionId, documents, onDocumentClick, disableUpload = false }: DocumentsListProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  return (
    <>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={1} direction="column">
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={700}>
              Documents
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconifyIcon icon="custom:upload-document" sx={{ fontSize: 14 }} />}
              onClick={handleUploadClick}
              disabled={disableUpload}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
                fontSize: (theme) => theme.typography.body1.fontSize,
                fontWeight: 500,
                px: 2,
                py: 0.75,
              }}
            >
              Upload Document
            </Button>
          </Stack>

          {/* Summary Label */}
          <Typography 
            variant="body2" 
            fontWeight={600} 
            sx={{
              color: 'text.primary',
              fontSize: '0.875rem',
              mb: 0.5,
              ml: 1,
            }}
          >
            Summary
          </Typography>

          {/* Documents Timeline */}
          <Timeline
            sx={{
              p: 0,
              m: 0,
              pl: 0.5,
              mt: 0.5,
            }}
          >
            {documents.map((doc, index) => (
              <DocumentTimelineItem
                key={index}
                document={doc}
                isLast={index === documents.length - 1}
                onClick={onDocumentClick}
              />
            ))}
          </Timeline>
        </Stack>
      </Paper>

    <UploadDocumentDialog 
      open={uploadDialogOpen} 
      onClose={() => setUploadDialogOpen(false)} 
      transactionId={transactionId}
    />
    </>
  );
};

export default DocumentsList;

