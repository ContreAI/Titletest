/**
 * Tenant Types - Claims-based tenant management
 *
 * These types define the structure of tenant claims that are
 * injected into JWTs by contre-ai-core's custom access token hook.
 */

/**
 * Role within a tenant organization
 * Note: 'broker' is used for brokerage-level access to view all transactions
 */
export type TenantRole = 'owner' | 'admin' | 'broker' | 'member' | 'viewer';

/**
 * Individual tenant membership claim from JWT
 */
export interface TenantMembership {
  /** Tenant/organization ID */
  tenantId: string;
  /** Display name of the tenant */
  name: string;
  /** User's role within this tenant */
  role: TenantRole;
  /** Permissions granted to the user in this tenant */
  permissions: string[];
  /** Tenant/brokerage logo URL */
  logo?: string;
}

/**
 * Tenant claims structure as injected into JWT by custom access token hook
 * Located at: app_metadata.tenant_claims
 */
export interface TenantClaims {
  /** Currently active tenant ID */
  activeTenantId: string | null;
  /** List of all tenants the user is a member of */
  memberships: TenantMembership[];
  /** Timestamp when claims were last updated */
  claimsUpdatedAt: string;
}

/**
 * Parsed JWT payload with tenant claims
 */
export interface JWTWithTenantClaims {
  sub: string;
  email?: string;
  exp: number;
  iat: number;
  aud: string;
  app_metadata?: {
    tenant_claims?: TenantClaims;
  };
}

/**
 * Tenant store state
 */
export interface TenantState {
  /** Currently active tenant */
  activeTenant: TenantMembership | null;
  /** All tenant memberships from JWT claims */
  memberships: TenantMembership[];
  /** Whether tenant claims have been loaded */
  isLoaded: boolean;
  /** Whether tenant claims are being refreshed */
  isRefreshing: boolean;
  /** Last time claims were extracted from token */
  lastClaimsUpdate: string | null;
  /** Error message if claims extraction failed */
  error: string | null;
}

/**
 * Tenant store actions
 */
export interface TenantActions {
  /** Extract and load tenant claims from JWT */
  loadTenantClaims: () => Promise<void>;
  /** Switch to a different tenant */
  switchTenant: (tenantId: string) => Promise<void>;
  /** Clear tenant state (on logout) */
  clearTenantState: () => void;
  /** Check if user has a specific permission in active tenant */
  hasPermission: (permission: string) => boolean;
  /** Check if user has a specific role in active tenant */
  hasRole: (role: TenantRole | TenantRole[]) => boolean;
  /** Get user's role in a specific tenant */
  getRoleInTenant: (tenantId: string) => TenantRole | null;
}

/**
 * Combined tenant store type
 */
export type TenantStore = TenantState & TenantActions;

/**
 * Common permissions that can be granted to tenant members
 */
export const TenantPermissions = {
  // Transaction permissions
  TRANSACTIONS_VIEW: 'transactions:view',
  TRANSACTIONS_CREATE: 'transactions:create',
  TRANSACTIONS_EDIT: 'transactions:edit',
  TRANSACTIONS_DELETE: 'transactions:delete',

  // Document permissions
  DOCUMENTS_VIEW: 'documents:view',
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_DELETE: 'documents:delete',

  // Team permissions
  TEAM_VIEW: 'team:view',
  TEAM_INVITE: 'team:invite',
  TEAM_MANAGE: 'team:manage',

  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // Billing permissions
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',
} as const;

export type TenantPermission = (typeof TenantPermissions)[keyof typeof TenantPermissions];
