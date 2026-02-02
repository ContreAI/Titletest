import { Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useDocumentSummary } from './hooks/useDocumentSummary';
import { useDocumentDelete } from './hooks/useDocumentDelete';
import DocumentCardHeader from './components/DocumentCardHeader';
import DocumentCardMetadata from './components/DocumentCardMetadata';
import DocumentCardActions from './components/DocumentCardActions';
import DocumentCardSummary from './components/DocumentCardSummary';

interface DocumentCardProps {
  documentId: string;
  documentName: string;
  documentUrl?: string;
  type: string;
  status: string;
  isAnalyzed?: boolean;
  transactionId?: string;
  disableDelete?: boolean; // Disable delete when any document is processing
  onDownload?: () => void;
}

const DocumentCard = ({
  documentId,
  documentName,
  documentUrl,
  type,
  status,
  isAnalyzed = false,
  transactionId: _transactionId,
  disableDelete = false,
  onDownload,
}: DocumentCardProps) => {
  const {
    summaryContent,
    summaryOpen,
    isFetchingSummary,
    handleViewSummary,
  } = useDocumentSummary(documentId, isAnalyzed);

  const { handleDelete, isDeleting } = useDocumentDelete({
    documentId,
  });

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        bgcolor: 'background.subtle',
        borderRadius: 2,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Grid container spacing={1.5}>
        <DocumentCardHeader documentName={documentName} documentUrl={documentUrl} />
        
        <Grid size={12}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={{ xs: 1.5, md: 2 }} 
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{ width: '100%' }}
          >
            <DocumentCardMetadata type={type} status={status} isAnalyzed={isAnalyzed} />
            <DocumentCardActions
              hasSummary={!!summaryContent}
              summaryOpen={summaryOpen}
              onViewSummary={handleViewSummary}
              onDownload={onDownload}
              onDelete={handleDelete}
              isDeleting={isDeleting}
              disableDelete={disableDelete}
            />
          </Stack>
        </Grid>

        <DocumentCardSummary
          summaryContent={summaryContent}
          summaryOpen={summaryOpen}
          isFetchingSummary={isFetchingSummary}
        />
      </Grid>
    </Paper>
  );
};

export default DocumentCard;

