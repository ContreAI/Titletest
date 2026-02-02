import { Box, Paper } from '@mui/material';
import { SkeletonRow } from 'components/loading';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router';
import type { Deal, DealStageName } from 'types/deals';
import type { Transaction, TransactionScope } from 'modules/transactions/typings/transactions.types';
import DealsListHeader from './DealsListHeader';
import DealRow from './DealRow';
import DealSummaryPanel from './DealSummaryPanel';
import DealsEmptyState from './DealsEmptyState';

interface DealsListSectionProps {
  deals: Deal[];
  isLoading: boolean;
  hoveredDealId: string | null;
  selectedDealId: string | null;
  displayDeal: Deal | null;
  displayTransaction: Transaction | null;
  onSort: (sortBy: string) => void;
  onFilter: (filter: DealStageName | 'all') => void;
  onDealHover: (dealId: string | null) => void;
  onDealClick: (dealId: string) => void;
  transactionScope?: TransactionScope;
  onScopeChange?: (scope: TransactionScope) => void;
}

/**
 * DealsListSection - Main container for the deals list with two-column layout
 *
 * Structure:
 * - DealsListHeader: Title, count, Sort/Filter controls
 * - Two-column Grid:
 *   - Left: DealRow list (scrollable)
 *   - Right: DealSummaryPanel (appears on hover)
 */
const DealsListSection = ({
  deals,
  isLoading,
  hoveredDealId: _hoveredDealId,
  selectedDealId: _selectedDealId,
  displayDeal,
  displayTransaction,
  onSort,
  onFilter,
  onDealHover,
  onDealClick,
  transactionScope,
  onScopeChange,
}: DealsListSectionProps) => {
  const navigate = useNavigate();

  const handleCreateTransaction = () => {
    navigate('/transactions/new');
  };

  return (
    <Paper sx={{ bgcolor: 'background.paper', p: 2 }}>
      {/* Section Header */}
      <DealsListHeader
        totalDeals={deals.length}
        onSort={onSort}
        onFilter={onFilter}
        transactionScope={transactionScope}
        onScopeChange={onScopeChange}
      />

      {/* Main Content */}
      <Box sx={{ mt: 2 }}>
        {/* Loading State - Skeleton rows matching DealRow layout */}
        {isLoading && <SkeletonRow count={5} showIcon showStepper />}

        {/* Empty State */}
        {!isLoading && deals.length === 0 && (
          <DealsEmptyState onCreateClick={handleCreateTransaction} />
        )}

        {/* Deals Grid */}
        {!isLoading && deals.length > 0 && (
          <Grid container spacing={3}>
            {/* Left Column: Deal Rows - Always 50% width */}
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}
              >
                {deals.map((deal, index) => (
                  <DealRow
                    key={deal.id}
                    deal={deal}
                    isLast={index === deals.length - 1}
                    onMouseEnter={() => onDealHover(deal.id)}
                    onMouseLeave={() => onDealHover(null)}
                    onClick={() => onDealClick(deal.id)}
                  />
                ))}
              </Box>
            </Grid>

            {/* Right Column: Summary Panel - Always visible, shows content on hover/select */}
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
              sx={{
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Box
                sx={{
                  position: 'sticky',
                  top: 16,
                }}
              >
                <DealSummaryPanel deal={displayDeal} transaction={displayTransaction} />
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default DealsListSection;

