/**
 * Tenant Module - Claims-based multi-tenancy
 *
 * This module provides tenant management based on JWT claims
 * injected by contre-ai-core's custom access token hook.
 *
 * @example
 * ```tsx
 * import { useTenant, useHasPermission, TenantPermissions } from 'modules/tenant';
 *
 * function MyComponent() {
 *   const { tenantId, tenantName, switchTenant } = useTenant();
 *   const canEdit = useHasPermission(TenantPermissions.TRANSACTIONS_EDIT);
 *
 *   return (
 *     <div>
 *       <h1>Current Tenant: {tenantName}</h1>
 *       {canEdit && <EditButton />}
 *     </div>
 *   );
 * }
 * ```
 */

// Store
export { useTenantStore, initTenantClaimsSync } from './store/tenant.store';

// Hooks
export {
  useTenant,
  useHasPermission,
  useHasRole,
  useActiveTenantId,
  useTenantSelector,
} from './hooks/useTenant';

// Types
export type {
  TenantRole,
  TenantMembership,
  TenantClaims,
  TenantState,
  TenantActions,
  TenantStore,
  TenantPermission,
} from './typings/tenant.types';

// Constants
export { TenantPermissions } from './typings/tenant.types';

// Utilities
export {
  parseJWT,
  isTokenExpired,
  extractTenantClaims,
  getAccessTokenFromCookies,
  getTenantClaimsFromSession,
} from './utils/jwt-parser';
