import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { supabase, getCookieDomain, markAuthAsFailed } from 'lib/supabase/client';

// Use environment variable, or derive URL from current page location to avoid mixed content issues
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback: use same protocol as current page to avoid mixed content
  // Note: Don't include /api/v1 here - the Orval-generated client includes it in endpoint paths
  const protocol = window.location.protocol;
  return `${protocol}//localhost:3001`;
};

const BASE_URL = getBaseUrl();

/**
 * Clear all Supabase auth cookies to stop the refresh loop
 * Clears cookies for all possible domains to handle cross-domain auth
 */
function clearAuthCookies(): void {
  const cookies = document.cookie.split(';');

  // Try all possible domains to ensure cookies are cleared
  const domainsToTry = [
    getCookieDomain(), // Current domain (.local.contre.ai or .contre.ai)
    '.contre.ai', // Production domain
    '.local.contre.ai', // Local development domain
    undefined, // No domain (current host only)
  ];

  cookies.forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-')) {
      // Try to delete from all possible domains
      domainsToTry.forEach((domain) => {
        const parts = [
          `${name}=`,
          'expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'path=/',
          domain && `domain=${domain}`,
        ].filter(Boolean);

        document.cookie = parts.join('; ');
      });
      console.log(`[Auth] Cleared cookie: ${name} (from all domains)`);
    }
  });
}

/**
 * Axios instance configured for cookie-based authentication
 * 
 * Authentication is handled via Supabase session cookies set by contre.ai
 * Cookies are automatically included in all requests via withCredentials: true
 * Automatic token refresh on 401 errors
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Required to send cookies across domains
});

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor to handle auth errors
// Returns response.data (the parsed body) so api-client types work correctly
// Backend responses are shaped as { data: ... } which matches the api-client types
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - try to refresh token ONCE
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if we have auth cookies at all
      const hasAuthCookie = document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith('sb-') && cookie.includes('-auth-token')
      );

      // If no cookies, just reject - don't redirect (let AuthGuard handle it)
      if (!hasAuthCookie) {
        console.log('[Auth] No cookies found, rejecting request');
        return Promise.reject({
          status: error.response?.status,
          data: error.response?.data || error.message,
        });
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        console.log('[Auth] Token expired, attempting refresh with retry...');
        console.log('[Auth] Current domain:', window.location.hostname);

        // Retry refresh up to 3 times with exponential backoff
        const MAX_RETRIES = 3;
        let lastError: Error | null = null;
        let isNonRetryable = false;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            console.log(`[Auth] Refresh attempt ${attempt}/${MAX_RETRIES}`);

            // Attempt to refresh Supabase session
            // This will automatically update cookies via the cookie handler in lib/supabase/client.ts
            // The cookie handler uses getCookieDomain() which returns:
            // - .contre.ai for production (works across all subdomains)
            // - .local.contre.ai for local development
            const { data, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              const status = refreshError.status;
              console.warn(`[Auth] Refresh error - status: ${status}, message: ${refreshError.message}`);

              // 4xx errors are non-retryable (invalid/expired refresh token, user not found, etc.)
              // 5xx errors or network errors are retryable
              if (status && status >= 400 && status < 500) {
                console.warn('[Auth] Non-retryable 4xx error, clearing auth immediately');
                isNonRetryable = true;
                throw refreshError;
              }
              throw refreshError;
            }

            if (!data.session) {
              throw new Error('No session returned');
            }

            console.log('[Auth] Session refreshed successfully');
            console.log('[Auth] Cookies updated with shared domain for centralized auth');

            // Verify cookies were set correctly (for debugging)
            const cookiesAfterRefresh = document.cookie.split(';').filter(c =>
              c.trim().startsWith('sb-') && c.includes('-auth-token')
            );
            console.log('[Auth] Auth cookies after refresh:', cookiesAfterRefresh.length);

            // Reload tenant claims from the refreshed token
            // This ensures we have the latest tenant memberships and permissions
            import('modules/tenant').then(({ useTenantStore }) => {
              useTenantStore.getState().loadTenantClaims().catch(err => {
                console.warn('[Auth] Failed to refresh tenant claims:', err);
              });
            });

            // Process queued requests
            processQueue();
            isRefreshing = false;

            // Retry the original request
            return axiosInstance(originalRequest);
          } catch (attemptError) {
            lastError = attemptError instanceof Error ? attemptError : new Error(String(attemptError));
            console.warn(`[Auth] Refresh attempt ${attempt} failed:`, lastError.message);

            // If non-retryable error (4xx), break immediately - no point retrying
            if (isNonRetryable) {
              console.log('[Auth] Breaking retry loop - permanent 4xx failure detected');
              break;
            }

            // Don't wait after the last attempt
            if (attempt < MAX_RETRIES) {
              // Exponential backoff: 1s, 2s, 4s
              const delay = Math.pow(2, attempt - 1) * 1000;
              console.log(`[Auth] Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }

        // All retries failed
        throw lastError || new Error('Session refresh failed after all retries');
      } catch (refreshError) {
        console.error('[Auth] Session refresh failed after all retries - session expired');
        processQueue(refreshError);
        isRefreshing = false;

        // Mark auth as permanently failed FIRST to stop the refresh loop
        markAuthAsFailed();

        // Clear cookies to remove invalid tokens
        clearAuthCookies();

        // Sign out from Supabase to clean up internal state
        // Use scope: 'local' to avoid calling the server (which would fail anyway)
        supabase.auth.signOut({ scope: 'local' }).catch(() => {
          // Ignore errors - we already cleared cookies
        });

        // Clear auth and tenant state so SessionExpired page shows (without redirecting)
        // Import dynamically to avoid circular dependency
        import('modules/auth/store/auth.store').then(({ useAuthStore }) => {
          // Clear state without calling logout (which redirects)
          useAuthStore.setState({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        });

        // Clear tenant state as well
        import('modules/tenant').then(({ useTenantStore }) => {
          useTenantStore.getState().clearTenantState();
        });

        // Don't redirect - just reject the request
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data || error.message,
    });
  },
);

export default axiosInstance;
