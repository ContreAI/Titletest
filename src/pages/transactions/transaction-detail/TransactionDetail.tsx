import { Box, Typography } from '@mui/material';
import { TransactionDetailSkeleton } from 'components/loading';
import Grid from '@mui/material/Grid';
import { useParams } from 'react-router';
import { useDocuments } from 'modules/documents';
import { useChatPageContext } from 'modules/chat';
import SectionDivider from 'components/base/SectionDivider';
import PageDropZone from 'components/base/PageDropZone';
import { dashboardSpacing } from 'theme/spacing';
import { TransactionHeaderSection } from './components/transaction-header-section';
import { DealTimeline } from './components/deal-timeline';
import { InsightCardsSection } from './components/insight-cards';
import { DocumentsReportsSection, TransactionSelectDialog } from './components/documents-reports';
import { DealDetailsSection } from './components/deal-details';
import { DocumentReportDrawer } from './components/document-report-drawer';
import { UploadDocumentDialog } from './components/documents-section/upload-document';
import { ParticipantsSection } from 'modules/transaction-participants';
import {
  useTransactionDetailData,
  useTransactionDetailComputed,
  useTransactionDetailHandlers,
} from './hooks';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { documentSummaries } = useDocuments();

  // Data fetching and state
  const {
    currentTransaction,
    currentTransactionDocuments,
    currentTransactionReport,
    isLoading,
  } = useTransactionDetailData(id);

  // Computed values
  const {
    riskAlerts,
    timelineDates,
    aiSummaryData,
    groupedRisks,
    topRisk,
  } = useTransactionDetailComputed(currentTransactionReport);

  // Event handlers
  const {
    uploadDialogOpen,
    reportDrawerOpen,
    selectedDocumentId,
    selectedDocument,
    selectedSummary,
    droppedFiles,
    setUploadDialogOpen,
    handleCloseReportDrawer,
    clearDroppedFiles,
    handleUploadClick,
    handleGenerateReport,
    handleShare,
    handleDelete,
    handleCopySummary,
    handlePageFileDrop,
    isDeleting,
    isGeneratingReport,
    isReassigning,
    handleViewReport,
    handleViewOriginal,
    handleEmailReport,
    handleCopyReport,
    handleCopyReportFromDrawer,
    handleDownloadDoc,
    handleAnalyzeDoc,
    handleDeleteAll,
    // Address mismatch handlers
    handleKeepAddressMismatch,
    handleMoveToTransaction,
    handleCreateNewTransaction,
    // Move dialog state
    moveDialogOpen,
    documentToMove,
    handleCloseMoveDialog,
    handleSelectTransactionForMove,
  } = useTransactionDetailHandlers({
    transactionId: id,
    currentTransactionDocuments,
    aiSummaryData,
  });

  // Compute address for chat context (safe even when loading/not found)
  const propertyAddr = currentTransaction?.propertyAddress;
  const fullAddress = propertyAddr?.streetAddress
    ? `${propertyAddr.streetAddress}, ${propertyAddr.city}, ${propertyAddr.state} ${propertyAddr.zipCode}`.trim()
    : undefined;

  // Register page context for chat assistant - MUST be before any returns (Rules of Hooks)
  useChatPageContext({
    pageType: 'transaction-detail',
    transactionId: id,
    transactionAddress: fullAddress,
  });

  if (isLoading) {
    return <TransactionDetailSkeleton />;
  }

  if (!currentTransaction) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h5" color="text.secondary">Transaction not found</Typography>
      </Box>
    );
  }

  // Format address for display (with fallback for UI)
  const displayAddress = fullAddress || 'Address not available';

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
    clearDroppedFiles();
  };

  return (
    <PageDropZone
      onFileDrop={handlePageFileDrop}
      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
    >
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={dashboardSpacing.sectionSpacing}>
          {/* Breadcrumb and Header Row */}
          <TransactionHeaderSection
            transaction={currentTransaction}
            transactionId={id!}
            fullAddress={displayAddress}
            onUploadClick={handleUploadClick}
            onGenerateReport={handleGenerateReport}
            onShare={handleShare}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            isGeneratingReport={isGeneratingReport}
          />

          {/* Deal Timeline - Key Dates */}
          <Grid size={12} sx={{ px: 2 }}>
            <DealTimeline items={timelineDates} />
          </Grid>

          {/* Section Divider */}
          <Grid size={12} sx={{ px: 2 }}>
            <SectionDivider />
          </Grid>

          {/* Section 2 - Insight Cards */}
          <InsightCardsSection
            aiSummaryData={aiSummaryData}
            riskAlerts={riskAlerts}
            groupedRisks={groupedRisks}
            topRisk={topRisk}
            onCopySummary={handleCopySummary}
          />

          {/* Section Divider */}
          <Grid size={12} sx={{ px: 2 }}>
            <SectionDivider />
          </Grid>

          {/* Section 3 - Documents & Reports */}
          <Grid size={12} sx={{ px: 2 }}>
            <DocumentsReportsSection
              documents={currentTransactionDocuments}
              documentSummaries={documentSummaries}
              onUploadClick={handleUploadClick}
              onViewReport={handleViewReport}
              onViewOriginal={handleViewOriginal}
              onEmailReport={handleEmailReport}
              onCopyReport={handleCopyReport}
              onDownload={handleDownloadDoc}
              onDelete={() => {}} // Deletion handled by useDocumentDelete hook in DocumentRow
              onDeleteAll={handleDeleteAll}
              onAnalyze={handleAnalyzeDoc}
              onKeepAddressMismatch={handleKeepAddressMismatch}
              onMoveToTransaction={handleMoveToTransaction}
              onCreateNewTransaction={handleCreateNewTransaction}
            />
          </Grid>

          {/* Section Divider */}
          <Grid size={12} sx={{ px: 2 }}>
            <SectionDivider />
          </Grid>

          {/* Section 4 - Participants */}
          <Grid size={12} sx={{ px: 2 }}>
            <ParticipantsSection transactionId={id!} />
          </Grid>

          {/* Section Divider */}
          <Grid size={12} sx={{ px: 2 }}>
            <SectionDivider />
          </Grid>

          {/* Section 5 - Deal Details */}
          <Grid size={12} sx={{ px: 2, mb: 2 }}>
            <DealDetailsSection
              transaction={currentTransaction}
              report={currentTransactionReport}
            />
          </Grid>
        </Grid>

        {/* Upload Document Dialog */}
        <UploadDocumentDialog
          open={uploadDialogOpen}
          onClose={handleUploadDialogClose}
          transactionId={id!}
          initialFile={droppedFiles[0]}
        />

        {/* Document Report Drawer */}
        <DocumentReportDrawer
          open={reportDrawerOpen}
          onClose={handleCloseReportDrawer}
          document={selectedDocument}
          summary={selectedSummary}
          onViewOriginal={() => selectedDocumentId && handleViewOriginal(selectedDocumentId)}
          onEmailReport={() => selectedDocumentId && handleEmailReport(selectedDocumentId)}
          onCopyReport={handleCopyReportFromDrawer}
          onDownload={() => selectedDocumentId && handleDownloadDoc(selectedDocumentId)}
        />

        {/* Transaction Select Dialog - for moving documents between transactions */}
        <TransactionSelectDialog
          open={moveDialogOpen}
          onClose={handleCloseMoveDialog}
          onSelect={handleSelectTransactionForMove}
          currentTransactionId={id}
          documentName={documentToMove?.documentName || ''}
          isLoading={isReassigning}
        />
      </Box>
    </PageDropZone>
  );
};

export default TransactionDetail;
