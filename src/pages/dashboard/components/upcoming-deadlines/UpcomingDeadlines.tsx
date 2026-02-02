import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Paper,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Box,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { dashboardSpacing } from 'theme/spacing';
import { useDashboardData } from '../../hooks';
import paths from 'routes/paths';
import { getUpcomingDeadlines, getUrgencyLevel, type DeadlineItem, type UrgencyLevel } from './deadline-utils';

const DEADLINE_TYPE_LABELS: Record<DeadlineItem['deadlineType'], string> = {
  inspection: 'Inspection',
  financing: 'Financing',
  closing: 'Closing',
  earnest_money: 'Earnest Money',
  title_commitment: 'Title Commitment',
  seller_disclosure: 'Seller Disclosure',
};

const DEADLINE_TYPE_ICONS: Record<DeadlineItem['deadlineType'], string> = {
  inspection: 'material-symbols:search-rounded',
  financing: 'material-symbols:account-balance-rounded',
  closing: 'material-symbols:key-rounded',
  earnest_money: 'material-symbols:payments-rounded',
  title_commitment: 'material-symbols:description-rounded',
  seller_disclosure: 'material-symbols:fact-check-rounded',
};

const UpcomingDeadlines = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeDealsWithReports, isLoading } = useDashboardData();

  // Extract and sort all upcoming deadlines using utility function
  const upcomingDeadlines = useMemo(
    () => getUpcomingDeadlines(activeDealsWithReports),
    [activeDealsWithReports]
  );

  const handleDeadlineClick = (transactionId: string) => {
    navigate(paths.dealDetails(transactionId));
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'critical':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'normal':
        return theme.palette.success.main;
    }
  };

  const getUrgencyBgColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'critical':
        return alpha(theme.palette.error.main, 0.1);
      case 'warning':
        return alpha(theme.palette.warning.main, 0.1);
      case 'normal':
        return alpha(theme.palette.success.main, 0.1);
    }
  };

  const formatDaysRemaining = (days: number): string => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: dashboardSpacing.cardPaddingSm,
          borderRadius: 2,
          bgcolor: 'background.paper',
          height: '100%',
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="40%" height={20} />
          <Stack spacing={1}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={56} />
            ))}
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: dashboardSpacing.cardPaddingSm,
        borderRadius: 2,
        bgcolor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconifyIcon
              icon="material-symbols:calendar-clock-rounded"
              sx={{ fontSize: 18, color: 'warning.main' }}
            />
          </Box>
          <Typography variant="h3">Upcoming Deadlines</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Next 7 days
        </Typography>
      </Stack>

      {/* Deadline List */}
      {upcomingDeadlines.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <IconifyIcon
              icon="material-symbols:event-available-rounded"
              sx={{ fontSize: 48, color: 'text.disabled' }}
            />
            <Typography variant="body2" color="text.secondary">
              No upcoming deadlines
            </Typography>
          </Stack>
        </Box>
      ) : (
        <List
          sx={{
            flex: 1,
            overflow: 'auto',
            mx: -dashboardSpacing.cardPaddingSm,
            px: dashboardSpacing.cardPaddingSm,
          }}
          disablePadding
        >
          {upcomingDeadlines.slice(0, 5).map((deadline, index) => {
            const urgency = getUrgencyLevel(deadline.daysRemaining);
            const urgencyColor = getUrgencyColor(urgency);
            const urgencyBgColor = getUrgencyBgColor(urgency);

            return (
              <ListItem key={`${deadline.transactionId}-${deadline.deadlineType}-${index}`} disablePadding>
                <ListItemButton
                  onClick={() => handleDeadlineClick(deadline.transactionId)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: urgencyBgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    <IconifyIcon
                      icon={DEADLINE_TYPE_ICONS[deadline.deadlineType]}
                      sx={{ fontSize: 18, color: urgencyColor }}
                    />
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {deadline.dealName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {DEADLINE_TYPE_LABELS[deadline.deadlineType]}
                      </Typography>
                    }
                    sx={{ mr: 1, minWidth: 0 }}
                  />
                  <Chip
                    label={formatDaysRemaining(deadline.daysRemaining)}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: urgencyBgColor,
                      color: urgencyColor,
                      flexShrink: 0,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      {/* Show count if more than 5 */}
      {upcomingDeadlines.length > 5 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, textAlign: 'center' }}
        >
          +{upcomingDeadlines.length - 5} more deadlines
        </Typography>
      )}
    </Paper>
  );
};

export default UpcomingDeadlines;
