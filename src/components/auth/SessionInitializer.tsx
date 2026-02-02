/**
 * Session Initializer Component
 * 
 * Initializes Supabase session on app load
 * Should be mounted at the root of the app
 */

import { useEffect } from 'react';
import { useAuthStore } from 'modules/auth/store/auth.store';

export const SessionInitializer = ({ children }: { children: React.ReactNode }) => {
  const { initSession, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize session from Supabase cookies
    initSession();
  }, [initSession]);

  // Optionally show a loading state while initializing
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}>
        Loading...
      </div>
    );
  }

  return <>{children}</>;
};

