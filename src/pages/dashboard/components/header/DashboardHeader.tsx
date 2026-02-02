import { useState, useMemo } from 'react';
import { Button, Menu, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import { dashboardSpacing } from 'theme/spacing';
import { useAuth } from 'modules/auth';
import { useSubscription } from 'modules/subscription/hooks/useSubscription';
import { useDashboardData } from '../../hooks/useDashboardData';
import { calculateHeaderStats } from './header-stats-utils';
import DateRangePicker from 'components/base/DateRangePicker';
import IconifyIcon from 'components/base/IconifyIcon';

const DashboardHeader = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuth();
  const { formattedUsage } = useSubscription();
  const { dealsWithReports } = useDashboardData();

  const handleOpenCalendar = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCalendar = () => setAnchorEl(null);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate header stats from real data
  const headerStats = useMemo(
    () => calculateHeaderStats(dealsWithReports, formattedUsage),
    [dealsWithReports, formattedUsage]
  );

  return (
    <Grid container mb={dashboardSpacing.headerMarginBottom}>
      <Grid size={12}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            gap: dashboardSpacing.contentGapSm,
            pb: dashboardSpacing.headerMarginBottom,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack spacing={0.5} direction="column">
            <Typography variant="h2">
              {getGreeting()}, {user?.firstName || 'Captain'}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here's what happening with your store today!
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              gap: dashboardSpacing.contentGapSm,
              flexWrap: 'wrap',
              width: { xs: 1, md: 'auto' },
            }}
          >
            {headerStats.map(({ label, count }) => (
              <Paper
                key={label}
                elevation={0}
                sx={{
                  px: 1.5,
                  py: .5,
                  borderRadius: 1,
                  minWidth: { xs: '100%', sm: 160 },
                  height: { sm: '100%' },
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography variant="monoLarge" sx={{ lineHeight: 1, mb: 0 }}>
                  {count}
                </Typography>
                <Typography variant="body2"  color="text.disabled">
                  {label}
                </Typography>
              </Paper>
            ))}

            <Button
              variant="outlined"
              onClick={handleOpenCalendar}
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                height: 'auto',
                px: 2,
                my: 0,
                borderRadius: 2,
                bgcolor: 'background.elevation1',
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'background.elevation3',
                  borderColor: 'action.disabled',
                },
              }}
              startIcon={<IconifyIcon icon="material-symbols:calendar-month-outline" />}
              endIcon={<IconifyIcon icon="material-symbols:keyboard-arrow-down-rounded" />}
            >
              Calendar
            </Button>
          </Stack>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseCalendar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { p: dashboardSpacing.cardPaddingSm, minWidth: 320 } } }}
        >
          <DateRangePicker
            withPortal
            dateFormat="d MMM, yy"
            defaultStartDate={dayjs().subtract(7, 'day').toDate()}
            defaultEndDate={dayjs().toDate()}
          />
        </Menu>
      </Grid>
    </Grid>
  );
};

export default DashboardHeader;

