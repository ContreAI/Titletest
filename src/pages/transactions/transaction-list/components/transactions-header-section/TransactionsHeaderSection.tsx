import { Button, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router';
import PageBreadcrumb from 'components/sections/common/PageBreadcrumb';
import IconifyIcon from 'components/base/IconifyIcon';

const TransactionsHeaderSection = () => {
  const navigate = useNavigate();

  const handleNewTransaction = () => {
    navigate('/transactions/new');
  };

  return (
    <Grid size={12}>
      <Paper sx={{ bgcolor: 'background.paper', p: 2 }}>
        <Grid container direction="column" spacing={1.5}>
          {/* Breadcrumb */}
          <Grid size={12}>
            <PageBreadcrumb
              items={[
                { label: 'Home', url: '/' },
                { label: 'Transactions', active: true },
              ]}
            />
          </Grid>

          {/* Header - Title + Action Button */}
          <Grid size={12}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              sx={{ width: '100%' }}
            >
              {/* Title */}
              <Typography variant="h3" sx={{ flexShrink: 0 }}>
                Your Transactions
              </Typography>

              {/* Action Button */}
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<IconifyIcon icon="material-symbols:add" />}
                onClick={handleNewTransaction}
              >
                New Transaction
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default TransactionsHeaderSection;

