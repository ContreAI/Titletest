import { useEffect, useMemo, useCallback } from 'react';
import { useBillingStore } from '../store/billing.store';
import type {
  FormattedInvoice,
  FormattedPaymentMethod,
  InvoiceQueryParams,
} from '../typings/billing.types';

/**
 * Hook for billing/invoice management
 * Provides invoice history and formatted display values
 */
export function useBilling() {
  const {
    invoices,
    pagination,
    isLoading,
    error,
    fetchInvoices,
    clearError,
  } = useBillingStore();

  // Fetch invoices on mount
  useEffect(() => {
    fetchInvoices().catch(() => {
      // Error already handled in store
    });
  }, [fetchInvoices]);

  // Format invoices for display
  const formattedInvoices = useMemo((): FormattedInvoice[] => {
    return invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber || `INV-${invoice.id.slice(-8).toUpperCase()}`,
      date: invoice.createdAt
        ? new Date(invoice.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'N/A',
      plan: invoice.description || 'Subscription',
      amount: invoice.amountDue / 100, // Convert cents to dollars
      status: invoice.status,
      downloadUrl: invoice.invoicePdf || undefined,
    }));
  }, [invoices]);

  // Paginate invoices
  const loadMore = useCallback(
    async (params?: InvoiceQueryParams) => {
      const nextPage = pagination ? pagination.page + 1 : 1;
      await fetchInvoices({ ...params, page: nextPage });
    },
    [pagination, fetchInvoices]
  );

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return {
    // Raw data
    invoices,
    pagination,
    isLoading,
    error,

    // Formatted data
    formattedInvoices,

    // Pagination
    hasMore,
    loadMore,

    // Actions
    fetchInvoices,
    clearError,
  };
}

/**
 * Hook for payment methods management
 */
export function usePaymentMethods() {
  const { paymentMethods, isLoading, error, fetchPaymentMethods, clearError } =
    useBillingStore();

  // Fetch payment methods on mount
  useEffect(() => {
    fetchPaymentMethods().catch(() => {
      // Error already handled in store
    });
  }, [fetchPaymentMethods]);

  // Format payment methods for display
  const formattedPaymentMethods = useMemo((): FormattedPaymentMethod[] => {
    return paymentMethods.map((pm) => {
      let type: string = pm.type;
      let last4 = '';
      let expiry = '';

      if (pm.type === 'card' && pm.cardBrand) {
        type = pm.cardBrand.charAt(0).toUpperCase() + pm.cardBrand.slice(1);
        last4 = pm.cardLast4 || '****';
        expiry =
          pm.cardExpMonth && pm.cardExpYear
            ? `${pm.cardExpMonth.toString().padStart(2, '0')}/${pm.cardExpYear.toString().slice(-2)}`
            : '';
      } else if (pm.type === 'bankAccount' || pm.type === 'usBankAccount') {
        // API uses camelCase for payment method types
        type = pm.bankName || 'Bank Account';
        last4 = pm.bankLast4 || '****';
      }

      return {
        id: pm.id,
        type,
        last4,
        expiry,
        isDefault: pm.isDefault,
      };
    });
  }, [paymentMethods]);

  // Get default payment method
  const defaultPaymentMethod = useMemo(() => {
    return formattedPaymentMethods.find((pm) => pm.isDefault) || formattedPaymentMethods[0] || null;
  }, [formattedPaymentMethods]);

  return {
    // Raw data
    paymentMethods,
    isLoading,
    error,

    // Formatted data
    formattedPaymentMethods,
    defaultPaymentMethod,

    // Actions
    fetchPaymentMethods,
    clearError,
  };
}
