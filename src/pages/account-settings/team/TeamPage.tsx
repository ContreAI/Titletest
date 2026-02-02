import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Skeleton,
  Collapse,
  IconButton,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTeam } from 'modules/team';
import TeamHeader from './components/TeamHeader';
import TeamMembersTable from './components/TeamMembersTable';
import PendingInvitesTable from './components/PendingInvitesTable';
import InviteDialog from './components/InviteDialog';
import BulkImportDialog from './components/BulkImportDialog';
import EditMemberDialog from './components/EditMemberDialog';
import ConfirmRemoveDialog from './components/ConfirmRemoveDialog';
import LeaveTeamDialog from './components/LeaveTeamDialog';
import type { TeamMember } from 'modules/team';

const TeamPage = () => {
  const {
    members,
    pendingInvites,
    isLoading,
    error,
    fetchTeamData,
    clearError,
    canViewTeam,
    canInvite,
  } = useTeam();

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [removeMember, setRemoveMember] = useState<TeamMember | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  // Collapsible sections
  const [invitesExpanded, setInvitesExpanded] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  if (!canViewTeam) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          You do not have permission to view team members.
        </Alert>
      </Box>
    );
  }

  if (isLoading && members.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={200} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Header with Actions */}
      <TeamHeader
        onInvite={() => setInviteDialogOpen(true)}
        onBulkImport={() => setBulkImportDialogOpen(true)}
        canInvite={canInvite}
      />

      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <Box>
          <Box
            role="button"
            tabIndex={0}
            aria-expanded={invitesExpanded}
            aria-controls="pending-invites-section"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              mb: 1,
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
                borderRadius: 1,
              },
            }}
            onClick={() => setInvitesExpanded(!invitesExpanded)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setInvitesExpanded(!invitesExpanded);
              }
            }}
          >
            <IconButton size="small" tabIndex={-1} aria-hidden="true">
              <IconifyIcon
                icon={invitesExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                sx={{ fontSize: 20 }}
              />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600}>
              Pending Invites ({pendingInvites.length})
            </Typography>
          </Box>
          <Collapse in={invitesExpanded} id="pending-invites-section">
            <PendingInvitesTable invites={pendingInvites} />
          </Collapse>
        </Box>
      )}

      {/* Team Members Section */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Team Members ({members.length})
        </Typography>
        <TeamMembersTable
          members={members}
          onEdit={(member) => setEditMember(member)}
          onRemove={(member) => setRemoveMember(member)}
          onLeave={() => setLeaveDialogOpen(true)}
        />
      </Box>

      {/* Dialogs */}
      <InviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
      />

      <BulkImportDialog
        open={bulkImportDialogOpen}
        onClose={() => setBulkImportDialogOpen(false)}
      />

      {editMember && (
        <EditMemberDialog
          open={!!editMember}
          member={editMember}
          onClose={() => setEditMember(null)}
        />
      )}

      {removeMember && (
        <ConfirmRemoveDialog
          open={!!removeMember}
          member={removeMember}
          onClose={() => setRemoveMember(null)}
        />
      )}

      <LeaveTeamDialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
      />
    </Box>
  );
};

export default TeamPage;
