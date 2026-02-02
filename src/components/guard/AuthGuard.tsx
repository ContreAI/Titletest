import { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from 'modules/auth/store/auth.store';
import { CircularProgress, Box } from '@mui/material';
import paths, { authPaths } from 'routes/paths';

interface AuthGuardProps extends PropsWithChildren {
  allowedRoles?: string[];
}

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();
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

  // If not authenticated, redirect to login page with return URL
  if (!isAuthenticated || !user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${authPaths.login}?redirectTo=${returnUrl}`} replace />;
  }

  const userRole = user.role ?? 'user';
  const defaultRedirect = paths.dashboard;

  if (allowedRoles?.length && !allowedRoles.includes(userRole)) {
    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
