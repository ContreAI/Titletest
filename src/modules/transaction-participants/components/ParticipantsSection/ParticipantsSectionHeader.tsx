/**
 * Participants Section Header
 *
 * Collapsible header for the participants section.
 */

import { Box, Typography, IconButton, Chip, Skeleton, Stack } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface ParticipantsSectionHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  participantCount: number;
  isLoading?: boolean;
}

export const ParticipantsSectionHeader = ({
  isOpen,
  onToggle,
  participantCount,
  isLoading,
}: ParticipantsSectionHeaderProps) => {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <IconifyIcon
          icon="mdi:account-group"
          sx={{ fontSize: 24, color: 'text.secondary' }}
        />
        <Typography variant="subtitle1" fontWeight={600}>
          Participants
        </Typography>
        {isLoading ? (
          <Skeleton variant="rounded" width={32} height={20} />
        ) : (
          participantCount > 0 && (
            <Chip
              label={participantCount}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          )
        )}
      </Stack>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={isOpen ? 'Collapse section' : 'Expand section'}
      >
        <IconifyIcon
          icon={isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
          sx={{ fontSize: 24 }}
        />
      </IconButton>
    </Box>
  );
};

export default ParticipantsSectionHeader;
