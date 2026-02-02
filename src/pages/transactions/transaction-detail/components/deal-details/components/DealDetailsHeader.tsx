import { Box, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface DealDetailsHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DealDetailsHeader = ({ isOpen, onToggle }: DealDetailsHeaderProps) => {
  return (
    <Box
      component="button"
      type="button"
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Collapse deal details' : 'Expand deal details'}
      onClick={onToggle}
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        textAlign: 'left',
        border: 'none',
        bgcolor: 'transparent',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2,
        },
      }}
    >
      {/* Left: Title and subtitle */}
      <Box>
            <Typography
              component="h2"
              variant="h5"
              sx={{
                fontWeight: 400,
                color: 'text.primary',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Deal Details
            </Typography>
            <Typography
              component="p"
              variant="caption"
              sx={{
                mt: 0.25,
                color: 'text.secondary',
              }}
            >
          Buyer, seller, property, and financial info for this transaction.
        </Typography>
      </Box>

      {/* Right: Toggle indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: '11px',
            color: 'text.secondary',
          }}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <IconifyIcon
            icon="mdi:chevron-down"
            sx={{ fontSize: 14, color: 'text.secondary' }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DealDetailsHeader;

