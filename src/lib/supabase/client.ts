/**
 * Supabase Client for Frontend
 *
 * Used for session management and token refresh
 * Matches contre-landing implementation
 */

import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// E2E test bypass: skip Supabase validation when running in E2E mode
// This flag is set by the E2E auth fixture via addInitScript
const isE2EBypass = typeof window !== 'undefined' && (window as any).__E2E_AUTH_BYPASS__ === true;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '⚠️  Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'
  );
}

// Flag to stop the refresh loop when auth has permanently failed
// In E2E mode, we always mark auth as failed to prevent Supabase from retrying
let authPermanentlyFailed = isE2EBypass;

if (isE2EBypass) {
  console.log('[Supabase] E2E bypass detected - skipping Supabase auth operations');
}

export function markAuthAsFailed(): void {
  authPermanentlyFailed = true;
  console.log('[Supabase] Auth marked as permanently failed - stopping refresh attempts');
}

export function resetAuthFailedFlag(): void {
  authPermanentlyFailed = false;
}

export function isAuthPermanentlyFailed(): boolean {
  return authPermanentlyFailed;
}

/**
 * Get the cookie domain for cross-subdomain auth
 * Priority: VITE_COOKIE_DOMAIN env var > hostname detection > defaults
 */
export function getCookieDomain(): string | undefined {
  // Allow explicit override via environment variable (matches contre-landing)
  if (import.meta.env.VITE_COOKIE_DOMAIN) {
    return import.meta.env.VITE_COOKIE_DOMAIN;
  }

  // Check if we're on a local.contre.ai subdomain
  if (typeof window !== 'undefined' && window.location.hostname.includes('local.contre.ai')) {
    return '.local.contre.ai';
  }

  // Check if we're on any contre.ai subdomain in production
  if (typeof window !== 'undefined' && window.location.hostname.includes('contre.ai')) {
    return '.contre.ai';
  }

  // In production mode without contre.ai domain, use .contre.ai
  if (!import.meta.env.DEV) {
    return '.contre.ai';
  }

  // Localhost - no domain restriction
  return undefined;
}

/**
 * Create the Supabase client
 * In E2E mode, we return empty cookies to prevent Supabase from trying to parse our mock tokens
 */
function createSupabaseClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          // In E2E mode, return empty cookies to prevent Supabase from parsing mock tokens
          if (isE2EBypass) {
            console.log('[Supabase] E2E mode: returning empty cookies');
            return [];
          }

          const cookies = document.cookie.split('; ')
            .filter(cookie => cookie)
            .map(cookie => {
              const [name, ...valueParts] = cookie.split('=');
              return { name, value: valueParts.join('=') };
            })
            .filter(cookie => cookie.name);

          return cookies;
        },
        setAll(cookiesToSet) {
          // If auth has permanently failed or in E2E mode, don't set any cookies
          // This prevents the infinite refresh loop
          if (authPermanentlyFailed) {
            console.log('[Supabase] Skipping cookie set - auth permanently failed');
            return;
          }

          const cookieDomain = getCookieDomain();
          const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

          console.log('[Supabase] Setting cookies with domain:', cookieDomain, 'secure:', isSecure);

          cookiesToSet.forEach(({ name, value, options }) => {
            const parts = [
              `${name}=${value}`,
              cookieDomain && `domain=${cookieDomain}`,
              'path=/',
              options?.maxAge && `max-age=${options.maxAge}`,
              'samesite=lax',
              isSecure && 'secure',
            ].filter(Boolean);

            const cookieString = parts.join('; ');
            document.cookie = cookieString;
          });
        },
      },
    }
  );
}

export const supabase = createSupabaseClient();

