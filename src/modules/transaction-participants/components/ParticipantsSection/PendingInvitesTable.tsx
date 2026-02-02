/**
 * Pending Invites Table
 *
 * Displays pending email invites with resend and cancel actions.
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  CircularProgress,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useSnackbar } from 'notistack';
import type { PendingInvite } from '../../types/participant.types';
import { getRoleLabel } from '../../types/participant.types';
import { useParticipantStore } from '../../store/participant.store';

interface PendingInvitesTableProps {
  invites: PendingInvite[];
  transactionId: string;
}

export const PendingInvitesTable = ({
  invites,
   
  transactionId: _transactionId,
}: PendingInvitesTableProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { resendInvite, cancelInvite } = useParticipantStore();
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleResend = async (inviteId: string, email: string) => {
    setResendingId(inviteId);
    try {
      await resendInvite(inviteId);
      enqueueSnackbar(`Invite resent to ${email}`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to resend invite',
        { variant: 'error' }
      );
    } finally {
      setResendingId(null);
    }
  };

  const handleCancel = async (inviteId: string) => {
    setCancellingId(inviteId);
    try {
      await cancelInvite(inviteId);
      enqueueSnackbar('Invite cancelled', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to cancel invite',
        { variant: 'error' }
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (invites.length === 0) {
    return null;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Pending invites list">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Sent</TableCell>
            <TableCell>Expires</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invites.map((invite) => {
            const expired = isExpired(invite.expiresAt);

            return (
              <TableRow
                key={invite.id}
                hover
                sx={{ opacity: expired ? 0.6 : 1 }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconifyIcon
                      icon="mdi:email-outline"
                      sx={{ fontSize: 18, color: 'text.secondary' }}
                    />
                    <Typography variant="body2">{invite.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={invite.roleLabel || getRoleLabel(invite.role)}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(invite.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={expired ? 'Expired' : (invite.expiresAt ? formatDate(invite.expiresAt) : 'No expiry')}
                    size="small"
                    color={expired ? 'error' : 'default'}
                    variant={expired ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Resend invite">
                      <IconButton
                        size="small"
                        onClick={() => handleResend(invite.id, invite.email)}
                        disabled={resendingId === invite.id || cancellingId === invite.id}
                        aria-label={`Resend invite to ${invite.email}`}
                      >
                        {resendingId === invite.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <IconifyIcon icon="mdi:email-fast" sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel invite">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleCancel(invite.id)}
                        disabled={resendingId === invite.id || cancellingId === invite.id}
                        aria-label={`Cancel invite for ${invite.email}`}
                      >
                        {cancellingId === invite.id ? (
                          <CircularProgress size={16} color="error" />
                        ) : (
                          <IconifyIcon icon="mdi:close" sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PendingInvitesTable;
