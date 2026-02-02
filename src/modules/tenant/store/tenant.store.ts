/**
 * Tenant Store - Claims-based tenant management
 *
 * Manages tenant state extracted from JWT claims.
 * Uses Zustand for consistency with auth store.
 *
 * Key features:
 * - Extracts tenant claims from Supabase JWT
 * - Caches tenant info to reduce API calls
 * - Provides permission/role checking helpers
 * - Handles tenant switching
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TenantStore, TenantRole } from '../typings/tenant.types';
import { getTenantClaimsFromSession } from '../utils/jwt-parser';
import { supabase } from 'lib/supabase/client';
import { getAxiosInstance } from '@contreai/api-client';

// Track if we're currently loading claims to prevent duplicate calls
let isLoadingClaims = false;

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      // State
      activeTenant: null,
      memberships: [],
      isLoaded: false,
      isRefreshing: false,
      lastClaimsUpdate: null,
      error: null,

      /**
       * Load tenant claims from the current JWT token
       * Called on app initialization and after token refresh
       */
      loadTenantClaims: async () => {
        // Prevent duplicate loading
        if (isLoadingClaims) {
          console.log('[Tenant] Claims loading already in progress, skipping...');
          return;
        }

        isLoadingClaims = true;
        set({ isRefreshing: true, error: null });

        try {
          // First, try to get claims from existing cookies
          let claims = getTenantClaimsFromSession();

          // If no claims found, try to get a fresh session from Supabase
          if (!claims) {
            console.log('[Tenant] No claims in cookies, fetching fresh session...');
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
              throw new Error(`Failed to get session: ${sessionError.message}`);
            }

            if (sessionData?.session?.access_token) {
              // Re-extract claims from the fresh token
              const { extractTenantClaims } = await import('../utils/jwt-parser');
              claims = extractTenantClaims(sessionData.session.access_token);
            }
          }

          if (!claims) {
            // No tenant claims in token - user might not have any tenant memberships
            // This is not necessarily an error - new users won't have tenants yet
            console.log('[Tenant] No tenant claims found in token');
            set({
              activeTenant: null,
              memberships: [],
              isLoaded: true,
              isRefreshing: false,
              lastClaimsUpdate: new Date().toISOString(),
            });
            isLoadingClaims = false;
            return;
          }

          console.log('[Tenant] Loaded tenant claims:', {
            activeTenantId: claims.activeTenantId,
            membershipCount: claims.memberships.length,
          });

          // Find the active tenant from memberships
          const activeMembership = claims.activeTenantId
            ? claims.memberships.find((m) => m.tenantId === claims.activeTenantId) || null
            : claims.memberships[0] || null; // Default to first tenant if none active

          set({
            activeTenant: activeMembership,
            memberships: claims.memberships,
            isLoaded: true,
            isRefreshing: false,
            lastClaimsUpdate: claims.claimsUpdatedAt || new Date().toISOString(),
            error: null,
          });
        } catch (error) {
          console.error('[Tenant] Failed to load tenant claims:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to load tenant claims',
            isRefreshing: false,
            isLoaded: true,
          });
        } finally {
          isLoadingClaims = false;
        }
      },

      /**
       * Switch to a different tenant
       * Updates the backend and refreshes the token to get new claims
       */
      switchTenant: async (tenantId: string) => {
        const state = get();

        // Verify user is a member of the target tenant
        const targetMembership = state.memberships.find((m) => m.tenantId === tenantId);
        if (!targetMembership) {
          throw new Error('User is not a member of this tenant');
        }

        // Optimistically update the active tenant
        const previousTenant = state.activeTenant;
        set({ activeTenant: targetMembership, isRefreshing: true });

        try {
          // Call backend to update active tenant
          // This will update the user's profile and trigger token refresh
          await getAxiosInstance().post('/api/v1/users/switch-tenant', { tenantId });

          // Refresh the Supabase session to get updated claims
          const { error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            throw new Error(`Failed to refresh session: ${refreshError.message}`);
          }

          // Reload claims from the refreshed token
          await get().loadTenantClaims();

          console.log('[Tenant] Successfully switched to tenant:', tenantId);
        } catch (error) {
          console.error('[Tenant] Failed to switch tenant:', error);

          // Revert to previous tenant on failure
          set({
            activeTenant: previousTenant,
            isRefreshing: false,
            error: error instanceof Error ? error.message : 'Failed to switch tenant',
          });

          throw error;
        }
      },

      /**
       * Clear all tenant state (called on logout)
       */
      clearTenantState: () => {
        set({
          activeTenant: null,
          memberships: [],
          isLoaded: false,
          isRefreshing: false,
          lastClaimsUpdate: null,
          error: null,
        });
        isLoadingClaims = false;
      },

      /**
       * Check if user has a specific permission in the active tenant
       */
      hasPermission: (permission: string): boolean => {
        const state = get();
        if (!state.activeTenant) {
          return false;
        }
        return state.activeTenant.permissions.includes(permission);
      },

      /**
       * Check if user has a specific role (or one of multiple roles) in active tenant
       */
      hasRole: (role: TenantRole | TenantRole[]): boolean => {
        const state = get();
        if (!state.activeTenant) {
          return false;
        }

        const roles = Array.isArray(role) ? role : [role];
        return roles.includes(state.activeTenant.role);
      },

      /**
       * Get user's role in a specific tenant
       */
      getRoleInTenant: (tenantId: string): TenantRole | null => {
        const state = get();
        const membership = state.memberships.find((m) => m.tenantId === tenantId);
        return membership?.role || null;
      },
    }),
    {
      name: 'tenant-storage',
      // Only persist essential state, not loading flags
      partialize: (state) => ({
        activeTenant: state.activeTenant,
        memberships: state.memberships,
        lastClaimsUpdate: state.lastClaimsUpdate,
      }),
    }
  )
);

/**
 * Subscribe to auth state changes to sync tenant state
 * Called from auth initialization
 *
 * Note: Zustand 5 subscribe() only receives current state, not previous state.
 * We track previous auth state manually to detect transitions.
 */
export function initTenantClaimsSync(): void {
  // Import auth store dynamically to avoid circular dependency
  import('modules/auth/store/auth.store').then(({ useAuthStore }) => {
    // Track previous auth state manually (Zustand 5 doesn't pass prevState to subscribe)
    let prevIsAuthenticated = useAuthStore.getState().isAuthenticated;

    // Subscribe to auth state changes
    useAuthStore.subscribe((state) => {
      const wasAuthenticated = prevIsAuthenticated;
      prevIsAuthenticated = state.isAuthenticated;

      // When user logs in, load tenant claims
      if (state.isAuthenticated && !wasAuthenticated) {
        console.log('[Tenant] Auth state changed to authenticated, loading claims...');
        useTenantStore.getState().loadTenantClaims();
      }

      // When user logs out, clear tenant state
      if (!state.isAuthenticated && wasAuthenticated) {
        console.log('[Tenant] Auth state changed to unauthenticated, clearing tenant state...');
        useTenantStore.getState().clearTenantState();
      }
    });
  });
}
