"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UseAuthOptions {
  transactionId: string;
  side: "buyer" | "seller";
  requireAuth?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Hook to manage portal authentication
 *
 * For demo purposes, this uses sessionStorage to track auth state.
 * In production, this would validate JWT tokens from the backend.
 */
export function useAuth({ transactionId, side, requireAuth = true }: UseAuthOptions): AuthState {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for auth token in sessionStorage
    const authKey = `portal_auth_${transactionId}_${side}`;
    const token = sessionStorage.getItem(authKey);

    const authenticated = token === "authenticated";
    setIsAuthenticated(authenticated);
    setIsLoading(false);

    // If auth is required and not authenticated, redirect to login
    if (requireAuth && !authenticated && !pathname?.includes("/login")) {
      router.push(`/tx/${transactionId}/${side}/login`);
    }
  }, [transactionId, side, requireAuth, router, pathname]);

  return {
    isAuthenticated,
    isLoading,
  };
}

/**
 * Logout function to clear authentication
 */
export function logout(transactionId: string, side: "buyer" | "seller") {
  const authKey = `portal_auth_${transactionId}_${side}`;
  sessionStorage.removeItem(authKey);
  window.location.href = `/tx/${transactionId}/${side}/login`;
}

/**
 * Check if user is authenticated (non-hook version for server components)
 */
export function isAuthenticatedSync(transactionId: string, side: "buyer" | "seller"): boolean {
  if (typeof window === "undefined") return false;
  const authKey = `portal_auth_${transactionId}_${side}`;
  return sessionStorage.getItem(authKey) === "authenticated";
}
