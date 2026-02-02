/**
 * Guest Guard
 *
 * Protects authentication pages from authenticated users.
 * Redirects to dashboard if user is already logged in.
 */

import { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from 'modules/auth/store/auth.store';
import { CircularProgress, Box } from '@mui/material';
import paths from 'routes/paths';

const GuestGuard = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  // Initialize checkComplete based on current isLoading state to handle
  // cases where auth is already loaded (e.g., from persisted store)
  const [checkComplete, setCheckComplete] = useState(() => !isLoading);

  useEffect(() => {
    // Update checkComplete when isLoading changes to false
    if (!isLoading && !checkComplete) {
      setCheckComplete(true);
    }
  }, [isLoading, checkComplete]);

  // Show loading spinner while checking auth
  if (isLoading || !checkComplete) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <>{children}</>;
};

export default GuestGuard;
