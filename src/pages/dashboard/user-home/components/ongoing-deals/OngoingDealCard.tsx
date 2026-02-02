import { Card, CardContent, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import type { Deal } from 'types/deals';
import { dashboardSpacing } from 'theme/spacing';
import { cardHoverStyles } from 'theme/mixins';
import { PropertyMapAvatar } from 'components/property/PropertyMapAvatar';
import DealStages from './DealStages';

interface OngoingDealCardProps {
  deal: Deal;
}

const OngoingDealCard = ({ deal }: OngoingDealCardProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deal.id) {
      navigate(`/transactions/${deal.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (deal.id) {
        navigate(`/transactions/${deal.id}`);
      }
    }
  };

  return (
    <Card
      variant="outlined"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      sx={{
        bgcolor: 'background.elevation1',
        border: 0,
        borderRadius: 2,
        cursor: 'pointer',
        ...cardHoverStyles,
      }}
    >
      <CardContent sx={{ p: dashboardSpacing.cardPaddingSm, '&:last-child': { pb: dashboardSpacing.cardPaddingSm } }}>
        <Stack spacing={dashboardSpacing.contentGapSm} direction="column">
          {/* Property Avatar and Deal Info Row */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {/* Property Map Avatar */}
            <PropertyMapAvatar
              address={deal.propertyAddress}
              coordinates={deal.geocoding?.coordinates}
              geocodingStatus={deal.geocoding?.status}
              geocodingConfidence={deal.geocoding?.confidence}
              size="medium"
            />

            {/* Deal Info */}
            <Stack direction="column" flex={1} minWidth={0}>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.tertiary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {deal.title}
              </Typography>

              {/* Price and Closing Date Row */}
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
          </Stack>

          {/* Status Stages */}
          <DealStages stages={deal.stages} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OngoingDealCard;
