import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { PropertyMapAvatar } from 'components/property/PropertyMapAvatar';
import type { Deal } from 'types/deals';
import StageStepperDots from './StageStepperDots';

interface DealRowProps {
  deal: Deal;
  isLast: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

/**
 * DealRow - Individual deal entry in the list
 *
 * Matches DocumentRow styling pattern:
 * - Hover: border highlight + shadow lift
 * - Content: property icon, address, price, closing date, stage stepper
 * - Click navigates to deal details
 */
const DealRow = memo(function DealRow({ deal, isLast, onMouseEnter, onMouseLeave, onClick }: DealRowProps) {
  return (
    <Box>
      {/* Row container with hover state + shadow */}
      <Box
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1.5, md: 2 },
          p: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          cursor: 'pointer',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
            borderColor: 'primary.main',
            '& .deal-title': {
              color: 'primary.main',
            },
          },
        }}
      >
        {/* Left Section: Icon + Deal Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Property Map Avatar */}
          <PropertyMapAvatar
            address={deal.propertyAddress}
            coordinates={deal.geocoding?.coordinates}
            geocodingStatus={deal.geocoding?.status}
            geocodingConfidence={deal.geocoding?.confidence}
            size="medium"
          />

          {/* Deal Info */}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {/* Property Address - Line 1 */}
            <Typography
              className="deal-title"
              variant="body1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                transition: 'color 0.15s ease-in-out',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5,
              }}
            >
              {deal.title}
            </Typography>

            {/* Price and Closing Date - Line 2 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                ${deal.price.toLocaleString()}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                }}
              >
                Closing: {deal.closingDate}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Section: Stage Stepper */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            flexShrink: 0,
            pl: { xs: 6.5, md: 0 }, // Align with content on mobile (icon width + gap)
          }}
        >
          <StageStepperDots stages={deal.stages} />
        </Box>
      </Box>

      {/* Subtle divider between rows (not after last) */}
      {!isLast && <Box sx={{ height: 12 }} />}
    </Box>
  );
});

export default DealRow;
