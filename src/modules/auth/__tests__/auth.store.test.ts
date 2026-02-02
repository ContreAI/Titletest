import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from '../store/auth.store';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  userControllerGetProfile: vi.fn(),
  getAxiosInstance: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock getCookieDomain and supabase
vi.mock('lib/supabase/client', () => ({
  getCookieDomain: vi.fn(() => '.contre.ai'),
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({}),
    },
  },
}));

// Mock router for logout navigation
vi.mock('routes/router', () => ({
  default: {
    navigate: vi.fn(),
  },
}));

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_AUTH_URL: 'https://contre.ai',
  },
});

describe('Auth Store', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    profileImage: null,
  };

  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Clear all mocks
    vi.clearAllMocks();

    // Reset document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('initSession', () => {
    it('should skip if no auth cookies exist', async () => {
      const apiClient = await import('@contreai/api-client');

      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });

      await useAuthStore.getState().initSession();

      expect(apiClient.userControllerGetProfile).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should skip if cookie exists but has no value', async () => {
      const apiClient = await import('@contreai/api-client');

      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'sb-test-auth-token=',
      });

      await useAuthStore.getState().initSession();

      expect(apiClient.userControllerGetProfile).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should fetch user profile when valid auth cookie exists', async () => {
      const apiClient = await import('@contreai/api-client');
      // Note: axios interceptor returns response.data directly, so no wrapper
      vi.mocked(apiClient.userControllerGetProfile).mockResolvedValueOnce({
        userId: 'user-123',
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        profileImage: mockUser.profileImage,
      } as any);

      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'sb-test-auth-token=valid-token-value',
      });

      await useAuthStore.getState().initSession();

      expect(apiClient.userControllerGetProfile).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.email).toBe('test@example.com');
    });

    it('should normalize user data from API response', async () => {
      const apiClient = await import('@contreai/api-client');
      // Note: axios interceptor returns response.data directly, so no wrapper
      vi.mocked(apiClient.userControllerGetProfile).mockResolvedValueOnce({
        userId: 'user-456',
        email: 'normalized@example.com',
        firstName: 'First',
        lastName: 'Last',
        role: 'admin',
        profileImage: 'https://example.com/avatar.jpg',
      } as any);

      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'sb-test-auth-token=valid-token',
      });

      await useAuthStore.getState().initSession();

      const user = useAuthStore.getState().user;
      expect(user?.id).toBe('user-456');
      expect(user?.firstName).toBe('First');
      expect(user?.lastName).toBe('Last');
      expect(user?.name).toBe('First Last');
      expect(user?.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should handle 401 errors gracefully', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.userControllerGetProfile).mockRejectedValueOnce({
        status: 401,
        data: { message: 'Unauthorized' },
      });

      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'sb-test-auth-token=expired-token',
      });

      await useAuthStore.getState().initSession();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should detect stale auth state when cookie is gone', async () => {
      // Start with authenticated state but no cookie
      useAuthStore.setState({
        user: { id: 'stale-user', email: 'stale@example.com', name: 'Stale', firstName: 'Stale', lastName: 'User', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });

      await useAuthStore.getState().initSession();

      // Should clear stale state
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should skip API call if already authenticated with valid cookie', async () => {
      const apiClient = await import('@contreai/api-client');

      useAuthStore.setState({
        user: { id: 'existing-user', email: 'existing@example.com', name: 'Existing', firstName: 'Existing', lastName: 'User', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'sb-test-auth-token=valid-token',
      });

      await useAuthStore.getState().initSession();

      // Should not make API call - already authenticated
      expect(apiClient.userControllerGetProfile).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should handle missing user id in response', async () => {
      const apiClient = await import('@contreai/api-client');
      // Note: axios interceptor returns response.data directly, no wrapper
      // Missing user_id should cause auth to fail
      vi.mocked(apiClient.userControllerGetProfile).mockResolvedValueOnce({
        email: 'no-id@example.com',
        // No user_id
      } as any);

      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'sb-test-auth-token=valid-token',
      });

      await useAuthStore.getState().initSession();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('login (deprecated)', () => {
    it('should set user and authenticated state', () => {
      const user = {
        id: 'login-user',
        email: 'login@example.com',
        name: 'Login User',
        firstName: 'Login',
        lastName: 'User',
        role: 'user',
      };

      useAuthStore.getState().login(user, 'token', 'refresh');

      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should sign out from supabase, clear state, and navigate to login', async () => {
      const router = await import('routes/router');
      const { supabase } = await import('lib/supabase/client');

      useAuthStore.setState({
        user: { id: 'user', email: 'user@example.com', name: 'User', firstName: 'Test', lastName: 'User', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      await useAuthStore.getState().logout();

      // Should call supabase signOut
      expect(supabase.auth.signOut).toHaveBeenCalled();

      // Should clear auth state
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);

      // Should navigate to local login page
      expect(router.default.navigate).toHaveBeenCalledWith('/authentication/login');
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should merge user data correctly', () => {
      useAuthStore.setState({
        user: {
          id: 'user-1',
          email: 'original@example.com',
          name: 'Original Name',
          firstName: 'Original',
          lastName: 'Name',
          role: 'user',
        },
        isAuthenticated: true,
      });

      useAuthStore.getState().updateUser({
        firstName: 'Updated',
        lastName: 'User',
        name: 'Updated User',
      });

      const user = useAuthStore.getState().user;
      expect(user?.id).toBe('user-1');
      expect(user?.email).toBe('original@example.com');
      expect(user?.firstName).toBe('Updated');
      expect(user?.lastName).toBe('User');
      expect(user?.name).toBe('Updated User');
    });

    it('should not update if no user exists', () => {
      useAuthStore.setState({ user: null });

      useAuthStore.getState().updateUser({ firstName: 'Test' });

      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('setTokens (deprecated)', () => {
    it('should log a warning and not modify state', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      useAuthStore.getState().setTokens('access', 'refresh');

      expect(consoleSpy).toHaveBeenCalledWith(
        'setTokens is deprecated - authentication uses cookies'
      );
    });
  });
});
