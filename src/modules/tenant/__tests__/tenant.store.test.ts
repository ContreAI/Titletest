import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTenantStore } from '../store/tenant.store';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  getAxiosInstance: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock supabase client
vi.mock('lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
    },
  },
}));

// Mock jwt-parser
vi.mock('../utils/jwt-parser', () => ({
  getTenantClaimsFromSession: vi.fn(),
  extractTenantClaims: vi.fn(),
}));

describe('Tenant Store', () => {
  const mockMembership = {
    tenantId: 'tenant-123',
    name: 'Test Tenant',
    role: 'admin' as const,
    permissions: ['read', 'write', 'delete'],
  };

  const mockMembership2 = {
    tenantId: 'tenant-456',
    name: 'Second Tenant',
    role: 'member' as const,
    permissions: ['read'],
  };

  beforeEach(() => {
    // Reset store state
    useTenantStore.setState({
      activeTenant: null,
      memberships: [],
      isLoaded: false,
      isRefreshing: false,
      lastClaimsUpdate: null,
      error: null,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTenantStore.getState();
      expect(state.activeTenant).toBeNull();
      expect(state.memberships).toEqual([]);
      expect(state.isLoaded).toBe(false);
      expect(state.isRefreshing).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadTenantClaims', () => {
    it('should load claims from session and set active tenant', async () => {
      const jwtParser = await import('../utils/jwt-parser');
      vi.mocked(jwtParser.getTenantClaimsFromSession).mockReturnValue({
        activeTenantId: 'tenant-123',
        memberships: [mockMembership, mockMembership2],
        claimsUpdatedAt: '2024-01-01T00:00:00Z',
      });

      await useTenantStore.getState().loadTenantClaims();

      const state = useTenantStore.getState();
      expect(state.memberships).toHaveLength(2);
      expect(state.activeTenant?.tenantId).toBe('tenant-123');
      expect(state.isLoaded).toBe(true);
      expect(state.isRefreshing).toBe(false);
    });

    it('should default to first tenant if no active tenant specified', async () => {
      const jwtParser = await import('../utils/jwt-parser');
      vi.mocked(jwtParser.getTenantClaimsFromSession).mockReturnValue({
        activeTenantId: null,
        memberships: [mockMembership, mockMembership2],
        claimsUpdatedAt: '2024-01-01T00:00:00Z',
      });

      await useTenantStore.getState().loadTenantClaims();

      expect(useTenantStore.getState().activeTenant?.tenantId).toBe('tenant-123');
    });

    it('should handle empty memberships', async () => {
      const jwtParser = await import('../utils/jwt-parser');
      vi.mocked(jwtParser.getTenantClaimsFromSession).mockReturnValue(null);

      const supabase = await import('lib/supabase/client');
      vi.mocked(supabase.supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await useTenantStore.getState().loadTenantClaims();

      const state = useTenantStore.getState();
      expect(state.memberships).toEqual([]);
      expect(state.activeTenant).toBeNull();
      expect(state.isLoaded).toBe(true);
    });

    it('should fetch fresh session when no claims in cookies', async () => {
      const jwtParser = await import('../utils/jwt-parser');
      vi.mocked(jwtParser.getTenantClaimsFromSession).mockReturnValue(null);
      vi.mocked(jwtParser.extractTenantClaims).mockReturnValue({
        activeTenantId: 'tenant-123',
        memberships: [mockMembership],
        claimsUpdatedAt: '2024-01-01T00:00:00Z',
      });

      const supabase = await import('lib/supabase/client');
      vi.mocked(supabase.supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'fresh-token' } },
        error: null,
      } as any);

      await useTenantStore.getState().loadTenantClaims();

      expect(supabase.supabase.auth.getSession).toHaveBeenCalled();
      expect(jwtParser.extractTenantClaims).toHaveBeenCalledWith('fresh-token');
    });

    it('should handle session errors', async () => {
      const jwtParser = await import('../utils/jwt-parser');
      vi.mocked(jwtParser.getTenantClaimsFromSession).mockReturnValue(null);

      const supabase = await import('lib/supabase/client');
      vi.mocked(supabase.supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      } as any);

      await useTenantStore.getState().loadTenantClaims();

      expect(useTenantStore.getState().error).toContain('Session error');
      expect(useTenantStore.getState().isLoaded).toBe(true);
    });
  });

  describe('switchTenant', () => {
    it('should switch to a valid tenant', async () => {
      // Setup initial state with memberships
      useTenantStore.setState({
        activeTenant: mockMembership,
        memberships: [mockMembership, mockMembership2],
        isLoaded: true,
      });

      const apiClient = await import('@contreai/api-client');
      const mockPost = vi.fn().mockResolvedValueOnce({ success: true });
      vi.mocked(apiClient.getAxiosInstance).mockReturnValue({
        get: vi.fn(),
        post: mockPost,
        put: vi.fn(),
        delete: vi.fn(),
      } as any);

      const supabase = await import('lib/supabase/client');
      vi.mocked(supabase.supabase.auth.refreshSession).mockResolvedValueOnce({
        error: null,
      } as any);

      const jwtParser = await import('../utils/jwt-parser');
      vi.mocked(jwtParser.getTenantClaimsFromSession).mockReturnValue({
        activeTenantId: 'tenant-456',
        memberships: [mockMembership, mockMembership2],
        claimsUpdatedAt: '2024-01-01T00:00:00Z',
      });

      await useTenantStore.getState().switchTenant('tenant-456');

      expect(mockPost).toHaveBeenCalledWith('/api/v1/users/switch-tenant', {
        tenantId: 'tenant-456',
      });
    });

    it('should throw error for non-member tenant', async () => {
      useTenantStore.setState({
        activeTenant: mockMembership,
        memberships: [mockMembership],
        isLoaded: true,
      });

      await expect(useTenantStore.getState().switchTenant('non-existent-tenant')).rejects.toThrow(
        'User is not a member of this tenant'
      );
    });

    it('should revert on API failure', async () => {
      useTenantStore.setState({
        activeTenant: mockMembership,
        memberships: [mockMembership, mockMembership2],
        isLoaded: true,
      });

      const apiClient = await import('@contreai/api-client');
      const mockPost = vi.fn().mockRejectedValueOnce(new Error('API error'));
      vi.mocked(apiClient.getAxiosInstance).mockReturnValue({
        get: vi.fn(),
        post: mockPost,
        put: vi.fn(),
        delete: vi.fn(),
      } as any);

      await expect(useTenantStore.getState().switchTenant('tenant-456')).rejects.toThrow(
        'API error'
      );

      // Should revert to previous tenant
      expect(useTenantStore.getState().activeTenant?.tenantId).toBe('tenant-123');
    });
  });

  describe('clearTenantState', () => {
    it('should clear all tenant state', () => {
      useTenantStore.setState({
        activeTenant: mockMembership,
        memberships: [mockMembership, mockMembership2],
        isLoaded: true,
        isRefreshing: true,
        lastClaimsUpdate: '2024-01-01',
        error: 'Some error',
      });

      useTenantStore.getState().clearTenantState();

      const state = useTenantStore.getState();
      expect(state.activeTenant).toBeNull();
      expect(state.memberships).toEqual([]);
      expect(state.isLoaded).toBe(false);
      expect(state.isRefreshing).toBe(false);
      expect(state.lastClaimsUpdate).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('should return true for existing permission', () => {
      useTenantStore.setState({
        activeTenant: mockMembership,
        isLoaded: true,
      });

      expect(useTenantStore.getState().hasPermission('read')).toBe(true);
      expect(useTenantStore.getState().hasPermission('write')).toBe(true);
      expect(useTenantStore.getState().hasPermission('delete')).toBe(true);
    });

    it('should return false for missing permission', () => {
      useTenantStore.setState({
        activeTenant: mockMembership2, // Only has 'read'
        isLoaded: true,
      });

      expect(useTenantStore.getState().hasPermission('write')).toBe(false);
      expect(useTenantStore.getState().hasPermission('delete')).toBe(false);
    });

    it('should return false when no active tenant', () => {
      useTenantStore.setState({
        activeTenant: null,
        isLoaded: true,
      });

      expect(useTenantStore.getState().hasPermission('read')).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', () => {
      useTenantStore.setState({
        activeTenant: mockMembership, // role: 'admin'
        isLoaded: true,
      });

      expect(useTenantStore.getState().hasRole('admin')).toBe(true);
    });

    it('should return false for non-matching role', () => {
      useTenantStore.setState({
        activeTenant: mockMembership2, // role: 'member'
        isLoaded: true,
      });

      expect(useTenantStore.getState().hasRole('admin')).toBe(false);
    });

    it('should accept array of roles', () => {
      useTenantStore.setState({
        activeTenant: mockMembership2, // role: 'member'
        isLoaded: true,
      });

      expect(useTenantStore.getState().hasRole(['admin', 'member'])).toBe(true);
      expect(useTenantStore.getState().hasRole(['admin', 'owner'])).toBe(false);
    });

    it('should return false when no active tenant', () => {
      useTenantStore.setState({
        activeTenant: null,
        isLoaded: true,
      });

      expect(useTenantStore.getState().hasRole('admin')).toBe(false);
    });
  });

  describe('getRoleInTenant', () => {
    it('should return role for a specific tenant', () => {
      useTenantStore.setState({
        memberships: [mockMembership, mockMembership2],
        isLoaded: true,
      });

      expect(useTenantStore.getState().getRoleInTenant('tenant-123')).toBe('admin');
      expect(useTenantStore.getState().getRoleInTenant('tenant-456')).toBe('member');
    });

    it('should return null for non-existent tenant', () => {
      useTenantStore.setState({
        memberships: [mockMembership],
        isLoaded: true,
      });

      expect(useTenantStore.getState().getRoleInTenant('non-existent')).toBeNull();
    });
  });
});
