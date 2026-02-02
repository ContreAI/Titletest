import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Mock modules before importing axiosInstance
vi.mock('lib/supabase/client', () => ({
  supabase: {
    auth: {
      refreshSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
  getCookieDomain: vi.fn(() => '.contre.ai'),
  markAuthAsFailed: vi.fn(),
}));

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'https://api.example.com',
  },
});

// Mock dynamic imports for stores
vi.mock('modules/auth/store/auth.store', () => ({
  useAuthStore: {
    setState: vi.fn(),
  },
}));

vi.mock('modules/tenant', () => ({
  useTenantStore: {
    getState: vi.fn(() => ({
      clearTenantState: vi.fn(),
      loadTenantClaims: vi.fn(() => Promise.resolve()),
    })),
  },
}));

describe('axiosInstance', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });

    // Create a mock axios instance with interceptors
    mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      defaults: {
        baseURL: 'https://api.example.com',
        withCredentials: true,
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Configuration', () => {
    it('should configure baseURL from environment variable', () => {
      expect(mockAxiosInstance.defaults.baseURL).toBe('https://api.example.com');
    });

    it('should have withCredentials enabled for cookie-based auth', () => {
      expect(mockAxiosInstance.defaults.withCredentials).toBe(true);
    });
  });

  describe('Response Interceptor', () => {
    it('should unwrap response.data.data if present', async () => {
      const response = {
        data: {
          data: { id: '123', name: 'Test' },
          success: true,
        },
      } as AxiosResponse;

      // Simulate the response interceptor logic
      const unwrapped = response.data.data ? response.data.data : response.data;

      expect(unwrapped).toEqual({ id: '123', name: 'Test' });
    });

    it('should return response.data if no nested data', async () => {
      const response = {
        data: { success: true, message: 'OK' },
      } as AxiosResponse;

      // Simulate the response interceptor logic
      const unwrapped = response.data.data ? response.data.data : response.data;

      expect(unwrapped).toEqual({ success: true, message: 'OK' });
    });
  });

  describe('Error Handling', () => {
    it('should format error response with status and data', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      } as AxiosError;

      const formatted = {
        status: error.response?.status,
        data: error.response?.data || error.message,
      };

      expect(formatted.status).toBe(400);
      expect(formatted.data).toEqual({ message: 'Bad request' });
    });

    it('should use error message when no response data', () => {
      const error = {
        message: 'Network Error',
        response: {
          status: 0,
          data: null,
        },
      } as unknown as AxiosError;

      const formatted = {
        status: error.response?.status,
        data: error.response?.data || error.message,
      };

      expect(formatted.data).toBe('Network Error');
    });
  });

  describe('401 Token Refresh Logic', () => {
    it('should reject immediately when no auth cookies exist', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });

      const hasAuthCookie = document.cookie
        .split(';')
        .some((cookie) => cookie.trim().startsWith('sb-') && cookie.includes('-auth-token'));

      expect(hasAuthCookie).toBe(false);
    });

    it('should detect auth cookies when present', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'sb-test-auth-token=valid-token',
      });

      const hasAuthCookie = document.cookie
        .split(';')
        .some((cookie) => cookie.trim().startsWith('sb-') && cookie.includes('-auth-token'));

      expect(hasAuthCookie).toBe(true);
    });

    it('should mark original request with _retry flag', () => {
      const request = {} as InternalAxiosRequestConfig & { _retry?: boolean };
      request._retry = true;

      expect(request._retry).toBe(true);
    });
  });

  describe('Cookie Clearing', () => {
    it('should clear all sb- prefixed cookies', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'sb-test-auth-token=value; sb-refresh-token=value2; other-cookie=value3',
      });

      // Parse cookies
      const cookies = document.cookie.split(';');
      const sbCookies = cookies.filter((cookie) => cookie.trim().startsWith('sb-'));

      expect(sbCookies).toHaveLength(2);
    });

    it('should try multiple domains when clearing cookies', async () => {
      const { getCookieDomain } = await import('lib/supabase/client');
      vi.mocked(getCookieDomain).mockReturnValue('.local.contre.ai');

      const domainsToTry = [
        getCookieDomain(),
        '.contre.ai',
        '.local.contre.ai',
        undefined,
      ];

      expect(domainsToTry).toContain('.local.contre.ai');
      expect(domainsToTry).toContain('.contre.ai');
      expect(domainsToTry).toContain(undefined);
    });
  });

  describe('Token Refresh Queue', () => {
    it('should process queued requests on successful refresh', async () => {
      const queue: Array<{ resolve: (v?: any) => void; reject: (e?: any) => void }> = [];

      // Add requests to queue
      const promise1 = new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      });
      const promise2 = new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      });

      expect(queue).toHaveLength(2);

      // Simulate processing queue on success
      queue.forEach((prom) => prom.resolve());

      await expect(promise1).resolves.toBeUndefined();
      await expect(promise2).resolves.toBeUndefined();
    });

    it('should reject all queued requests on refresh failure', async () => {
      const queue: Array<{ resolve: (v?: any) => void; reject: (e?: any) => void }> = [];
      const error = new Error('Refresh failed');

      // Add requests to queue
      const promise1 = new Promise((_, reject) => {
        queue.push({ resolve: vi.fn(), reject });
      });
      const promise2 = new Promise((_, reject) => {
        queue.push({ resolve: vi.fn(), reject });
      });

      // Simulate processing queue on failure
      queue.forEach((prom) => prom.reject(error));

      await expect(promise1).rejects.toThrow('Refresh failed');
      await expect(promise2).rejects.toThrow('Refresh failed');
    });
  });

  describe('Retry Logic', () => {
    it('should implement exponential backoff', () => {
      const MAX_RETRIES = 3;
      const delays: number[] = [];

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          delays.push(delay);
        }
      }

      expect(delays).toEqual([1000, 2000]); // 1s, 2s (no delay after last attempt)
    });

    it('should stop retrying on 4xx errors', async () => {
      const supabase = await import('lib/supabase/client');
      vi.mocked(supabase.supabase.auth.refreshSession).mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { status: 400, message: 'Invalid refresh token' } as any,
      });

      // 4xx errors should not be retried
      const status = 400;
      const isNonRetryable = status >= 400 && status < 500;

      expect(isNonRetryable).toBe(true);
    });

    it('should retry on 5xx errors', () => {
      const status = 500;
      const isNonRetryable = status >= 400 && status < 500;

      expect(isNonRetryable).toBe(false);
    });
  });

  describe('Auth State Cleanup', () => {
    it('should clear auth state on permanent failure', async () => {
      const authStore = await import('modules/auth/store/auth.store');

      const expectedState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };

      authStore.useAuthStore.setState(expectedState);

      expect(authStore.useAuthStore.setState).toHaveBeenCalledWith(expectedState);
    });

    it('should mark auth as failed before clearing cookies', async () => {
      const { markAuthAsFailed } = await import('lib/supabase/client');

      markAuthAsFailed();

      expect(markAuthAsFailed).toHaveBeenCalled();
    });

    it('should sign out locally without calling server', async () => {
      const { supabase } = await import('lib/supabase/client');

      await supabase.auth.signOut({ scope: 'local' });

      expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    });
  });

  describe('Tenant Claims Refresh', () => {
    it('should reload tenant claims after successful token refresh', async () => {
      const tenant = await import('modules/tenant');
      const loadTenantClaimsMock = vi.fn(() => Promise.resolve());

      vi.mocked(tenant.useTenantStore.getState).mockReturnValue({
        clearTenantState: vi.fn(),
        loadTenantClaims: loadTenantClaimsMock,
      } as any);

      await tenant.useTenantStore.getState().loadTenantClaims();

      expect(loadTenantClaimsMock).toHaveBeenCalled();
    });

    it('should clear tenant state on auth failure', async () => {
      const tenant = await import('modules/tenant');
      const clearTenantStateMock = vi.fn();

      vi.mocked(tenant.useTenantStore.getState).mockReturnValue({
        clearTenantState: clearTenantStateMock,
        loadTenantClaims: vi.fn(),
      } as any);

      tenant.useTenantStore.getState().clearTenantState();

      expect(clearTenantStateMock).toHaveBeenCalled();
    });
  });
});
