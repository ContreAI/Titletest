import { Box, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import paths from 'routes/paths';

const SubscriptionPreview = () => {
  const navigate = useNavigate();
  const subscriptionData = {
    plan: 'Pro Tier',
    nextBilling: 'October 28, 2025',
    monthlyPrice: 99,
  };

  const handleChangePlan = () => {
    navigate(paths.accountSettingsSubscription);
  };

  const handleRemove = () => {
    navigate(paths.accountSettingsSubscription);
  };

  return (
    <Box>
      <Typography
        variant="body1"
        sx={{
          fontFamily: (theme) => theme.typography.fontFamily,
          fontWeight: 600,
          fontSize: '1.125rem',
          mb: 1,
        }}
      >
        Subscription
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your active plan and usage details.
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Current Plan: {subscriptionData.plan}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Renews on {subscriptionData.nextBilling}. You are billed{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>
              ${subscriptionData.monthlyPrice}/month
            </Box>
            .
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ textTransform: 'none' }}
            onClick={handleChangePlan}
          >
            Change Plan
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{ textTransform: 'none' }}
            onClick={handleRemove}
          >
            Remove
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SubscriptionPreview;

