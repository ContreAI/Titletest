/**
 * Billing Store - Manages invoices and payment methods state
 */

import { create } from 'zustand';
import {
  billingControllerGetInvoices,
  billingControllerGetPaymentMethods,
  type BillingControllerGetInvoicesParams,
} from '@contreai/api-client';
import type {
  BillingStore,
  Invoice,
  PaymentMethod,
  PaginationMeta,
  InvoiceQueryParams,
} from '../typings/billing.types';

const initialState = {
  invoices: [] as Invoice[],
  paymentMethods: [] as PaymentMethod[],
  pagination: null as PaginationMeta | null,
  isLoading: false,
  error: null as string | null,
};

export const useBillingStore = create<BillingStore>()((set) => ({
  ...initialState,

  /**
   * Fetch invoices with optional filters
   */
  fetchInvoices: async (params: InvoiceQueryParams = {}) => {
    set({ isLoading: true, error: null });

    try {
      // Map local params to generated params type
      const apiParams: BillingControllerGetInvoicesParams = {
        page: params.page,
        limit: params.limit,
        status: params.status,
        startDate: params.startDate,
        endDate: params.endDate,
      };

      // Use generated client - response has { data, pagination } structure (no success wrapper)
      const response = await billingControllerGetInvoices(apiParams);

      set({
        invoices: response.data || [],
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error) {
      console.error('[Billing] Failed to fetch invoices:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Fetch payment methods
   */
  fetchPaymentMethods: async () => {
    set({ isLoading: true, error: null });

    try {
      // Use generated client - response is PaymentMethodDto[] directly (no wrapper)
      // Note: API client types GetPaymentMethodsResponseDto as { [key: string]: unknown }
      // but actually returns PaymentMethodDto[], so we cast appropriately
      const paymentMethods = await billingControllerGetPaymentMethods();

      set({
        paymentMethods: (paymentMethods || []) as unknown as PaymentMethod[],
        isLoading: false,
      });
    } catch (error) {
      console.error('[Billing] Failed to fetch payment methods:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch payment methods',
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
