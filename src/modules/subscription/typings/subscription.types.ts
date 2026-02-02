/**
 * Subscription types
 *
 * Core types are imported from @contreai/api-client (SubscriptionWithUsageDto, etc.)
 * UI-specific types (AvailablePlan, FormattedSubscription, store types) remain local.
 */

import type {
  SubscriptionWithUsageDto,
  SubscriptionWithUsageDtoStatus,
  UsageMetricDto,
  PlanDto,
  PriceDto,
} from '@contreai/api-client';

// Re-export API types for convenience
export type { SubscriptionWithUsageDto, UsageMetricDto, PlanDto, PriceDto };

/**
 * Type alias for subscription - uses API DTO directly
 */
export type Subscription = SubscriptionWithUsageDto;

/**
 * Type alias for usage metric - uses API DTO directly
 */
export type UsageMetric = UsageMetricDto;

/**
 * Type alias for plan - uses API DTO directly
 */
export type Plan = PlanDto;

/**
 * Type alias for price - uses API DTO directly
 */
export type Price = PriceDto;

/**
 * Subscription status type - uses API DTO status type
 * Note: API uses camelCase values (e.g., 'pastDue', 'incompleteExpired')
 */
export type SubscriptionStatus = SubscriptionWithUsageDtoStatus;

/**
 * Recurring interval type for price
 */
export type RecurringInterval = 'day' | 'week' | 'month' | 'year';

// ============================================================================
// UI-specific types (not in API)
// ============================================================================

export interface AvailablePlan {
  id: string;
  name: string;
  description?: string;
  prices: Price[];
  limits: PlanLimits;
}

export interface PlanLimits {
  documentsAnalyzed: number;
  timeSavedHours: number;
  criticalErrors: number;
  storageGb: number;
  teamMembers: number;
  [key: string]: unknown;
}

// Store types
export interface SubscriptionStore {
  subscription: Subscription | null;
  availablePlans: AvailablePlan[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubscription: () => Promise<void>;
  fetchAvailablePlans: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// API response types
export interface GetSubscriptionResponse {
  success: boolean;
  data: Subscription | null;
}

export interface GetAvailablePlansResponse {
  success: boolean;
  data: AvailablePlan[];
}

// Formatted display types for UI
export interface FormattedUsage {
  documentsAnalyzed: { value: number; max: number };
  timeSaved: { value: number; max: number };
  criticalErrors: { value: number; max: number };
}

export interface FormattedSubscription {
  plan: string;
  nextBilling: string;
  monthlyPrice: number;
  usage: FormattedUsage;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
}
