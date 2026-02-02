import { Button, Stack, Typography, Divider, Alert, Link } from '@mui/material';
import { UseFormGetValues } from 'react-hook-form';
import IconifyIcon from 'components/base/IconifyIcon';
import type { TransactionFormData } from 'modules/transactions';
import { representationOptions } from '../data/formOptions';
import { useTransactionPropertyTypes } from 'modules/transaction-property-types';

// Icon mapping for property types
const getPropertyTypeIcon = (propertyType: string): string => {
  const iconMap: Record<string, string> = {
    'Single Family': 'mdi:home-outline',
    'Condo/Townhouse': 'mdi:office-building-outline',
    'Land': 'mdi:terrain',
    'Commercial': 'mdi:office-building-marker-outline',
    'Other': 'mdi:dots-horizontal',
  };
  return iconMap[propertyType] || 'mdi:home-outline';
};

interface ReviewTransactionStepProps {
  getValues: UseFormGetValues<TransactionFormData>;
  onCancel: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isCreating: boolean;
}

const ReviewTransactionStep = ({
  getValues,
  onCancel,
  onBack,
  onSubmit,
  isCreating,
}: ReviewTransactionStepProps) => {
  const values = getValues();
  const { getPropertyTypeByName } = useTransactionPropertyTypes();

  const representationInfo = representationOptions.find((opt) => opt.value === values.representing);
  const propertyType = getPropertyTypeByName(values.propertyType);

  const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Stack spacing={1.5} sx={{ py: 2.5 }} alignItems="center">
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Stack alignItems="center">
        {children}
      </Stack>
    </Stack>
  );

  return (
    <Stack spacing={2.5} direction="column">
      {/* Review Content */}
      <Stack spacing={0} direction="column">
        <InfoRow label="Transaction Name">
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.125rem' }}>
            {values.transactionName}
          </Typography>
        </InfoRow>

        <Divider sx={{ borderColor: 'divider' }} />

        <InfoRow label="I'm Representing">
          {representationInfo && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconifyIcon icon={representationInfo.icon} sx={{ fontSize: 24, color: 'primary.main' }} />
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {representationInfo.label}
              </Typography>
            </Stack>
          )}
        </InfoRow>

        <Divider sx={{ borderColor: 'divider' }} />

        <InfoRow label="Property Address">
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${values.propertyAddress.streetAddress}, ${values.propertyAddress.city}, ${values.propertyAddress.state} ${values.propertyAddress.zipCode || ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              lineHeight: 1.6,
              textAlign: 'center',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            <Typography variant="body1" component="span" sx={{ fontWeight: 500 }}>
              {values.propertyAddress.streetAddress}
              <br />
              {values.propertyAddress.city}, {values.propertyAddress.state} {values.propertyAddress.zipCode}
            </Typography>
          </Link>
        </InfoRow>

        <Divider sx={{ borderColor: 'divider' }} />

        <InfoRow label="Transaction Type">
          {propertyType && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconifyIcon icon={getPropertyTypeIcon(propertyType.propertyType)} sx={{ fontSize: 24, color: 'info.main' }} />
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {propertyType.propertyType}
              </Typography>
            </Stack>
          )}
        </InfoRow>
      </Stack>

      {/* Ready to Create Alert */}
      <Alert
        icon={<IconifyIcon icon="mdi:check-circle" sx={{ fontSize: 24 }} />}
        severity="success"
        sx={{
          bgcolor: 'success.lighter',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'success.light',
          '& .MuiAlert-icon': { color: 'success.main' },
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Ready to Create Transaction
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          Please review all the information above. Once you continue, your transaction will be created.
        </Typography>
      </Alert>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onCancel}
          sx={{ textTransform: 'none', borderRadius: 1, px: 4, minWidth: 120 }}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<IconifyIcon icon="mdi:arrow-left" />}
          onClick={onBack}
          sx={{ textTransform: 'none', borderRadius: 1, px: 4, minWidth: 120 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={isCreating}
          sx={{ textTransform: 'none', borderRadius: 1, px: 4, minWidth: 180 }}
        >
          {isCreating ? 'Creating...' : 'Create Transaction'}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ReviewTransactionStep;

