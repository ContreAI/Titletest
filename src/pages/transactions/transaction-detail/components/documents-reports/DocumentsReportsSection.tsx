import { useMemo, useState } from 'react';
import { Box, Paper, Stack, Divider } from '@mui/material';
import type { Document, DocumentSummaryDto } from 'modules/documents';
import { DocumentRow, DocumentsEmptyState, DocumentsSectionHeader } from './components';

interface DocumentsReportsSectionProps {
  documents: Document[];
  documentSummaries: Record<string, DocumentSummaryDto>;
  onUploadClick: () => void;
  onViewReport: (docId: string) => void;
  onViewOriginal: (docId: string) => void;
  onEmailReport: (docId: string) => void;
  onCopyReport: (docId: string, summary?: DocumentSummaryDto) => void;
  onDownload: (docId: string) => void;
  onDelete: (docId: string) => void;
  onDeleteAll: () => void;
  onAnalyze: (docId: string) => void;
  disableUpload?: boolean;
  disableDelete?: boolean;
  /** Handler when user wants to keep document in current transaction despite address mismatch */
  onKeepAddressMismatch?: (docId: string) => void;
  /** Handler when user wants to move document to a different transaction */
  onMoveToTransaction?: (docId: string) => void;
  /** Handler when user wants to create a new transaction for the document */
  onCreateNewTransaction?: (docId: string) => void;
}

const DocumentsReportsSection = ({
  documents,
  documentSummaries,
  onUploadClick,
  onViewReport,
  onViewOriginal,
  onEmailReport,
  onCopyReport,
  onDownload,
  onDeleteAll,
  onAnalyze,
  onKeepAddressMismatch,
  onMoveToTransaction,
  onCreateNewTransaction,
}: DocumentsReportsSectionProps) => {
  const [moreActionsAnchor, setMoreActionsAnchor] = useState<null | HTMLElement>(null);

  // Compute summary counts
  const { totalDocs, processedDocs, docsNeedingAttention } = useMemo(() => {
    const total = documents.length;
    const processed = documents.filter((d) => d.parsedStatus === 'completed').length;
    const needsAttention = documents.filter((d) => d.parsedStatus === 'error').length;
    return { totalDocs: total, processedDocs: processed, docsNeedingAttention: needsAttention };
  }, [documents]);

  const handleMoreActionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreActionsAnchor(event.currentTarget);
  };

  const handleMoreActionsClose = () => {
    setMoreActionsAnchor(null);
  };

  return (
    <Box component="section">
      {/* Centered max-width container for better readability on wide screens */}
      <Box sx={{ mx: 'auto',  }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            borderColor: 'divider',
          }}
        >
          {/* Top bar */}
          <DocumentsSectionHeader
            totalDocs={totalDocs}
            processedDocs={processedDocs}
            docsNeedingAttention={docsNeedingAttention}
            onUploadClick={onUploadClick}
            onDeleteAll={onDeleteAll}
            onMoreActionsClick={handleMoreActionsClick}
            moreActionsAnchor={moreActionsAnchor}
            onMoreActionsClose={handleMoreActionsClose}
          />

          <Divider sx={{ mb: 2 }} />

          {/* Document list - vertical stack with space-y-3 equivalent */}
          <Stack
            spacing={1.5}
            direction="column"
            sx={{
              width: '100%',
            }}
          >
            {documents.length === 0 ? (
              <DocumentsEmptyState onUploadClick={onUploadClick} />
            ) : (
              // Document rows - vertical list (inbox style)
              documents.map((doc, index) => {
                // Only disable delete for the specific document if it's processing or pending
                const isDocumentProcessing = doc.parsedStatus === 'processing' || doc.parsedStatus === 'pending';

                return (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  index={index}
                  summary={documentSummaries[doc.id]}
                  isLast={index === documents.length - 1}
                  onViewReport={onViewReport}
                  onViewOriginal={onViewOriginal}
                  onEmailReport={onEmailReport}
                  onCopyReport={onCopyReport}
                  onDownload={onDownload}
                  onAnalyze={onAnalyze}
                  onDelete={() => {}} // Placeholder - deletion handled by hook in DocumentRow
                  disableDelete={isDocumentProcessing}
                  onKeepAddressMismatch={onKeepAddressMismatch}
                  onMoveToTransaction={onMoveToTransaction}
                  onCreateNewTransaction={onCreateNewTransaction}
                />)
              }))
            }
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default DocumentsReportsSection;
