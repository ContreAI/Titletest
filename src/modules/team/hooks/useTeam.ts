import { useEffect, useCallback, useMemo } from 'react';
import { useTeamStore } from '../store/team.store';
import { useTenantStore } from 'modules/tenant/store/tenant.store';
import { useAuthStore } from 'modules/auth/store/auth.store';
import { TenantPermissions } from 'modules/tenant/typings/tenant.types';
import type { InviteFormData, CsvImportRow, TeamMember, TeamInvite, TeamRole } from '../typings/team.types';

/**
 * Main hook for team management functionality
 * Provides data fetching, mutations, and permission checks
 */
export function useTeam() {
  const {
    members,
    invites,
    isLoading,
    isInviting,
    error,
    fetchTeamData,
    sendInvite,
    sendBulkInvites,
    resendInvite,
    cancelInvite,
    updateMemberRole,
    removeMember,
    leaveTeam,
    clearError,
  } = useTeamStore();

  const { activeTenant, hasPermission, hasRole } = useTenantStore();
  const { user } = useAuthStore();

  // Get current user's ID for comparison
  const currentUserId = user?.id;

  // Fetch team data when tenant changes
  useEffect(() => {
    if (activeTenant?.tenantId) {
      fetchTeamData();
    }
  }, [activeTenant?.tenantId, fetchTeamData]);

  // Permission checks
  const canViewTeam = hasPermission(TenantPermissions.TEAM_VIEW);
  const canInvite = hasPermission(TenantPermissions.TEAM_INVITE);
  const canManage = hasPermission(TenantPermissions.TEAM_MANAGE);
  const isOwner = hasRole('owner');
  const isAdmin = hasRole(['owner', 'admin']);

  // Get pending invites only
  const pendingInvites = invites.filter((i) => i.status === 'pending');

  // Helper to check if a member is the current user
  const isCurrentUser = useCallback(
    (member: TeamMember) => currentUserId ? member.id === currentUserId : false,
    [currentUserId]
  );

  // Check if current user can leave (owners can only leave if another owner exists)
  // Note: TeamRole doesn't have 'owner' - this checks tenant-level ownership via isOwner
  const canLeave = useCallback(() => {
    if (!isOwner) return true;

    // If user is tenant owner, check if there's another admin who could take over
    const otherAdmins = members.filter(
      (m) => m.role === 'admin' && !isCurrentUser(m)
    );
    return otherAdmins.length > 0;
  }, [isOwner, members, isCurrentUser]);

  // Check if current user can remove a specific member
  const canRemoveMember = useCallback(
    (member: TeamMember) => {
      if (!canManage) return false;
      if (isCurrentUser(member)) return false; // Use leave instead
      if (member.isMaster && !isOwner) return false;
      return true;
    },
    [canManage, isOwner, isCurrentUser]
  );

  // Check if current user can edit a specific member's role
  const canEditMember = useCallback(
    (member: TeamMember) => {
      if (!canManage) return false;
      if (isCurrentUser(member)) return false;
      return isOwner; // Only owners can edit roles
    },
    [canManage, isOwner, isCurrentUser]
  );

  // Check if current user can cancel a specific invite
  const canCancelInvite = useCallback(
    (invite: TeamInvite) => {
      if (isOwner) return true;
      // Admins can only cancel their own invites
      if (isAdmin && currentUserId && invite.invitedBy === currentUserId) return true;
      return false;
    },
    [isOwner, isAdmin, currentUserId]
  );

  return {
    // Data
    members,
    invites,
    pendingInvites,
    isLoading,
    isInviting,
    error,

    // Actions
    fetchTeamData,
    sendInvite,
    sendBulkInvites,
    resendInvite,
    cancelInvite,
    updateMemberRole,
    removeMember,
    leaveTeam,
    clearError,

    // Permission checks
    canViewTeam,
    canInvite,
    canManage,
    isOwner,
    isAdmin,
    canLeave,
    canRemoveMember,
    canEditMember,
    canCancelInvite,

    // Helper
    isCurrentUser,
  };
}

/**
 * Hook for team invite operations
 */
export function useTeamInvites() {
  const {
    invites,
    isInviting,
    sendInvite,
    sendBulkInvites,
    resendInvite,
    cancelInvite,
  } = useTeamStore();

  const { hasPermission, hasRole } = useTenantStore();

  const canInvite = hasPermission(TenantPermissions.TEAM_INVITE);
  const isOwner = hasRole('owner');

  const pendingInvites = invites.filter((i) => i.status === 'pending');

  const handleSendInvite = useCallback(
    async (data: InviteFormData) => {
      if (!canInvite) {
        throw new Error('You do not have permission to send invites');
      }
      await sendInvite(data);
    },
    [canInvite, sendInvite]
  );

  const handleBulkInvite = useCallback(
    async (rows: CsvImportRow[]) => {
      if (!canInvite) {
        throw new Error('You do not have permission to send invites');
      }
      return sendBulkInvites(rows);
    },
    [canInvite, sendBulkInvites]
  );

  return {
    invites,
    pendingInvites,
    isInviting,
    canInvite,
    isOwner,
    sendInvite: handleSendInvite,
    sendBulkInvites: handleBulkInvite,
    resendInvite,
    cancelInvite,
  };
}

/**
 * Hook for team member operations
 */
export function useTeamMembers() {
  const {
    members,
    updateMemberRole,
    removeMember,
    leaveTeam,
  } = useTeamStore();

  const { hasPermission, hasRole } = useTenantStore();
  const { user } = useAuthStore();

  const canManage = hasPermission(TenantPermissions.TEAM_MANAGE);
  const isOwner = hasRole('owner');
  const currentUserId = user?.id;

  // Helper to check if a member is the current user
  const isCurrentUser = useCallback(
    (member: TeamMember) => currentUserId ? member.id === currentUserId : false,
    [currentUserId]
  );

  const currentUser = useMemo(
    () => members.find((m) => isCurrentUser(m)) || null,
    [members, isCurrentUser]
  );

  const otherMembers = useMemo(
    () => members.filter((m) => !isCurrentUser(m)),
    [members, isCurrentUser]
  );

  const handleUpdateRole = useCallback(
    async (memberId: string, role: TeamRole, isMaster?: boolean) => {
      if (!canManage || !isOwner) {
        throw new Error('You do not have permission to manage team members');
      }
      await updateMemberRole(memberId, role, isMaster);
    },
    [canManage, isOwner, updateMemberRole]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!canManage) {
        throw new Error('You do not have permission to remove team members');
      }
      await removeMember(memberId);
    },
    [canManage, removeMember]
  );

  return {
    members,
    currentUser,
    otherMembers,
    canManage,
    isOwner,
    isCurrentUser,
    updateMemberRole: handleUpdateRole,
    removeMember: handleRemoveMember,
    leaveTeam,
  };
}
