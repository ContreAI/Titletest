import { Button, Stack, Typography, Box } from '@mui/material';

interface SubscriptionDetailsProps {
  plan: string;
  nextBilling: string;
  monthlyPrice: number;
  onChangePlan: () => void;
  onCancel: () => void;
}

const SubscriptionDetails = ({
  plan,
  nextBilling,
  monthlyPrice,
  onChangePlan,
  onCancel,
}: SubscriptionDetailsProps) => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body1"
          sx={{
            fontFamily: (theme) => theme.typography.fontFamily,
            fontWeight: 600,
            fontSize: '1rem',
            mb: 0.5,
            color: 'primary.main',
          }}
        >
          {plan}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Next Billing:{' '}
          <Box component="span" sx={{ fontWeight: 600 }}>
            {nextBilling}
          </Box>
          . You are billed{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
            ${monthlyPrice}/month
          </Box>
          .
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} sx={{ ml: 2, flexShrink: 0 }}>
        <Button
          variant="outlined"
          color="primary"
          sx={{ textTransform: 'none' }}
          onClick={onChangePlan}
        >
          Change Plan
        </Button>
        <Button
          variant="outlined"
          color="error"
          sx={{
            textTransform: 'none',
            bgcolor: 'error.lighter',
            borderColor: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              borderColor: 'error.main',
            },
          }}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
};

export default SubscriptionDetails;

