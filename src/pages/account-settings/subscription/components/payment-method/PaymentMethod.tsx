import { Button, Card, CardContent, Stack, Typography, Box } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface PaymentMethodProps {
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
  onEdit: () => void;
  onAddNew: () => void;
}

const PaymentMethod = ({
  type,
  last4,
  expiry,
  isDefault,
  onEdit,
  onAddNew,
}: PaymentMethodProps) => {
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
        Payment Method
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Credit or Debit Card for Payments.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body1"
          sx={{
            fontFamily: (theme) => theme.typography.fontFamily,
            fontWeight: 600,
            fontSize: '1rem',
            mb: 0.5,
          }}
        >
          Payment Method
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage your payment information and billing details.
        </Typography>

        <Card sx={{ bgcolor: 'background.paper', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 32,
                    bgcolor: 'primary.dark',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'common.white',
                    fontFamily: (theme) => theme.typography.fontFamily,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                  }}
                >
                  {type.toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    •••• •••• •••• {last4}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expires {expiry}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 2, flexShrink: 0 }}>
                {isDefault && (
                  <Typography variant="body2" sx={{ color: 'success.main', textTransform: 'none' }}>
                    Default
                  </Typography>
                )}
                <Button variant="text" color="primary" sx={{ textTransform: 'none', minWidth: 'auto' }} onClick={onEdit}>
                  Edit
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Button
        variant="outlined"
        startIcon={<IconifyIcon icon="custom:account-credit-card" />}
        sx={{ textTransform: 'none' }}
        onClick={onAddNew}
      >
        Add New Payment Method
      </Button>
    </Box>
  );
};

export default PaymentMethod;

