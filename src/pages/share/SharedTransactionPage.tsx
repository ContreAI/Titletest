/**
 * Shared Transaction Page
 *
 * Public page for viewing a transaction via a share link.
 * Shows limited transaction details based on the share link's permission level.
 * Offers option to sign up and become a full participant.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useAuthStore } from 'modules/auth';
import axios from 'services/axios/axiosInstance';
import { apiEndpoints } from 'routes/paths';
import paths from 'routes/paths';
import type { ParticipantPermissionLevel } from 'modules/transaction-participants';
import { getPermissionLabel } from 'modules/transaction-participants';

interface SharedTransactionData {
  shareLink: {
    id: string;
    label?: string;
    permissionLevel: ParticipantPermissionLevel;
    allowSignup: boolean;
    expiresAt?: string;
  };
  transaction: {
    id: string;
    name: string;
    propertyAddress?: {
      streetAddress?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
    propertyType?: string;
    representationType?: string;
    status?: string;
  };
  documents?: Array<{
    id: string;
    documentName: string;
    documentType?: string;
    uploadedAt: string;
  }>;
  owner: {
    name: string;
    brokerageName?: string;
  };
}

interface AccessShareLinkResponse {
  success: boolean;
  data?: SharedTransactionData;
  error?: {
    code: string;
    message: string;
  };
}

const SharedTransactionPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SharedTransactionData | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setIsLoading(false);
      return;
    }

    const accessShareLink = async () => {
      try {
        // Note: axiosInstance interceptor returns response.data directly
        const response = await axios.get<AccessShareLinkResponse>(
          apiEndpoints.shareLinks.access(token)
        ) as unknown as AccessShareLinkResponse;

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error?.message || 'Invalid or expired share link');
        }
      } catch (err: unknown) {
        console.error('Failed to access share link:', err);
        const error = err as { status?: number };
        if (error.status === 404) {
          setError('This share link is invalid or has been deleted');
        } else if (error.status === 410) {
          setError('This share link has expired');
        } else if (error.status === 403) {
          setError('This share link has been deactivated');
        } else {
          setError('Failed to access share link. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    accessShareLink();
  }, [token]);

  const handleSignUp = async () => {
    if (!token || !data) return;

    // Store share link token for conversion after signup
    sessionStorage.setItem('contre_pending_share_link', JSON.stringify({
      token,
      transactionId: data.transaction.id,
      timestamp: Date.now(),
    }));

    // Redirect to signup
    const authUrl = import.meta.env.VITE_AUTH_URL || 'https://contre.ai';
    const convertUrl = `${window.location.origin}/share/${token}/convert`;

    window.location.href = `${authUrl}/authentication/signup?` +
      `share=${encodeURIComponent(token)}` +
      `&type=share_link` +
      `&redirectTo=${encodeURIComponent(convertUrl)}`;
  };

  const handleConvert = async () => {
    if (!token) return;

    try {
      // Note: axiosInstance interceptor returns response.data directly
      const response = await axios.post<{ success: boolean; participant?: { transactionId: string } }>(
        apiEndpoints.shareLinks.convert(token)
      ) as unknown as { success: boolean; participant?: { transactionId: string } };

      if (response.success && response.participant) {
        sessionStorage.removeItem('contre_pending_share_link');
        navigate(paths.dealDetails(response.participant.transactionId));
      }
    } catch (err: unknown) {
      console.error('Failed to convert share link:', err);
      const error = err as { data?: { message?: string } };
      setError(error.data?.message || 'Failed to join transaction');
    }
  };

  const formatAddress = (addr?: SharedTransactionData['transaction']['propertyAddress']) => {
    if (!addr) return 'Address not available';
    return [addr.streetAddress, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ');
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <IconifyIcon
            icon="mdi:link-off"
            sx={{ fontSize: 64, color: 'error.main', mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Link Unavailable
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!data) return null;

  const { transaction, shareLink, documents, owner } = data;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
        px: 3,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header Card */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {transaction.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatAddress(transaction.propertyAddress)}
                </Typography>
              </Box>
              <Chip
                label={getPermissionLabel(shareLink.permissionLevel)}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>

            <Divider />

            <Stack direction="row" spacing={3} flexWrap="wrap">
              {transaction.propertyType && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Property Type
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction.propertyType}
                  </Typography>
                </Box>
              )}
              {transaction.representationType && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Representation
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction.representationType}
                  </Typography>
                </Box>
              )}
              {transaction.status && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction.status}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconifyIcon icon="mdi:account" sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Shared by {owner.name}
                {owner.brokerageName && ` at ${owner.brokerageName}`}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Documents List (if view permission) */}
        {documents && documents.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Documents ({documents.length})
            </Typography>
            <List disablePadding>
              {documents.map((doc, index) => (
                <ListItem
                  key={doc.id}
                  divider={index < documents.length - 1}
                  sx={{ px: 0 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <IconifyIcon icon="mdi:file-document-outline" sx={{ fontSize: 24 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.documentName}
                    secondary={doc.documentType || 'Document'}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              ))}
            </List>

            {shareLink.permissionLevel === 'view' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  You have view-only access. Sign up to download documents and collaborate.
                </Typography>
              </Alert>
            )}
          </Paper>
        )}

        {/* Sign Up CTA */}
        {shareLink.allowSignup && (
          <Paper sx={{ p: 3, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <IconifyIcon
                icon="mdi:account-plus"
                sx={{ fontSize: 48, color: 'primary.main' }}
              />
              <Typography variant="h6">
                Want full access to this transaction?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a free account to collaborate, upload documents, and stay updated on this
                transaction.
              </Typography>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleConvert}
                  startIcon={<IconifyIcon icon="mdi:login" />}
                >
                  Join This Transaction
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSignUp}
                  startIcon={<IconifyIcon icon="mdi:account-plus" />}
                >
                  Sign Up for Free
                </Button>
              )}
            </Stack>
          </Paper>
        )}

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            This transaction is shared via Contre AI - Real Estate Document Intelligence
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SharedTransactionPage;
