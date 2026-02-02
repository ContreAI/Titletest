import { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { usePortalAuthStore } from 'modules/portal-auth/store/portal-auth.store';
import { CircularProgress, Box } from '@mui/material';
import { PortalSide } from 'modules/portal/types/portal.types';
import { portalPaths } from 'routes/paths';

interface PortalGuardProps extends PropsWithChildren {}

/**
 * PortalGuard - Protects portal routes
 *
 * Checks if user is authenticated for the specific transaction/side combination.
 * Redirects to portal login if not authenticated.
 */
const PortalGuard = ({ children }: PortalGuardProps) => {
  const { transactionId, side } = useParams<{ transactionId: string; side: string }>();
  const { isPortalAuthenticated, isLoading } = usePortalAuthStore();
  const [checkComplete, setCheckComplete] = useState(false);

  // Validate side parameter
  const validSide = side === 'buyer' || side === 'seller' ? (side as PortalSide) : null;

  useEffect(() => {
    // Small delay to allow store to hydrate from localStorage
    const timer = setTimeout(() => {
      setCheckComplete(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking auth
  if (isLoading || !checkComplete) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Invalid URL parameters
  if (!transactionId || !validSide) {
    return <Navigate to="/404" replace />;
  }

  // Check if authenticated for this specific portal
  const isAuthenticated = isPortalAuthenticated(transactionId, validSide);

  if (!isAuthenticated) {
    // Redirect to portal login
    return <Navigate to={portalPaths.login(transactionId, validSide)} replace />;
  }

  return <>{children}</>;
};

export default PortalGuard;
