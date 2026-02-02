import { Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import SectionHeader from 'components/base/SectionHeader';
import SectionDivider from 'components/base/SectionDivider';
import { dashboardSpacing } from 'theme/spacing';
import { SummaryCards, LeadSources, UpcomingDeadlines, AtRiskDeals } from '../components';
import { DealsBoard } from './components';

const BrokerHome = () => {
  return (
    <Stack spacing={dashboardSpacing.sectionSpacing} direction="column" sx={{ width: '100%' }}>
      {/* Summary Cards and Lead Sources Section */}
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }} sx={{ display: 'flex' }}>
          <SummaryCards />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <LeadSources />
        </Grid>
      </Grid>

      {/* Upcoming Deadlines and Risk Overview Section */}
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <UpcomingDeadlines />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <AtRiskDeals />
        </Grid>
      </Grid>

      {/* Section Divider */}
      <SectionDivider />

      {/* Deals Board */}
      <SectionHeader
        title="Overall look at brokerage deals"
        level="h3"
      />
      <DealsBoard />
    </Stack>
  );
};

export default BrokerHome;
