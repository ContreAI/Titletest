import { Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { SummaryCards, LeadSources } from '../components';
import { OngoingDeals, Activities } from './components';

const UserHome = () => {
  return (
    <Stack spacing={2} direction="column" sx={{ width: '100%' }}>
      {/* Summary Cards and Lead Sources Section */}
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }} sx={{ display: 'flex' }}>
          <SummaryCards />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex' }}>
          <LeadSources />
        </Grid>
      </Grid>

      {/* Ongoing Deals and Activities Section */}
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OngoingDeals />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Activities />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default UserHome;

