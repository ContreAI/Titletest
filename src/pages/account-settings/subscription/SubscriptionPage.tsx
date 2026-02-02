import { useState } from 'react';
import { Box, Divider, CircularProgress, Alert } from '@mui/material';
import SectionHeader from 'components/base/SectionHeader';
import { SubscriptionDetails, UsageMetrics, PaymentMethod } from './components';
import { useSubscription } from 'modules/subscription/hooks/useSubscription';
import { usePaymentMethods } from 'modules/billing/hooks/useBilling';

const SubscriptionPage = () => {
  const [_showCancelDialog, setShowCancelDialog] = useState(false);

  // Use real API data
  const {
    formattedSubscription,
    formattedUsage,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    hasSubscription: _hasSubscription,
  } = useSubscription();

  const {
    defaultPaymentMethod,
    isLoading: paymentLoading,
    error: paymentError,
  } = usePaymentMethods();

  const isLoading = subscriptionLoading || paymentLoading;
  const error = subscriptionError || paymentError;

  const handleChangePlan = () => {
    console.log('Change plan');
    // TODO: Implement change plan dialog
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
    // TODO: Implement cancel subscription dialog
  };

  const handleEditPayment = () => {
    console.log('Edit payment method');
    // TODO: Implement edit payment method dialog
  };

  const handleAddPayment = () => {
    console.log('Add new payment method');
    // TODO: Implement add payment method dialog
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load subscription data. Please try again later.
        </Alert>
      </Box>
    );
  }

  // Use formatted data from API or fallback to defaults for no subscription
  const subscriptionData = formattedSubscription || {
    plan: 'Free',
    nextBilling: 'N/A',
    monthlyPrice: 0,
    usage: formattedUsage,
    status: 'active' as const,
    cancelAtPeriodEnd: false,
  };

  const paymentMethod = defaultPaymentMethod || {
    id: '',
    type: 'Card',
    last4: '****',
    expiry: '',
    isDefault: true,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.75 }}>
      {/* Subscription Details */}
      <Box>
        <SectionHeader
          title="Subscription"
          description="Your active plan and usage details."
          sx={{ mb: 3 }}
        />

        <SubscriptionDetails
          plan={subscriptionData.plan}
          nextBilling={subscriptionData.nextBilling}
          monthlyPrice={subscriptionData.monthlyPrice}
          onChangePlan={handleChangePlan}
          onCancel={handleCancel}
        />

        {/* Usage Metrics */}
        <Box sx={{ mt: 3.75 }}>
          <UsageMetrics
            documentsAnalyzed={subscriptionData.usage.documentsAnalyzed}
            timeSaved={subscriptionData.usage.timeSaved}
            criticalErrors={subscriptionData.usage.criticalErrors}
          />
        </Box>
      </Box>

      <Divider />

      {/* Payment Method */}
      <PaymentMethod
        type={paymentMethod.type}
        last4={paymentMethod.last4}
        expiry={paymentMethod.expiry}
        isDefault={paymentMethod.isDefault}
        onEdit={handleEditPayment}
        onAddNew={handleAddPayment}
      />
    </Box>
  );
};

export default SubscriptionPage;
