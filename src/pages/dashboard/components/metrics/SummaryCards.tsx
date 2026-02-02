import { useEffect, useMemo, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import { useTransactions } from 'modules/transactions';
import { useTransactionReports } from 'modules/transaction-reports';
import { useTenant } from 'modules/tenant';
import { useAuthStore } from 'modules/auth';
import { getAxiosInstance } from '@contreai/api-client';
import { calculatePercentageIncrement } from 'lib/utils';
import { deriveStatusFromTimeline } from 'lib/deal-status';
import MetricCard from './MetricCard';
import AddLogoCard from './AddLogoCard';

// Storage key for yesterday's metrics
const YESTERDAY_METRICS_KEY = 'dashboard_yesterday_metrics';
const YESTERDAY_DATE_KEY = 'dashboard_yesterday_date';

interface YesterdayMetrics {
  activeDeals: number;
  projectedCommissions: number;
  preContingencyClear: number;
  readyForClose: number;
  closed: number;
}

const SummaryCards = () => {
  const { transactions, fetchTransactions } = useTransactions();
  const { transactionReports, fetchTransactionReport } = useTransactionReports();
  const { activeTenant } = useTenant();
  const { user, updateUser } = useAuthStore();

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

  // Get or initialize yesterday's metrics
  const getYesterdayMetrics = (): YesterdayMetrics | null => {
    try {
      const storedDate = localStorage.getItem(YESTERDAY_DATE_KEY);
      const today = new Date().toDateString();

      // If stored date is not today, return stored metrics (yesterday's)
      if (storedDate && storedDate !== today) {
        const stored = localStorage.getItem(YESTERDAY_METRICS_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to get yesterday metrics:', error);
    }
    return null;
  };

  // Save today's metrics as yesterday's for next time
  const saveTodayAsYesterday = (metrics: YesterdayMetrics) => {
    try {
      const today = new Date().toDateString();
      localStorage.setItem(YESTERDAY_METRICS_KEY, JSON.stringify(metrics));
      localStorage.setItem(YESTERDAY_DATE_KEY, today);
    } catch (error) {
      console.error('Failed to save yesterday metrics:', error);
    }
  };

  // Calculate metrics from real transaction data using timeline-derived status
  const { metrics, rawMetrics } = useMemo(() => {
    // Filter out cancelled transactions
    const nonCancelledTransactions = transactions.filter(t => t.status !== 'cancelled');

    // Derive status for each transaction using timeline dates
    // Timeline data is the single source of truth - falls back to 'active' when no timeline exists
    const transactionsWithDerivedStatus = nonCancelledTransactions.map(transaction => {
      const report = transactionReports.get(transaction.id);
      const derivedStatus = deriveStatusFromTimeline(report?.data, 'active');
      return { transaction, report, derivedStatus };
    });

    // Count active deals (not completed/closed based on derived status)
    const activeDeals = transactionsWithDerivedStatus.filter(
      ({ derivedStatus }) => derivedStatus !== 'completed' && derivedStatus !== 'closed'
    ).length;

    // Calculate projected commissions from transaction reports (sum of purchase prices for non-completed)
    let projectedCommissions = 0;
    transactionsWithDerivedStatus
      .filter(({ derivedStatus }) => derivedStatus !== 'completed' && derivedStatus !== 'closed')
      .forEach(({ report }) => {
        if (report?.data?.purchase_price) {
          // Extract number from price string (e.g., "$500,000" -> 500000)
          const priceStr = report.data.purchase_price.replace(/[^0-9.]/g, '');
          const price = parseFloat(priceStr);
          if (!isNaN(price)) {
            projectedCommissions += price;
          }
        }
      });

    // Count Pre-Contingency Clear (Active or Post EM stage based on derived status)
    const preContingencyClear = transactionsWithDerivedStatus.filter(
      ({ derivedStatus }) => derivedStatus === 'active' || derivedStatus === 'post_em'
    ).length;

    // Count Ready for Close (based on derived status)
    const readyForClose = transactionsWithDerivedStatus.filter(
      ({ derivedStatus }) => derivedStatus === 'ready_for_close'
    ).length;

    // Count Closed (completed based on derived status)
    const closed = transactionsWithDerivedStatus.filter(
      ({ derivedStatus }) => derivedStatus === 'completed' || derivedStatus === 'closed'
    ).length;

    // Store raw metrics for saving
    const rawMetrics: YesterdayMetrics = {
      activeDeals,
      projectedCommissions,
      preContingencyClear,
      readyForClose,
      closed,
    };

    // Get yesterday's metrics
    const yesterdayMetrics = getYesterdayMetrics();

    // Calculate percentage changes
    const calculateChange = (today: number, yesterday: number | null): { percentage: number; trend: 'up' | 'down' } => {
      if (yesterday === null || yesterday === 0) {
        return { percentage: 0, trend: 'up' };
      }
      const percentage = calculatePercentageIncrement(today, yesterday);
      return {
        percentage: Math.abs(percentage),
        trend: percentage >= 0 ? 'up' : 'down',
      };
    };

    const activeDealsChange = calculateChange(activeDeals, yesterdayMetrics?.activeDeals ?? null);
    const projectedCommissionsChange = calculateChange(projectedCommissions, yesterdayMetrics?.projectedCommissions ?? null);
    const preContingencyClearChange = calculateChange(preContingencyClear, yesterdayMetrics?.preContingencyClear ?? null);
    const readyForCloseChange = calculateChange(readyForClose, yesterdayMetrics?.readyForClose ?? null);
    const closedChange = calculateChange(closed, yesterdayMetrics?.closed ?? null);

    const metricsArray = [
      {
        title: 'Active Deals',
        value: activeDeals,
        subtitle: 'Ongoing transactions',
        icon: {
          name: 'custom:broker-active-deal',
          color: 'primary.main',
        },
        trend: activeDealsChange.trend,
        percentage: activeDealsChange.percentage,
      },
      {
        title: 'Projected Commissions',
        value: projectedCommissions > 0 ? `$${projectedCommissions.toLocaleString()}` : '$0',
        subtitle: 'Expected earnings',
        icon: {
          name: 'custom:broker-project-commission',
          color: 'warning.main',
        },
        trend: projectedCommissionsChange.trend,
        percentage: projectedCommissionsChange.percentage,
      },
      {
        title: 'Pre-Contingency Clear',
        value: preContingencyClear,
        subtitle: 'Ready to proceed',
        icon: {
          name: 'custom:broker-pre-contingency-clear',
          color: 'success.main',
        },
        trend: preContingencyClearChange.trend,
        percentage: preContingencyClearChange.percentage,
      },
      {
        title: 'Ready for Close',
        value: readyForClose,
        subtitle: 'Final stage deals',
        icon: {
          name: 'custom:broker-ready-for-close',
          color: 'secondary.main',
        },
        trend: readyForCloseChange.trend,
        percentage: readyForCloseChange.percentage,
      },
      {
        title: 'Closed',
        value: closed,
        subtitle: 'Completed deals',
        icon: {
          name: 'custom:broker-closed',
          color: 'info.main',
        },
        trend: closedChange.trend,
        percentage: closedChange.percentage,
      },
    ];

    return { metrics: metricsArray, rawMetrics };
  }, [transactions, transactionReports]);

  // Save today's metrics for tomorrow (after metrics are calculated)
  useEffect(() => {
    if (rawMetrics) {
      saveTodayAsYesterday(rawMetrics);
    }
  }, [rawMetrics]);

  // Handle company logo file selection and upload
  const handleLogoFileSelect = useCallback(async (file: File) => {
    try {
      // Read file as data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;

        // Upload to profile API (uses camelCase per UpdateProfileDto)
        const payload = {
          firstName: user?.firstName,
          lastName: user?.lastName,
          profileImage: dataUrl,
        };

        await getAxiosInstance().put('/api/v1/users/profile', payload);

        // Update local auth store with new avatar
        updateUser({
          avatar: dataUrl,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload company logo:', error);
    }
  }, [user, updateUser]);

  return (
    <Grid container spacing={2} sx={{ width: '100%' }}>
      {metrics.map((kpi) => (
        <Grid key={kpi.title} size={{ xs: 12, sm: 6, md: 4, lg: 6, xl: 4 }}>
          <MetricCard
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            percentage={kpi.percentage}
          />
        </Grid>
      ))}

      {/* Add Company Logo Card - only show when no brokerage logo is set */}
      {!activeTenant?.logo && (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 6, xl: 4 }}>
          <AddLogoCard onFileSelect={handleLogoFileSelect} />
        </Grid>
      )}
    </Grid>
  );
};

export default SummaryCards;
