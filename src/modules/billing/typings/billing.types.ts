/**
 * Billing types
 *
 * Core types are imported from @contreai/api-client (InvoiceDto, PaymentMethodDto, etc.)
 * UI-specific types (FormattedInvoice, FormattedPaymentMethod, store types) remain local.
 */

import type {
  InvoiceDto,
  InvoiceDtoStatus,
  PaymentMethodDto,
  PaymentMethodDtoType,
  PaginationMetaDto,
  BillingControllerGetInvoicesParams,
  GetInvoicesResponseDto,
} from '@contreai/api-client';

// Re-export API types for convenience
export type {
  InvoiceDto,
  InvoiceDtoStatus,
  PaymentMethodDto,
  PaymentMethodDtoType,
  PaginationMetaDto,
  BillingControllerGetInvoicesParams,
  GetInvoicesResponseDto,
};

/**
 * Type alias for invoice - uses API DTO directly
 */
export type Invoice = InvoiceDto;

/**
 * Type alias for payment method - uses API DTO directly
 */
export type PaymentMethod = PaymentMethodDto;

/**
 * Type alias for invoice status - uses API DTO status type
 */
export type InvoiceStatus = InvoiceDtoStatus;

/**
 * Type alias for payment method type - uses API DTO type
 * Note: API uses camelCase values (e.g., 'bankAccount', 'usBankAccount')
 */
export type PaymentMethodType = PaymentMethodDtoType;

/**
 * Type alias for pagination metadata - uses API DTO directly
 */
export type PaginationMeta = PaginationMetaDto;

// ============================================================================
// UI-specific types (not in API or extended for UI needs)
// ============================================================================

/**
 * Extended pagination metadata with optional hasMore field for UI convenience
 */
export interface PaginationMetaExtended extends PaginationMetaDto {
  hasMore?: boolean;
}

/**
 * Invoice query parameters - local type for UI convenience
 * Maps to BillingControllerGetInvoicesParams
 */
export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
}

// Store types
export interface BillingStore {
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchInvoices: (params?: InvoiceQueryParams) => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// API response types (for reference, actual API returns GetInvoicesResponseDto)
export interface GetInvoicesResponse {
  success: boolean;
  data: Invoice[];
  pagination: PaginationMeta;
}

export interface GetPaymentMethodsResponse {
  success: boolean;
  data: PaymentMethod[];
}

// Formatted display types for UI
export interface FormattedInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  plan: string;
  amount: number;
  status: InvoiceStatus;
  downloadUrl?: string;
}

export interface FormattedPaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}
