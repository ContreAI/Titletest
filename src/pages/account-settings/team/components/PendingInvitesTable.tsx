import { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTeam, type TeamInvite } from 'modules/team';
import { getRoleColor } from 'modules/team/utils/role-colors';

interface PendingInvitesTableProps {
  invites: TeamInvite[];
}

const PendingInvitesTable = ({ invites }: PendingInvitesTableProps) => {
  const { resendInvite, cancelInvite, canCancelInvite } = useTeam();
  const { enqueueSnackbar } = useSnackbar();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getExpiryStatus = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return { label: 'Expired', color: 'error' as const };
    } else if (daysLeft <= 2) {
      return { label: `${daysLeft}d left`, color: 'warning' as const };
    }
    return { label: `${daysLeft}d left`, color: 'default' as const };
  };

  const handleResend = async (invite: TeamInvite) => {
    setLoadingAction(`resend-${invite.id}`);
    try {
      await resendInvite(invite.id);
      enqueueSnackbar(`Invite resent to ${invite.email}`, { variant: 'success' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = async (invite: TeamInvite) => {
    setLoadingAction(`cancel-${invite.id}`);
    try {
      await cancelInvite(invite.id);
      enqueueSnackbar(`Invite cancelled for ${invite.email}`, { variant: 'success' });
    } finally {
      setLoadingAction(null);
    }
  };

  if (invites.length === 0) {
    return null;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Pending team invitations">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Invited By</TableCell>
            <TableCell>Sent</TableCell>
            <TableCell>Expires</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invites.map((invite) => {
            const expiryStatus = getExpiryStatus(invite.expiresAt);
            const canCancel = canCancelInvite(invite);

            return (
              <TableRow key={invite.id}>
                <TableCell>
                  <Typography variant="body2">{invite.email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={invite.role.charAt(0).toUpperCase() + invite.role.slice(1).replace('_', ' ')}
                    color={getRoleColor(invite.role)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {invite.invitedBy}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(invite.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={expiryStatus.label}
                    color={expiryStatus.color}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Resend Invite">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleResend(invite)}
                        disabled={loadingAction === `resend-${invite.id}`}
                        aria-label={`Resend invite to ${invite.email}`}
                      >
                        {loadingAction === `resend-${invite.id}` ? (
                          <CircularProgress size={16} />
                        ) : (
                          <IconifyIcon icon="mdi:email-sync-outline" sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  {canCancel && (
                    <Tooltip title="Cancel Invite">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancel(invite)}
                          disabled={loadingAction === `cancel-${invite.id}`}
                          aria-label={`Cancel invite for ${invite.email}`}
                        >
                          {loadingAction === `cancel-${invite.id}` ? (
                            <CircularProgress size={16} color="error" />
                          ) : (
                            <IconifyIcon icon="mdi:close-circle-outline" sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
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
