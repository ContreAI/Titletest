import { Box } from '@mui/material';
import type { Document, DocumentSummaryDto } from 'modules/documents';
import { useStaggeredAnimation } from 'hooks/useStaggeredAnimation';
import DocumentRowInfo from './DocumentRowInfo';
import DocumentRowActions from './DocumentRowActions';
import AddressMismatchAlert from './AddressMismatchAlert';

interface DocumentRowProps {
  doc: Document;
  index?: number;
  summary: DocumentSummaryDto | undefined;
  isLast: boolean;
  onViewReport: (docId: string) => void;
  onViewOriginal: (docId: string) => void;
  onEmailReport: (docId: string) => void;
  onCopyReport: (docId: string) => void;
  onDownload: (docId: string) => void;
  onAnalyze: (docId: string) => void;
  onDelete: (docId: string) => void;
  disableDelete: boolean;
  /** Handler when user wants to keep document in current transaction despite address mismatch */
  onKeepAddressMismatch?: (docId: string) => void;
  /** Handler when user wants to move document to a different transaction */
  onMoveToTransaction?: (docId: string) => void;
  /** Handler when user wants to create a new transaction for the document */
  onCreateNewTransaction?: (docId: string) => void;
}

const DocumentRow = ({
  doc,
  index = 0,
  summary,
  isLast,
  onViewReport,
  onViewOriginal,
  onEmailReport,
  onCopyReport,
  onDownload,
  onAnalyze,
  disableDelete,
  onKeepAddressMismatch,
  onMoveToTransaction,
  onCreateNewTransaction,
}: DocumentRowProps) => {
  const isProcessed = doc.parsedStatus === 'completed';
  const isProcessing = doc.parsedStatus === 'processing';
  const isNotProcessed = doc.parsedStatus === 'pending';
  // Enable button if document is processed (summary can be fetched on demand)
  const hasReport = isProcessed;

  const animationSx = useStaggeredAnimation(index);

  return (
    <Box sx={animationSx}>
      {/* Row container with hover state + shadow */}
      <Box
        className="document-row"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            bgcolor: 'action.hover',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: 'primary.main',
            '& .doc-title': {
              color: 'primary.main',
            },
          },
        }}
      >
        {/* TOP ROW: Info + Actions */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {/* LEFT: Info area */}
          <DocumentRowInfo doc={doc} hasReport={hasReport} />

          {/* RIGHT: Action buttons bar */}
          <DocumentRowActions
            doc={doc}
            hasReport={hasReport}
            isProcessing={isProcessing}
            isNotProcessed={isNotProcessed}
            disableDelete={disableDelete}
            summary={summary}
            onViewReport={onViewReport}
            onViewOriginal={onViewOriginal}
            onAnalyze={onAnalyze}
            onDownload={onDownload}
            onEmailReport={onEmailReport}
            onCopyReport={onCopyReport}
          />
        </Box>

        {/* Address Mismatch Alert - shown when document address doesn't match transaction */}
        {doc.addressMismatch?.detected && onKeepAddressMismatch && onMoveToTransaction && onCreateNewTransaction && (
          <Box sx={{ mt: 1.5 }}>
            <AddressMismatchAlert
              documentId={doc.id}
              documentName={doc.documentName}
              documentAddress={doc.addressMismatch.documentAddress}
              transactionAddress={doc.addressMismatch.transactionAddress}
              confidence={doc.addressMismatch.confidence}
              onKeep={onKeepAddressMismatch}
              onMoveToTransaction={onMoveToTransaction}
              onCreateNewTransaction={onCreateNewTransaction}
            />
          </Box>
        )}

      </Box>

      {/* Subtle divider between rows (not after last) */}
      {!isLast && (
        <Box sx={{ height: '1px', bgcolor: 'divider', mt: 1.5 }} />
      )}
    </Box>
  );
};

export default DocumentRow;

