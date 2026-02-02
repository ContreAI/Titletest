import { useEffect, useMemo } from 'react';
import { useSubscriptionStore } from '../store/subscription.store';
import type { FormattedSubscription, FormattedUsage } from '../typings/subscription.types';

/**
 * Hook for subscription management
 * Provides subscription data and formatted display values
 */
export function useSubscription() {
  const {
    subscription,
    availablePlans,
    isLoading,
    error,
    fetchSubscription,
    fetchAvailablePlans,
    clearError,
  } = useSubscriptionStore();

  // Fetch subscription on mount
  useEffect(() => {
    fetchSubscription().catch(() => {
      // Error already handled in store
    });
  }, [fetchSubscription]);

  // Format usage metrics for display
  const formattedUsage = useMemo((): FormattedUsage => {
    if (!subscription?.usage) {
      return {
        documentsAnalyzed: { value: 0, max: 1000 },
        timeSaved: { value: 0, max: 1000 },
        criticalErrors: { value: 0, max: 50 },
      };
    }

    const findMetric = (name: string) =>
      subscription.usage.find((m) => m.name === name) || { value: 0, limit: 1000 };

    const docs = findMetric('documentsAnalyzed');
    const time = findMetric('timeSavedHours');
    const errors = findMetric('criticalErrors');

    return {
      documentsAnalyzed: {
        value: docs.value,
        max: docs.limit === -1 ? Infinity : docs.limit,
      },
      timeSaved: {
        value: time.value,
        max: time.limit === -1 ? Infinity : time.limit,
      },
      criticalErrors: {
        value: errors.value,
        max: errors.limit === -1 ? Infinity : errors.limit,
      },
    };
  }, [subscription?.usage]);

  // Format subscription for display
  const formattedSubscription = useMemo((): FormattedSubscription | null => {
    if (!subscription) return null;

    const planName = subscription.plan?.name || 'Free';
    const nextBilling = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'N/A';
    const monthlyPrice = subscription.price?.unitAmount
      ? subscription.price.unitAmount / 100
      : 0;

    return {
      plan: planName,
      nextBilling: nextBilling,
      monthlyPrice: monthlyPrice,
      usage: formattedUsage,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }, [subscription, formattedUsage]);

  // Check if subscription is active
  const isActive = useMemo(() => {
    if (!subscription) return false;
    return ['active', 'trialing'].includes(subscription.status);
  }, [subscription]);

  // Check if subscription will cancel at period end
  const willCancel = subscription?.cancelAtPeriodEnd || false;

  // Check if in trial
  const isTrialing = subscription?.status === 'trialing';

  // Check if past due (API uses camelCase 'pastDue')
  const isPastDue = subscription?.status === 'pastDue';

  return {
    // Raw data
    subscription,
    availablePlans,
    isLoading,
    error,

    // Formatted data
    formattedSubscription,
    formattedUsage,

    // Status flags
    isActive,
    willCancel,
    isTrialing,
    isPastDue,
    hasSubscription: !!subscription,

    // Actions
    fetchSubscription,
    fetchAvailablePlans,
    clearError,
  };
}

/**
 * Hook for available plans (lazy loading)
 */
export function useAvailablePlans() {
  const { availablePlans, isLoading, error, fetchAvailablePlans } = useSubscriptionStore();

  useEffect(() => {
    if (availablePlans.length === 0) {
      fetchAvailablePlans().catch(() => {
        // Error already handled in store
      });
    }
  }, [availablePlans.length, fetchAvailablePlans]);

  return {
    plans: availablePlans,
    isLoading,
    error,
    refetch: fetchAvailablePlans,
  };
}
