import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Grid from '@mui/material/Grid';
import { useTransactions } from 'modules/transactions';
import { useChatPageContext } from 'modules/chat';
import type { DealStageName } from 'types/deals';
import PageDropZone from 'components/base/PageDropZone';
import TransactionsHeaderSection from './components/transactions-header-section';
import { StatsBanner } from './components/stats-banner';
import { DealsListSection } from './components/deals-list';
import SmartUploadDialog from './components/SmartUploadDialog';
import { useTransactionDeals } from './hooks/useTransactionDeals';
import { useDealFilters } from './hooks/useDealFilters';
import { useDealSelection } from './hooks/useDealSelection';

/**
 * TransactionList - Main transactions list page
 *
 * Structure:
 * - TransactionsHeaderSection: Breadcrumb + "Your Transactions" title + "New Transaction" button
 * - StatsBanner: Hours Saved, Projected Commission, Closing Soon
 * - DealsListSection: Header with sort/filter + two-column layout (deals list + summary panel)
 */
const TransactionList = () => {
  const navigate = useNavigate();
  const { transactions, isLoading, fetchTransactions, transactionScope, setTransactionScope } = useTransactions();
  const [stageFilter, setStageFilter] = useState<DealStageName | 'all'>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Register page context for Transaction IQ chat assistant
  useChatPageContext({
    pageType: 'transactions-list',
  });

  // Smart upload state
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [smartUploadOpen, setSmartUploadOpen] = useState(false);

  // Handle page-level file drop for smart upload
  const handlePageFileDrop = useCallback((files: File[]) => {
    if (files.length > 0) {
      setDroppedFiles(files);
      setSmartUploadOpen(true);
    }
  }, []);

  // Close smart upload dialog
  const handleSmartUploadClose = useCallback(() => {
    setSmartUploadOpen(false);
    setDroppedFiles([]);
  }, []);

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions().catch((error) => {
      console.error('Failed to fetch transactions:', error);
    });
  }, [fetchTransactions]);

  // Map transactions to deals
  const deals = useTransactionDeals(transactions);

  // Filter and sort deals
  const filteredDeals = useDealFilters({
    deals,
    transactions,
    stageFilter,
    sortBy,
  });

  // Manage deal selection and hover state
  const { hoveredDealId, selectedDealId, displayDeal, displayTransaction, setHoveredDealId, setSelectedDealId } =
    useDealSelection(filteredDeals, deals, transactions);

  // Handle card click to navigate to transaction details
  const handleDealClick = (dealId: string) => {
    setSelectedDealId(dealId);
    navigate(`/transactions/${dealId}`);
  };

  // Documents processed for stats (in real app, this comes from API)
  const documentsProcessed = useMemo(() => {
    // TODO: Get actual document count from API
    return deals.length * 12;
  }, [deals.length]);

  return (
    <PageDropZone
      onFileDrop={handlePageFileDrop}
      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
    >
      <Grid container spacing={2.5} sx={{ p: { xs: 2, md: 2.5 } }}>
        {/* Page Header: Breadcrumb + Title + New Transaction Button */}
        <TransactionsHeaderSection />

        {/* Stats Banner: Hours Saved, Projected Commission, Closing Soon */}
        <Grid size={12}>
          <StatsBanner deals={deals} documentsProcessed={documentsProcessed} />
        </Grid>

        {/* Deals List Section: Header + Two-Column Layout */}
        <Grid size={12}>
          <DealsListSection
            deals={filteredDeals}
            isLoading={isLoading}
            hoveredDealId={hoveredDealId}
            selectedDealId={selectedDealId}
            displayDeal={displayDeal}
            displayTransaction={displayTransaction}
            onSort={setSortBy}
            onFilter={setStageFilter}
            onDealHover={setHoveredDealId}
            onDealClick={handleDealClick}
            transactionScope={transactionScope}
            onScopeChange={setTransactionScope}
          />
        </Grid>
      </Grid>

      {/* Smart Upload Dialog - for drag-drop with address matching */}
      <SmartUploadDialog
        open={smartUploadOpen}
        onClose={handleSmartUploadClose}
        initialFile={droppedFiles[0]}
      />
    </PageDropZone>
  );
};

export default TransactionList;

