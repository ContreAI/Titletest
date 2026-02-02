/**
 * useTenant Hook
 *
 * Convenience hook for accessing tenant state and actions.
 * Provides a simplified API for common tenant operations.
 */

import { useTenantStore } from '../store/tenant.store';
import type { TenantMembership, TenantRole, TenantPermission } from '../typings/tenant.types';

/**
 * Hook return type for better TypeScript inference
 */
interface UseTenantReturn {
  /** Currently active tenant membership */
  activeTenant: TenantMembership | null;
  /** All tenant memberships */
  memberships: TenantMembership[];
  /** Whether tenant claims have been loaded */
  isLoaded: boolean;
  /** Whether tenant switching is in progress */
  isRefreshing: boolean;
  /** Any error that occurred */
  error: string | null;
  /** Whether user has multiple tenants (can switch) */
  canSwitchTenants: boolean;
  /** Active tenant ID shorthand */
  tenantId: string | null;
  /** Active tenant name shorthand */
  tenantName: string | null;
  /** User's role in active tenant */
  role: TenantRole | null;

  // Actions
  /** Switch to a different tenant */
  switchTenant: (tenantId: string) => Promise<void>;
  /** Reload tenant claims from token */
  refreshClaims: () => Promise<void>;
  /** Check if user has a permission */
  hasPermission: (permission: TenantPermission | string) => boolean;
  /** Check if user has a role */
  hasRole: (role: TenantRole | TenantRole[]) => boolean;
  /** Check if user is owner or admin */
  isAdmin: boolean;
  /** Check if user is owner */
  isOwner: boolean;
}

/**
 * Primary hook for tenant functionality
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { tenantId, tenantName, hasPermission, switchTenant } = useTenant();
 *
 *   if (!hasPermission('documents:upload')) {
 *     return <NoAccess />;
 *   }
 *
 *   return <DocumentUploader tenantId={tenantId} />;
 * }
 * ```
 */
export function useTenant(): UseTenantReturn {
  const store = useTenantStore();

  return {
    // State
    activeTenant: store.activeTenant,
    memberships: store.memberships,
    isLoaded: store.isLoaded,
    isRefreshing: store.isRefreshing,
    error: store.error,

    // Computed values
    canSwitchTenants: store.memberships.length > 1,
    tenantId: store.activeTenant?.tenantId ?? null,
    tenantName: store.activeTenant?.name ?? null,
    role: store.activeTenant?.role ?? null,

    // Actions
    switchTenant: store.switchTenant,
    refreshClaims: store.loadTenantClaims,
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,

    // Role shortcuts
    isAdmin: store.hasRole(['owner', 'admin']),
    isOwner: store.hasRole('owner'),
  };
}

/**
 * Hook for permission-based rendering
 *
 * @example
 * ```tsx
 * function DeleteButton() {
 *   const canDelete = useHasPermission('transactions:delete');
 *   if (!canDelete) return null;
 *   return <Button onClick={handleDelete}>Delete</Button>;
 * }
 * ```
 */
export function useHasPermission(permission: TenantPermission | string): boolean {
  return useTenantStore((state) => state.hasPermission(permission));
}

/**
 * Hook for role-based rendering
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const isAdmin = useHasRole(['owner', 'admin']);
 *   if (!isAdmin) return null;
 *   return <AdminSettings />;
 * }
 * ```
 */
export function useHasRole(role: TenantRole | TenantRole[]): boolean {
  return useTenantStore((state) => state.hasRole(role));
}

/**
 * Hook for getting just the active tenant ID
 * Useful for API calls
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const tenantId = useActiveTenantId();
 *   // Use tenantId in API calls
 * }
 * ```
 */
export function useActiveTenantId(): string | null {
  return useTenantStore((state) => state.activeTenant?.tenantId ?? null);
}

/**
 * Hook for tenant selector components
 */
export function useTenantSelector() {
  const store = useTenantStore();

  return {
    memberships: store.memberships,
    activeTenant: store.activeTenant,
    isRefreshing: store.isRefreshing,
    switchTenant: store.switchTenant,
    canSwitch: store.memberships.length > 1,
  };
}
