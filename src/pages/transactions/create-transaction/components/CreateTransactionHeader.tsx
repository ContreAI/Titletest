import { Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import PageBreadcrumb from 'components/sections/common/PageBreadcrumb';

const CreateTransactionHeader = () => {
  return (
    <Paper sx={{ bgcolor: 'background.paper', p: 2 }}>
      <Grid container direction="column" spacing={1.5}>
        {/* Breadcrumb */}
        <Grid>
          <PageBreadcrumb
            items={[
              { label: 'Home', url: '/' },
              { label: 'Transactions', url: '/transactions' },
              { label: 'Create Transaction', active: true },
            ]}
          />
        </Grid>

        {/* Title */}
        <Grid>
          <Typography variant="h3">Create Transaction</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CreateTransactionHeader;

