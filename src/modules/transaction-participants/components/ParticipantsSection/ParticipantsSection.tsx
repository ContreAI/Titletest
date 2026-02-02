/**
 * Participants Section
 *
 * Main component for managing transaction participants.
 * Shows collapsible section with participants list, pending invites, and share links.
 */

import { useState, useEffect } from 'react';
import { Box, Paper, Collapse, Stack, Typography, Button, Alert } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTransactionParticipants } from '../../hooks/useTransactionParticipants';
import { ParticipantsSectionHeader } from './ParticipantsSectionHeader';
import { ParticipantsTable } from './ParticipantsTable';
import { PendingInvitesTable } from './PendingInvitesTable';
import { ShareLinksTable } from './ShareLinksTable';
import { AddParticipantDialog } from '../dialogs/AddParticipantDialog';
import { SendInviteDialog } from '../dialogs/SendInviteDialog';
import { CreateShareLinkDialog } from '../dialogs/CreateShareLinkDialog';

interface ParticipantsSectionProps {
  transactionId: string;
}

export const ParticipantsSection = ({ transactionId }: ParticipantsSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [shareLinkDialogOpen, setShareLinkDialogOpen] = useState(false);

  const {
    participants,
    pendingInvites,
    shareLinks,
    isLoading,
    error,
    refresh,
    fetchShareLinks,
    clearError,
  } = useTransactionParticipants({ transactionId, autoFetch: true });

  // Fetch share links when section opens
  useEffect(() => {
    if (isOpen && transactionId) {
      fetchShareLinks();
    }
  }, [isOpen, transactionId, fetchShareLinks]);

  const activeParticipants = participants.filter((p) => p.status === 'active');
  const pendingParticipants = participants.filter((p) => p.status === 'pending');

  const totalCount = activeParticipants.length + pendingInvites.length + shareLinks.length;

  return (
    <Box component="section">
      <Box sx={{ mx: 'auto' }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 1px 1px rgba(0,0,0,0.2)'
                : '0 1px 1px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Header row (always visible) - clickable */}
          <ParticipantsSectionHeader
            isOpen={isOpen}
            onToggle={() => setIsOpen((prev) => !prev)}
            participantCount={totalCount}
            isLoading={isLoading}
          />

          {/* Body (collapsible) */}
          <Collapse in={isOpen}>
            <Box sx={{ p: 3 }}>
              {error && (
                <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Action buttons */}
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconifyIcon icon="mdi:account-plus" />}
                  onClick={() => setAddDialogOpen(true)}
                >
                  Add Participant
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconifyIcon icon="mdi:email-send" />}
                  onClick={() => setInviteDialogOpen(true)}
                >
                  Send Invite
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconifyIcon icon="mdi:link-variant" />}
                  onClick={() => setShareLinkDialogOpen(true)}
                >
                  Create Share Link
                </Button>
              </Stack>

              {/* Active Participants */}
              {activeParticipants.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Active Participants ({activeParticipants.length})
                  </Typography>
                  <ParticipantsTable
                    participants={activeParticipants}
                    transactionId={transactionId}
                  />
                </Box>
              )}

              {/* Pending Participants (added but not yet activated) */}
              {pendingParticipants.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Pending Participants ({pendingParticipants.length})
                  </Typography>
                  <ParticipantsTable
                    participants={pendingParticipants}
                    transactionId={transactionId}
                  />
                </Box>
              )}

              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Pending Invites ({pendingInvites.length})
                  </Typography>
                  <PendingInvitesTable
                    invites={pendingInvites}
                    transactionId={transactionId}
                  />
                </Box>
              )}

              {/* Share Links */}
              {shareLinks.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Share Links ({shareLinks.length})
                  </Typography>
                  <ShareLinksTable
                    shareLinks={shareLinks}
                    transactionId={transactionId}
                  />
                </Box>
              )}

              {/* Empty state */}
              {!isLoading &&
                activeParticipants.length === 0 &&
                pendingParticipants.length === 0 &&
                pendingInvites.length === 0 &&
                shareLinks.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <IconifyIcon
                      icon="mdi:account-group-outline"
                      sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
                    />
                    <Typography color="text.secondary" variant="body2">
                      No participants yet. Add participants, send invites, or create share links to
                      collaborate on this transaction.
                    </Typography>
                  </Box>
                )}
            </Box>
          </Collapse>
        </Paper>
      </Box>

      {/* Dialogs */}
      <AddParticipantDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        transactionId={transactionId}
        onSuccess={refresh}
      />
      <SendInviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        transactionId={transactionId}
        onSuccess={refresh}
      />
      <CreateShareLinkDialog
        open={shareLinkDialogOpen}
        onClose={() => setShareLinkDialogOpen(false)}
        transactionId={transactionId}
        onSuccess={fetchShareLinks}
      />
    </Box>
  );
};

export default ParticipantsSection;
