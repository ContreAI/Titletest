/**
 * State Context Badge Component
 *
 * Displays the state-specific regulatory context being used for AI responses.
 * Shows as a subtle badge indicating which state's real estate knowledge is applied.
 */

import { Chip, Tooltip, Typography, Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

export interface StateContextBadgeProps {
  /** State abbreviation (e.g., "CA", "TX", "AZ") */
  state?: string | null;
  /** Full state name for tooltip */
  stateName?: string;
  /** Position variant */
  position?: 'absolute' | 'inline';
}

const STATE_CONFIG: Record<string, { name: string; icon: string }> = {
  AZ: { name: 'Arizona', icon: 'mdi:cactus' },
  CA: { name: 'California', icon: 'mdi:palm-tree' },
  TX: { name: 'Texas', icon: 'mdi:star-four-points' },
  FL: { name: 'Florida', icon: 'mdi:beach' },
  CO: { name: 'Colorado', icon: 'mdi:terrain' },
  WA: { name: 'Washington', icon: 'mdi:pine-tree' },
  OR: { name: 'Oregon', icon: 'mdi:forest' },
  NV: { name: 'Nevada', icon: 'mdi:slot-machine' },
  UT: { name: 'Utah', icon: 'mdi:mountain' },
  ID: { name: 'Idaho', icon: 'mdi:sprout' },
};

const StateContextBadge = ({
  state,
  stateName,
  position = 'absolute',
}: StateContextBadgeProps) => {
  const theme = useTheme();

  // Determine display values
  const stateCode = state?.toUpperCase();
  const config = stateCode ? STATE_CONFIG[stateCode] : null;
  const displayName = stateName || config?.name || 'General';
  const displayCode = stateCode || 'US';
  const isGeneral = !stateCode;

  const tooltipContent = (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {isGeneral ? 'General Guidance' : `${displayName} Regulations`}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {isGeneral
          ? 'Using general real estate knowledge'
          : `Using ${displayName} real estate regulations and terminology`}
      </Typography>
    </Box>
  );

  const chipContent = (
    <Tooltip title={tooltipContent} arrow placement="bottom">
      <Chip
        size="xsmall"
        variant="soft"
        color={isGeneral ? 'neutral' : 'success'}
        icon={
          <IconifyIcon
            icon={config?.icon || 'mdi:account-balance'}
            sx={{ fontSize: 12 }}
          />
        }
        label={displayCode}
        sx={{
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 600,
          fontSize: '0.65rem',
          backgroundColor: isGeneral
            ? alpha(theme.palette.grey[500], 0.1)
            : alpha(theme.palette.success.main, 0.15),
          borderColor: isGeneral
            ? alpha(theme.palette.grey[500], 0.2)
            : alpha(theme.palette.success.main, 0.25),
          '& .MuiChip-icon': {
            color: isGeneral ? 'text.secondary' : 'success.dark',
          },
          '& .MuiChip-label': {
            color: isGeneral ? 'text.secondary' : 'success.dark',
          },
        }}
      />
    </Tooltip>
  );

  if (position === 'inline') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          mr: 1,
        }}
      >
        {chipContent}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
      }}
    >
      {chipContent}
    </Box>
  );
};

export default StateContextBadge;
