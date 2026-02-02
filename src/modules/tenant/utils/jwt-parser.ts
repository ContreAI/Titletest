/**
 * JWT Parser Utilities
 *
 * Parses JWT tokens to extract tenant claims without requiring
 * external libraries. Uses browser-native atob for Base64 decoding.
 */

import type { JWTWithTenantClaims, TenantClaims } from '../typings/tenant.types';

/**
 * Decode a Base64URL encoded string to regular string
 * JWT uses Base64URL encoding which differs from standard Base64
 */
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters with standard Base64 characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Pad with '=' to make length a multiple of 4
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }

  // Decode Base64 to string using TextDecoder for better performance
  try {
    const binaryString = atob(base64);
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    // Fallback for simpler payloads
    return atob(base64);
  }
}

/**
 * Parse a JWT token and extract its payload
 * Does NOT verify the signature - that's handled by the backend
 *
 * @param token - The JWT token string
 * @returns The parsed JWT payload or null if parsing fails
 */
export function parseJWT<T = JWTWithTenantClaims>(token: string): T | null {
  if (!token || typeof token !== 'string') {
    console.warn('[JWT Parser] Invalid token: not a string');
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn('[JWT Parser] Invalid token format: expected 3 parts, got', parts.length);
    return null;
  }

  try {
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload) as T;
  } catch (error) {
    console.error('[JWT Parser] Failed to parse token payload:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 *
 * @param token - The JWT token string
 * @param bufferSeconds - Buffer time before actual expiry (default 60s)
 * @returns true if token is expired or invalid
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + bufferSeconds;
}

/**
 * Extract tenant claims from a JWT token
 *
 * @param token - The JWT token string
 * @returns TenantClaims or null if not present/invalid
 */
export function extractTenantClaims(token: string): TenantClaims | null {
  const payload = parseJWT(token);
  if (!payload) {
    return null;
  }

  const claims = payload.app_metadata?.tenant_claims;
  if (!claims) {
    console.log('[JWT Parser] No tenant claims found in token');
    return null;
  }

  // Validate the claims structure
  if (!Array.isArray(claims.memberships)) {
    console.warn('[JWT Parser] Invalid tenant claims: memberships is not an array');
    return null;
  }

  return claims;
}

/**
 * Extract the access token from Supabase auth cookies
 * Supabase stores the session as a JSON object in the cookie
 *
 * @returns The access token string or null if not found
 */
export function getAccessTokenFromCookies(): string | null {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmed = cookie.trim();

    // Look for Supabase auth token cookies
    // Format: sb-<project-ref>-auth-token=<base64-encoded-session>
    if (trimmed.startsWith('sb-') && trimmed.includes('-auth-token=')) {
      const [, value] = trimmed.split('=');
      if (!value || value === 'undefined') {
        continue;
      }

      try {
        // The cookie value is the session JSON (may be chunked for large sessions)
        // First try to parse as JSON directly
        const decoded = decodeURIComponent(value);

        // Handle chunked cookies - Supabase may split large sessions
        // into multiple cookies with .0, .1, etc. suffixes
        // For now, we'll try to parse the first chunk
        const session = JSON.parse(decoded);

        if (session?.access_token) {
          return session.access_token;
        }

        // Some Supabase versions store it differently
        if (session?.currentSession?.access_token) {
          return session.currentSession.access_token;
        }
      } catch {
        // Cookie might be chunked or in a different format
        // Try base64 decoding
        try {
          const decoded = base64UrlDecode(value);
          const session = JSON.parse(decoded);

          if (session?.access_token) {
            return session.access_token;
          }
        } catch {
          // Continue to next cookie
        }
      }
    }
  }

  return null;
}

/**
 * Get tenant claims from the current session cookies
 * Convenience function that combines cookie extraction and JWT parsing
 *
 * @returns TenantClaims or null if not available
 */
export function getTenantClaimsFromSession(): TenantClaims | null {
  const token = getAccessTokenFromCookies();
  if (!token) {
    console.log('[JWT Parser] No access token found in cookies');
    return null;
  }

  return extractTenantClaims(token);
}
