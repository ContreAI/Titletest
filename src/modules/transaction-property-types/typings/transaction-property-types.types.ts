/**
 * Transaction Property Types Module Types
 * Uses generated types from @contreai/api-client
 */

import type { TransactionPropertyTypeDto } from '@contreai/api-client';

// Re-export for convenience
export type TransactionPropertyType = TransactionPropertyTypeDto;

export interface TransactionPropertyTypesStore {
  // State
  propertyTypes: TransactionPropertyType[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp of last successful fetch

  // Actions
  fetchPropertyTypes: () => Promise<void>;
  getPropertyTypeById: (id: string) => TransactionPropertyType | undefined;
  getPropertyTypeByName: (name: string) => TransactionPropertyType | undefined;
  clearError: () => void;
}

