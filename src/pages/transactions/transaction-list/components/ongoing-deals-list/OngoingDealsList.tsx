import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import type { Deal } from 'types/deals';
import SelectableDealCard from '../selectable-deal-card';

interface OngoingDealsListProps {
  deals: Deal[];
  isLoading: boolean;
  hoveredDealId: string | null;
  selectedDealId: string | null;
  onDealHover: (dealId: string | null) => void;
  onDealClick: (dealId: string) => void;
}

const OngoingDealsList = ({
  deals,
  isLoading,
  hoveredDealId,
  selectedDealId,
  onDealHover,
  onDealClick,
}: OngoingDealsListProps) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (deals.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No ongoing deals. Click "New Deal" to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5} direction="column" sx={{ maxWidth: '100%' }}>
      {deals.map((deal) => (
        <SelectableDealCard
          key={deal.id}
          deal={deal}
          isSelected={!hoveredDealId && selectedDealId === deal.id}
          onMouseEnter={() => onDealHover(deal.id)}
          onMouseLeave={() => onDealHover(null)}
          onClick={() => onDealClick(deal.id)}
        />
      ))}
    </Stack>
  );
};

export default OngoingDealsList;

