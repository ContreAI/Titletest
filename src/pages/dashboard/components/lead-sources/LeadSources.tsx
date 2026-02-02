import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Divider, Paper, Stack, Typography, IconButton, CircularProgress, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { dashboardSpacing } from 'theme/spacing';
import type { DealStageName } from 'types/deals';
import { useTransactions } from 'modules/transactions';
import { useTransactionReports } from 'modules/transaction-reports';
import { deriveStatusFromTimeline, getStatusDisplayLabel } from 'lib/deal-status';
import LeadSourceItem from './LeadSourceItem';
import DealStageColorDialog from './DealStageColorDialog';
import { useAuthStore } from 'modules/auth/store/auth.store';

// Lazy load ECharts donut chart to reduce initial bundle size
const LeadSourcesDonutChart = lazy(() => import('./LeadSourcesDonutChart'));

// Stable fallback to prevent Suspense re-renders
const ChartFallback = (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
    <CircularProgress size={32} />
  </Box>
);

interface LeadSourceData {
  name: DealStageName;
  value: number;
}

const LeadSources = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { transactions, fetchTransactions } = useTransactions();
  const { transactionReports, fetchTransactionReport } = useTransactionReports();
  const { user } = useAuthStore();

  // Fetch transactions on mount - subsequent updates come via WebSocket
  useEffect(() => {
    fetchTransactions().catch(console.error);
  }, [fetchTransactions]);

  // Fetch reports for transactions that don't have reports cached
  // Initial load only - WebSocket events handle real-time updates
  useEffect(() => {
    transactions.forEach((transaction) => {
      // Check if report is already in the reactive store state, not direct getState()
      if (!transactionReports.has(transaction.id)) {
        fetchTransactionReport(transaction.id).catch(() => {
          // Silently fail - report might not exist yet
        });
      }
    });
  }, [transactions, transactionReports, fetchTransactionReport]);

  // Calculate deal status counts from real transaction data using timeline-derived status
  const leadSourcesData = useMemo((): LeadSourceData[] => {
    // Filter out cancelled and completed transactions (show only active pipeline)
    const activeTransactions = transactions.filter(t =>
      t.status !== 'cancelled' && t.status !== 'completed' && t.status !== 'closed'
    );

    // Count transactions by timeline-derived status
    const statusCounts: Record<string, number> = {
      'Active': 0,
      'Post EM': 0,
      'Inspection Cleared': 0,
      'Ready for Close': 0,
    };

    activeTransactions.forEach((transaction) => {
      const report = transactionReports.get(transaction.id);
      // Derive status from timeline dates - single source of truth matching kanban logic
      // Falls back to 'active' when no timeline data exists
      const derivedStatus = deriveStatusFromTimeline(report?.data, 'active');
      const displayLabel = getStatusDisplayLabel(derivedStatus);

      if (displayLabel in statusCounts) {
        statusCounts[displayLabel]++;
      } else {
        // If status is not in our display columns, count as Active
        statusCounts['Active']++;
      }
    });

    return [
      { name: 'Active', value: statusCounts['Active'] },
      { name: 'Post EM', value: statusCounts['Post EM'] },
      { name: 'Inspection Cleared', value: statusCounts['Inspection Cleared'] },
      { name: 'Ready for Close', value: statusCounts['Ready for Close'] },
    ];
  }, [transactions, transactionReports]);

  const totalLeads = useMemo(() => {
    return leadSourcesData.reduce((sum, item) => sum + item.value, 0);
  }, [leadSourcesData]);

  return (
    <>
    <Paper
      elevation={0}
      sx={{
        p: dashboardSpacing.cardPaddingSm,
        borderRadius: 2,
        bgcolor: 'background.paper',
        height: '100%',
        width: '100%',
      }}
    >
      <Grid container spacing={dashboardSpacing.componentSpacing}>
        {/* Left Column */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={4} direction="column" sx={{ height: '100%' }}>
            {/* Header */}
            <Stack spacing={0.5} direction="column">
              <Typography variant="h3">
                Deal Status
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 'broker' ? 'Overall look at brokerage deals' : 'Quick look at deal status'}
              </Typography>
            </Stack>

            {/* Category labels with bars - 2x2 grid */}
            <Grid container spacing={1} sx={{ width: '100%' }}>
              {leadSourcesData.map((item) => (
                <Grid key={item.name} size={6}>
                  <LeadSourceItem name={item.name} value={item.value} total={totalLeads} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Grid>

        {/* Divider - hidden on xs */}
        <Grid size="auto" sx={{ display: { xs: 'none', sm: 'block', py: 3 } }}>
          <Divider orientation="vertical" sx={{ height: '100%' }} />
        </Grid>

        {/* Right Column - Donut Chart */}
        <Grid size={{ xs: 12, sm: 'grow' }} sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setDialogOpen(true)}
            aria-label="More options"
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              borderRadius: 1,
              width: 36,
              height: 36,
              zIndex: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <IconifyIcon icon="material-symbols:more-horiz" sx={{ fontSize: 20 }} />
          </IconButton>
          <Stack
            sx={{
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { sm: '100%' }
            }}
          >
            <Suspense fallback={ChartFallback}>
              <LeadSourcesDonutChart data={leadSourcesData} total={totalLeads} />
            </Suspense>
          </Stack>
        </Grid>
      </Grid>
    </Paper>

    <DealStageColorDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default LeadSources;
