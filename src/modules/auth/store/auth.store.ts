import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthStore } from '../typings/auth.types';
import { userControllerGetProfile } from '@contreai/api-client';
import { getCookieDomain } from 'lib/supabase/client';

/**
 * Auth Store - Cookie-based authentication
 *
 * Authentication handled by contre.ai using Supabase
 * Cookies shared across all contre.ai subdomains
 * Backend (contre-backend) validates cookies and returns user data
 */
// Track if session is being initialized to prevent duplicate calls
let isInitializing = false;

/**
 * Delete a cookie across all possible domains
 * Uses dynamic domain detection to ensure proper cleanup
 */
function deleteCookie(name: string): void {
  const cookieDomain = getCookieDomain();

  // Delete without domain (current domain only)
  document.cookie = `${name}=; path=/; max-age=0`;

  // Delete with detected domain
  if (cookieDomain) {
    document.cookie = `${name}=; path=/; domain=${cookieDomain}; max-age=0`;
  }

  // Also try common domains as fallback
  if (cookieDomain !== '.local.contre.ai') {
    document.cookie = `${name}=; path=/; domain=.local.contre.ai; max-age=0`;
  }
  if (cookieDomain !== '.contre.ai') {
    document.cookie = `${name}=; path=/; domain=.contre.ai; max-age=0`;
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null, // Deprecated - kept for compatibility
      refreshToken: null, // Deprecated - kept for compatibility
      isAuthenticated: false,
      isLoading: true, // Start true to prevent race condition with guards
      
      // Initialize session by calling backend API
      initSession: async () => {
        const state = get();

        // Prevent duplicate calls
        if (isInitializing) {
          console.log('[Auth] Session initialization already in progress, skipping...');
          return;
        }

        // E2E test bypass: trust localStorage state without cookie validation
        // This flag is set by the E2E auth fixture via addInitScript
        const isE2EBypass = typeof window !== 'undefined' && (window as any).__E2E_AUTH_BYPASS__ === true;
        if (isE2EBypass && state.isAuthenticated && state.user) {
          console.log('[Auth] E2E bypass: trusting localStorage auth state for:', state.user.email);
          set({ isLoading: false });
          return;
        }

        // Demo mode bypass: skip cookie validation and use mock user
        // Enable by setting VITE_DEMO_MODE=true in environment
        const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
        if (isDemoMode) {
          console.log('[Auth] Demo mode: using mock authentication');
          isInitializing = true;
          try {
            const mockUser = await userControllerGetProfile();
            if (mockUser?.userId) {
              set({
                isAuthenticated: true,
                user: {
                  id: mockUser.userId,
                  email: mockUser.email || 'demo@example.com',
                  firstName: mockUser.firstName || 'Demo',
                  lastName: mockUser.lastName || 'User',
                  role: mockUser.role || 'broker',
                  name: `${mockUser.firstName || 'Demo'} ${mockUser.lastName || 'User'}`,
                  avatar: mockUser.profileImage || null,
                  createdAt: mockUser.createdAt,
                },
                isLoading: false,
              });
              isInitializing = false;
              return;
            }
          } catch (err) {
            console.warn('[Auth] Demo mode user fetch failed:', err);
          }
          isInitializing = false;
        }

        // If already authenticated, verify the cookie still exists before skipping
        if (state.isAuthenticated && state.user) {
          const cookies = document.cookie;
          const hasValidAuthCookie = cookies.split(';').some(cookie => {
            const trimmed = cookie.trim();
            if (trimmed.startsWith('sb-') && trimmed.includes('-auth-token')) {
              const [, value] = trimmed.split('=');
              return value && value.length > 0 && value !== 'undefined';
            }
            return false;
          });

          if (hasValidAuthCookie) {
            console.log('[Auth] User already authenticated:', state.user.email);
            set({ isLoading: false });
            return;
          } else {
            // Cookie is gone but state says authenticated - clear the stale state
            console.log('[Auth] Stale auth state detected, clearing...');
            set({ isAuthenticated: false, user: null, isLoading: false });
            isInitializing = false;
            return;
          }
        }
        
        // Check if ANY Supabase auth cookies exist WITH VALUES
        const cookies = document.cookie;
        console.log('[Auth] Checking cookies:', cookies.substring(0, 200) + '...');
        
        const hasValidAuthCookie = cookies.split(';').some(cookie => {
          const trimmed = cookie.trim();
          // Must start with sb-, contain -auth-token, and have a value after =
          if (trimmed.startsWith('sb-') && trimmed.includes('-auth-token')) {
            const [, value] = trimmed.split('=');
            return value && value.length > 0 && value !== 'undefined';
          }
          return false;
        });
        
        console.log('[Auth] Has valid auth cookie:', hasValidAuthCookie);
        
        if (!hasValidAuthCookie) {
          console.log('[Auth] No valid auth cookies found - cleaning up empty cookies');

          // Delete any empty/invalid sb- cookies using dynamic domain detection
          cookies.split(';').forEach(cookie => {
            const trimmed = cookie.trim();
            if (trimmed.startsWith('sb-')) {
              const [name, value] = trimmed.split('=');
              if (!value || value.length === 0) {
                console.log('[Auth] Deleting empty cookie:', name);
                deleteCookie(name);
              }
            }
          });

          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }
        
        isInitializing = true;
        console.log('[Auth] Auth cookies found, fetching user profile...');
        set({ isLoading: true });
        try {
          // Call backend /users/profile endpoint using generated client
          // Cookie is automatically sent via axios withCredentials
          // Note: axios interceptor returns response.data directly, so no .data wrapper
          const user = await userControllerGetProfile();
          console.log('[Auth] Profile response:', user);

          if (user) {
            // API returns userId, not id
            if (!user.userId) {
              console.warn('[Auth] Profile response missing userId:', user);
              set({ isAuthenticated: false, user: null, isLoading: false });
              isInitializing = false;
              return;
            }

            // Map from API response to frontend user format
            const userData = {
              id: user.userId,
              email: user.email,
              firstName: user.firstName ?? '',
              lastName: user.lastName ?? '',
              role: user.role ?? 'user',
              name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
              avatar: user.profileImage ?? null,
              designation: undefined,
              phone: user.phone ?? null,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            };
            
            console.log('[Auth] User authenticated:', userData.email);
            
            set({
              user: userData,
              isAuthenticated: true,
            });
          } else {
            console.log('[Auth] No user data from backend');
            set({ isAuthenticated: false, user: null, isLoading: false });
            isInitializing = false;
          }
        } catch (error: any) {
          console.error('[Auth] Failed to get profile:', error?.status, error?.data);
          // If 401, user is not authenticated
          set({ isAuthenticated: false, user: null, isLoading: false });
          isInitializing = false;
        } finally {
          // Ensure loading is always false
          set({ isLoading: false });
          isInitializing = false;
          console.log('[Auth] Session initialization complete');
        }
      },
      
      // Login - deprecated, redirect to contre.ai
      login: (user, _token, _refreshToken) => {
        // This method is deprecated but kept for compatibility
        // Just set user state if called
        set({
          user,
          isAuthenticated: true,
        });
      },
      
      // Logout - sign out from Supabase and redirect to login
      logout: async () => {
        // Set loading state to prevent flickering
        set({ isLoading: true });

        try {
          // Import supabase dynamically to avoid circular dependency
          const { supabase } = await import('lib/supabase/client');
          await supabase.auth.signOut();
        } catch (err) {
          console.error('[Auth] Logout error:', err);
        }

        // Clear auth state
        set({ user: null, isAuthenticated: false, isLoading: false });

        // Delete all auth cookies
        document.cookie.split(';').forEach(cookie => {
          const name = cookie.split('=')[0].trim();
          if (name.startsWith('sb-')) {
            deleteCookie(name);
          }
        });

        // Navigate to login page using router
        const router = (await import('routes/router')).default;
        router.navigate('/authentication/login');
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      
      // Deprecated - tokens no longer used
      setTokens: (_accessToken, _refreshToken) => {
        console.warn('setTokens is deprecated - authentication uses cookies');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Exclude isLoading from persistence - it should always start as true
        // and be set to false after initSession completes
      }),
    }
  )
);

