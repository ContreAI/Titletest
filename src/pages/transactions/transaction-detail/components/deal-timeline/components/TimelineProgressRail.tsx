import { Box } from '@mui/material';
import { useTheme } from '@mui/material';
import type { AlertLevel } from '../types';

interface TimelineProgressRailProps {
  progressPercent: number;
  currentDotSize: number;
  railHeight: number;
  hasAlert?: boolean;
  alertLevel?: AlertLevel;
}

const TimelineProgressRail = ({
  progressPercent,
  currentDotSize,
  railHeight,
  hasAlert = false,
  alertLevel = 'none',
}: TimelineProgressRailProps) => {
  const theme = useTheme();

  // Determine progress bar color based on alert state
  const getProgressColor = () => {
    if (hasAlert && alertLevel !== 'none') {
      return alertLevel === 'error' ? theme.palette.error.main : theme.palette.warning.main;
    }
    return theme.palette.success.main;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: railHeight,
        borderRadius: railHeight / 2,
        bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
        mx: `${currentDotSize / 2}px`,
      }}
    >
      {/* Progress Fill (active portion) */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          borderRadius: railHeight / 2,
          bgcolor: getProgressColor(),
          width: `${progressPercent}%`,
          transition: 'width 0.4s ease-out, background-color 0.3s ease',
        }}
      />
    </Box>
  );
};

export default TimelineProgressRail;

