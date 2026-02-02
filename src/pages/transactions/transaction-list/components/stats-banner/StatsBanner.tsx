import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import type { Deal } from 'types/deals';
import StatCard from './StatCard';
import { useStatsData } from './useStatsData';
import { useTransactionReports } from 'modules/transaction-reports';

interface StatsBannerProps {
  deals: Deal[];
  documentsProcessed?: number;
}

/**
 * StatsBanner - 3-card stats banner showing key metrics
 *
 * Cards:
 * 1. Hours Saved - Value proof ("This tool pays for itself")
 * 2. Projected Commission - Excitement ("Money is coming!")
 * 3. Closing Soon - Anticipation ("Almost there!")
 */
const StatsBanner = ({ deals, documentsProcessed = 0 }: StatsBannerProps) => {
  const theme = useTheme();
  const { transactionReports } = useTransactionReports();
  const stats = useStatsData(deals, documentsProcessed, transactionReports);

  // Use theme palette colors
  const successColor = theme.palette.success.main;
  const warningColor = theme.palette.warning.main;
  const primaryColor = theme.palette.primary.main;

  return (
    <Grid container spacing={2}>
      {/* Hours Saved */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          icon="mdi:clock-outline"
          iconColor={successColor}
          title="Hours Saved"
          value={stats.hoursSaved}
          subtitle={stats.hoursSubtitle}
        />
      </Grid>

      {/* Projected Commission */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          icon="mdi:currency-usd"
          iconColor={warningColor}
          title="Projected Commission"
          value={stats.projectedCommission}
          subtitle={stats.commissionSubtitle}
        />
      </Grid>

      {/* Closing Soon */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          icon="mdi:calendar-check"
          iconColor={primaryColor}
          title="Closing Soon"
          value={`${stats.closingSoonCount} deal${stats.closingSoonCount !== 1 ? 's' : ''}`}
          subtitle={stats.closingSoonSubtitle}
        />
      </Grid>
    </Grid>
  );
};

export default StatsBanner;

