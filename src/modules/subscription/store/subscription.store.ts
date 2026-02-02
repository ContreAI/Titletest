/**
 * Subscription Store - Manages subscription state
 */

import { create } from 'zustand';
import {
  subscriptionControllerGetCurrentSubscription,
  subscriptionControllerGetAvailablePlans,
} from '@contreai/api-client';
import type { SubscriptionStore, AvailablePlan, Subscription } from '../typings/subscription.types';

const initialState = {
  subscription: null as Subscription | null,
  availablePlans: [] as AvailablePlan[],
  isLoading: false,
  error: null as string | null,
};

export const useSubscriptionStore = create<SubscriptionStore>()((set) => ({
  ...initialState,

  /**
   * Fetch current subscription with usage data
   */
  fetchSubscription: async () => {
    set({ isLoading: true, error: null });

    try {
      // Use generated client - response is SubscriptionWithUsageDto directly (no wrapper)
      const subscription = await subscriptionControllerGetCurrentSubscription();

      set({
        subscription: subscription as Subscription,
        isLoading: false,
      });
    } catch (error) {
      console.error('[Subscription] Failed to fetch subscription:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch subscription',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Fetch available subscription plans
   */
  fetchAvailablePlans: async () => {
    set({ isLoading: true, error: null });

    try {
      // Use generated client - response is AvailablePlanDto[] directly (no wrapper)
      const plans = await subscriptionControllerGetAvailablePlans();

      set({
        availablePlans: (plans || []) as unknown as AvailablePlan[],
        isLoading: false,
      });
    } catch (error) {
      console.error('[Subscription] Failed to fetch plans:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch plans',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Clear any error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset the store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));
