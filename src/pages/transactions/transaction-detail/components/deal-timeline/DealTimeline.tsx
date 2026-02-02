import { useMemo } from 'react';
import { Box, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import { AlertCircle } from 'lucide-react';
import type { TimelineDate, AlertLevel } from './types';
import { normalizeTimelineItems } from './utils/timeline.utils';
import { TimelineHeader, TimelineProgressRail, TimelineItem } from './components';

interface DealTimelineProps {
  items: TimelineDate[];
  /** Whether this is a financed transaction (false = cash, financing shows N/A) */
  isFinanced?: boolean;
}

/**
 * DealTimeline - Horizontal timeline for real estate transaction milestones
 *
 * Displays 5 key dates with past/current/future/not_applicable visual states:
 * - Effective Contract Date (Day One)
 * - Earnest Money Due
 * - Inspection Deadline
 * - Financing Deadline (N/A for cash transactions)
 * - Closing Date
 *
 * Supports alert states (warning/error) for overdue items.
 */
const DealTimeline = ({ items, isFinanced = true }: DealTimelineProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Normalize items to use state property (backwards compat with active)
  // Also handle N/A state for financing in cash transactions
  const normalizedItems = useMemo(() => {
    const normalized = normalizeTimelineItems(items);

    // If cash transaction, mark financing as not_applicable
    if (!isFinanced) {
      return normalized.map((item) => {
        if (item.label.toLowerCase().includes('financing') || item.label.toLowerCase().includes('finance')) {
          return { ...item, state: 'not_applicable' as const };
        }
        return item;
      });
    }

    return normalized;
  }, [items, isFinanced]);

  // Check if any item has an alert
  const hasAnyAlert = useMemo(() => {
    return normalizedItems.some(
      (item) => item.alertLevel && item.alertLevel !== 'none' && item.state !== 'past'
    );
  }, [normalizedItems]);

  // Get highest alert level
  const highestAlertLevel = useMemo<AlertLevel>(() => {
    const alertItems = normalizedItems.filter(
      (item) => item.alertLevel && item.alertLevel !== 'none' && item.state !== 'past'
    );
    if (alertItems.some((item) => item.alertLevel === 'error')) return 'error';
    if (alertItems.some((item) => item.alertLevel === 'warning')) return 'warning';
    return 'none';
  }, [normalizedItems]);

  // Find current index for progress calculation (skip N/A items)
  const currentIndex = useMemo(() => {
    return normalizedItems.findIndex(
      (item) => item.state === 'current' && item.state !== 'not_applicable'
    );
  }, [normalizedItems]);

  // Calculate progress percentage (0-100), accounting for N/A items
  const progressPercent = useMemo(() => {
    const applicableItems = normalizedItems.filter((item) => item.state !== 'not_applicable');
    if (currentIndex < 0) return 0;
    if (applicableItems.length <= 1) return currentIndex === 0 ? 0 : 100;

    // Find the current item's position among applicable items
    const currentItem = normalizedItems[currentIndex];
    const applicableIndex = applicableItems.findIndex((item) => item === currentItem);

    return (applicableIndex / (applicableItems.length - 1)) * 100;
  }, [currentIndex, normalizedItems]);

  // Sizing - variable by state for emphasis
  const baseDotSize = isMobile ? 10 : 12;
  const currentDotSize = isMobile ? 14 : 16;
  const alertDotSize = isMobile ? 14 : 16; // Same size as current for alerts
  const railHeight = 4;
  const stemHeight = isMobile ? 8 : 10;

  // Get dot size based on state and alert
  const getDotSize = (state: string, alertLevel?: AlertLevel) => {
    if (alertLevel && alertLevel !== 'none' && state !== 'past') return alertDotSize;
    if (state === 'current') return currentDotSize;
    if (state === 'future' || state === 'not_applicable') return baseDotSize - 2;
    return baseDotSize; // Past
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        borderColor: hasAnyAlert
          ? (highestAlertLevel === 'error' ? 'error.main' : 'warning.main')
          : 'divider',
        border: hasAnyAlert ? 1 : 0,
        bgcolor: 'background.paper',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark' ? '0 1px 1px rgba(0,0,0,0.2)' : '0 1px 1px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Header with optional alert indicator */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: hasAnyAlert
            ? (highestAlertLevel === 'error' ? 'error.lighter' : 'warning.lighter')
            : 'transparent',
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
          Key Dates
        </Typography>

        {hasAnyAlert && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AlertCircle
              size={14}
              color={highestAlertLevel === 'error' ? theme.palette.error.main : theme.palette.warning.main}
            />
            <Typography
              variant="caption"
              fontWeight={600}
              color={highestAlertLevel === 'error' ? 'error.main' : 'warning.main'}
            >
              Action Required
            </Typography>
          </Box>
        )}
      </Box>

      {/* Timeline Content */}
      <Box
        sx={{
          pt: { xs: 4.5, sm: 3.5 },
          pb: { xs: 2, sm: 1.5 },
          px: { xs: 3, sm: 4 },
        }}
      >
        {/* Timeline Container */}
        <Box
          sx={{
            position: 'relative',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          {/* Progress Track (background rail) */}
          <TimelineProgressRail
            progressPercent={progressPercent}
            currentDotSize={currentDotSize}
            railHeight={railHeight}
            hasAlert={hasAnyAlert}
            alertLevel={highestAlertLevel}
          />

          {/* Timeline Items */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'relative',
              mt: 0,
            }}
          >
            {normalizedItems.map((item, index) => (
              <TimelineItem
                key={index}
                item={item}
                index={index}
                dotSize={getDotSize(item.state, item.alertLevel)}
                stemHeight={stemHeight}
                isMobile={isMobile}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default DealTimeline;
