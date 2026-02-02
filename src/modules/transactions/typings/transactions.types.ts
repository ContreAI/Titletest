/**
 * Transaction Module Types
 *
 * Uses interface composition pattern for status types to allow
 * independent extension of database vs derived statuses.
 */

export type RepresentationType = 'buyer' | 'seller' | 'both';

export interface PropertyAddress {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string; // Required field
  country?: string;
}

/**
 * Geocoding status values from backend database
 * Maps to transactions.geocoding_status column
 */
export type GeocodingStatus = 'pending' | 'processing' | 'success' | 'failed' | 'manual';

/**
 * Geocoding source values from backend database
 * Maps to transactions.geocoding_source column
 */
export type GeocodingSource = 'geoapify' | 'tiger' | 'google' | 'manual' | 'property_link';

/**
 * Geographic coordinates extracted from PostGIS location column
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocoding data from backend
 * Contains status, coordinates, and metadata from the geocoding process
 */
export interface GeocodingData {
  /** Current geocoding status */
  status: GeocodingStatus;
  /** Geocoding provider source */
  source?: GeocodingSource;
  /** Confidence score (0-1) from geocoding provider */
  confidence?: number;
  /** Extracted coordinates from PostGIS location column */
  coordinates?: Coordinates;
  /** Timestamp when geocoding completed */
  geocodedAt?: string;
}

export interface TransactionFormData {
  transactionName: string;
  representing: RepresentationType;
  propertyAddress: PropertyAddress;
  propertyType: string; // Property type name (e.g., "Single Family", "Condo/Townhouse")
}

/**
 * Base database status values - stored in the database
 */
export interface DatabaseStatusValues {
  draft: 'draft';
  active: 'active';
  pending: 'pending';
  completed: 'completed';
  cancelled: 'cancelled';
  closed: 'closed';
}

/**
 * Derived status values - computed from timeline dates
 */
export interface DerivedStatusValues {
  post_em: 'post_em';
  inspection_cleared: 'inspection_cleared';
  ready_for_close: 'ready_for_close';
}

/**
 * Combined status type using interface composition
 */
export type TransactionStatus = DatabaseStatusValues[keyof DatabaseStatusValues] | DerivedStatusValues[keyof DerivedStatusValues];

/**
 * Status constants for runtime use
 */
export const DATABASE_STATUSES: readonly (keyof DatabaseStatusValues)[] = ['draft', 'active', 'pending', 'completed', 'cancelled', 'closed'] as const;
export const DERIVED_STATUSES: readonly (keyof DerivedStatusValues)[] = ['post_em', 'inspection_cleared', 'ready_for_close'] as const;
export const ALL_STATUSES: readonly TransactionStatus[] = [...DATABASE_STATUSES, ...DERIVED_STATUSES] as const;

export interface Transaction extends TransactionFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: TransactionStatus;
  createdBy: string;

  /**
   * Geocoding data for the property address
   * Contains status, coordinates, and metadata from the geocoding process
   */
  geocoding?: GeocodingData;
}

export type TransactionScope = 'mine' | 'brokerage';

export interface TransactionsStore {
  currentTransaction: Transaction | null;
  transactions: Transaction[];
  isCreating: boolean;
  isEditing: boolean;
  isLoading: boolean;
  transactionScope: TransactionScope;

  // Actions
  setCurrentTransaction: (transaction: Transaction | null) => void;
  setTransactionScope: (scope: TransactionScope) => void;
  fetchTransactions: (scope?: TransactionScope) => Promise<void>;
  fetchTransactionById: (id: string) => Promise<Transaction>;
  createTransaction: (data: TransactionFormData) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => Promise<Transaction>;
  updateTransactionStatus: (id: string, status: TransactionStatus) => Promise<Transaction>;
  clearCurrentTransaction: () => void;

  // WebSocket listeners for real-time updates
  setupSocketListeners: () => void;
  removeSocketListeners: () => void;
  updateTransactionFromSocket: (transactionId: string, updates: Partial<Transaction>) => void;
}
