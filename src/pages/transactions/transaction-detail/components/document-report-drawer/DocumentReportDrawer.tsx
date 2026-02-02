import { Box, Drawer, drawerClasses } from '@mui/material';
import type { Document, DocumentSummaryDto } from 'modules/documents';
import {
  DocumentReportDrawerHeader,
  DocumentReportContent,
  DocumentReportDrawerFooter,
} from './components';

interface DocumentReportDrawerProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
  summary: DocumentSummaryDto | null;
  onViewOriginal: () => void;
  onEmailReport: () => void;
  onCopyReport: () => void;
  onDownload: () => void;
}

const DocumentReportDrawer = ({
  open,
  onClose,
  document: _document,
  summary,
  onViewOriginal: _onViewOriginal,
  onEmailReport: _onEmailReport,
  onCopyReport,
  onDownload: _onDownload,
}: DocumentReportDrawerProps) => {

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: 500, exit: 500 }}
      sx={{
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column',
        [`& .${drawerClasses.paper}`]: {
          boxSizing: 'border-box',
          width: { xs: '100%', sm: '90%', md: 700, lg: 800 },
          maxWidth: { xs: '100%', sm: '600px', md: '700px', lg: '800px' },
        },
      }}
    >
      <DocumentReportDrawerHeader onClose={onClose} />

      {/* Content - scrollable */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
        }}
      >
        <DocumentReportContent summary={summary} />
      </Box>

      <DocumentReportDrawerFooter onClose={onClose} onCopyReport={onCopyReport} />
    </Drawer>
  );
};

export default DocumentReportDrawer;
