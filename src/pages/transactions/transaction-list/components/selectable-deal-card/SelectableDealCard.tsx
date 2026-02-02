import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { Deal } from 'types/deals';
import { cardHoverStyles } from 'theme/mixins';
import DealStages from '../deal-stages';

interface SelectableDealCardProps {
  deal: Deal;
  isSelected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

const SelectableDealCard = ({ deal, isSelected = false, onMouseEnter, onMouseLeave, onClick }: SelectableDealCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      variant="outlined"
      role="button"
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      sx={{
        bgcolor: 'background.elevation1',
        border: 0,
        borderRadius: 2,
        cursor: 'pointer',
        width: '100%',
        maxWidth: '100%',
        ...cardHoverStyles,
        ...(isSelected && {
          boxShadow: 2,
          border: '1px solid',
          borderColor: 'primary.main',
        }),
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5} direction="column">
          <Stack direction="column">
            <Typography
              variant="h6"
              sx={{
                color: 'text.tertiary',
              }}
            >
              {deal.title}
            </Typography>

            {/* Title and Price Row */}
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography
                variant="mono"
                sx={{
                  color: 'text.primary',
                }}
              >
                Price: ${deal.price.toLocaleString()}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  fontWeight: 400,
                  flexShrink: 0,
                  paddingTop: '2px',
                }}
              >
                <b>Closing Date:</b> {deal.closingDate}
              </Typography>
            </Stack>
          </Stack>

          {/* Status Stages */}
          <DealStages stages={deal.stages} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SelectableDealCard;

