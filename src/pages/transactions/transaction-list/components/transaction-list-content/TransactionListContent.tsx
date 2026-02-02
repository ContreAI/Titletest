import { Paper, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { Deal, DealStageName } from 'types/deals';
import type { Transaction } from 'modules/transactions/typings/transactions.types';
import OngoingDealsHeader from '../ongoing-deals-header';
import OngoingDealsList from '../ongoing-deals-list';
import TransactionSummary from '../transaction-summary';

interface TransactionListContentProps {
  deals: Deal[];
  isLoading: boolean;
  stageFilter: DealStageName | 'all';
  sortBy: string;
  hoveredDealId: string | null;
  selectedDealId: string | null;
  displayDeal: Deal | null;
  displayTransaction: Transaction | null;
  onFilterChange: (filter: DealStageName | 'all') => void;
  onSortChange: (sortBy: string) => void;
  onDealHover: (dealId: string | null) => void;
  onDealClick: (dealId: string) => void;
}

const TransactionListContent = ({
  deals,
  isLoading,
  stageFilter: _stageFilter,
  sortBy: _sortBy,
  hoveredDealId,
  selectedDealId,
  displayDeal,
  displayTransaction,
  onFilterChange,
  onSortChange,
  onDealHover,
  onDealClick,
}: TransactionListContentProps) => {
  return (
    <Paper
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 2,
      }}
    >
      {/* Main Content Header */}
      <OngoingDealsHeader onFilter={onFilterChange} onSort={onSortChange} />

      {/* Divider under header */}
      <Divider sx={{ my: 2 }} />

      {/* Main Content - Two Column Layout */}
      <Grid container spacing={2}>
        {/* Left Panel - Ongoing Deals (stable width) */}
        <Grid size={{ xs: 12, md: 7, lg: 7 }}>
          <OngoingDealsList
            deals={deals}
            isLoading={isLoading}
            hoveredDealId={hoveredDealId}
            selectedDealId={selectedDealId}
            onDealHover={onDealHover}
            onDealClick={onDealClick}
          />
        </Grid>

        {/* Right Panel - Transaction Summary (only show when hovered or selected) */}
        {(hoveredDealId || selectedDealId) && displayDeal && (
          <Grid size={{ xs: 12, md: 5, lg: 5 }}>
            <TransactionSummary deal={displayDeal} transaction={displayTransaction} />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default TransactionListContent;

