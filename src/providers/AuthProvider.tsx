/**
 * Auth Provider - Supabase Cookie-Based Authentication
 * 
 * All authentication is now handled via Supabase at contre.ai
 * This provider is kept for compatibility but delegates to useAuthStore
 */

import { PropsWithChildren } from 'react';
import { useAuthStore } from 'modules/auth/store/auth.store';
// User type import removed - not currently used

// Re-export useAuth for compatibility with existing code
export const useAuth = () => {
  const { user, isAuthenticated: _isAuthenticated, logout } = useAuthStore();
  
  return {
    sessionUser: user,
    setSessionUser: () => {}, // No-op, auth handled by Supabase
    setSession: () => {}, // No-op, auth handled by Supabase
    signout: logout,
  };
};

const AuthProvider = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

export default AuthProvider;

