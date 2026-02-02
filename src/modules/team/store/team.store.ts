/**
 * Team Store - Team member and invite management
 *
 * Manages team state for the current tenant.
 * Uses Zustand for consistency with other stores.
 *
 * Key features:
 * - Fetch and cache team members and invites
 * - Handle invite operations (send, cancel, resend)
 * - Handle member operations (update role, remove)
 * - Permission-aware actions
 */

import { create } from 'zustand';
import {
  teamControllerGetTeamOverview,
  teamControllerSendInvite,
  teamControllerSendBulkInvites,
  teamControllerResendInvite,
  teamControllerCancelInvite,
  teamControllerUpdateMember,
  teamControllerRemoveMember,
  teamControllerLeaveTeam,
  type CreateInviteDto,
  type BulkInviteDto,
  type UpdateMemberDto,
} from '@contreai/api-client';
import type {
  TeamStore,
  TeamMember,
  TeamInvite,
  InviteFormData,
  CsvImportRow,
  TeamRole,
} from '../typings/team.types';

const initialState = {
  members: [] as TeamMember[],
  invites: [] as TeamInvite[],
  isLoading: false,
  isInviting: false,
  error: null as string | null,
};

export const useTeamStore = create<TeamStore>()((set, get) => ({
  ...initialState,

  /**
   * Fetch team data (members and invites) for current tenant
   */
  fetchTeamData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Use generated client - response is TeamOverviewDataDto directly (no wrapper)
      const teamData = await teamControllerGetTeamOverview();

      // Types now match directly - TeamMember is TeamMemberDto, TeamInvite is InviteDto
      set({
        members: teamData.members || [],
        invites: teamData.pendingInvites || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('[Team] Failed to fetch team data:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch team data',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Send a single invite
   */
  sendInvite: async (data: InviteFormData) => {
    set({ isInviting: true, error: null });

    try {
      // Map InviteFormData to CreateInviteDto
      const payload: CreateInviteDto = {
        email: data.email,
        role: data.role as CreateInviteDto['role'],
      };

      // Use generated client - response is InviteDto directly (no wrapper)
      // TeamInvite is now an alias for InviteDto, so we can use it directly
      const invite = await teamControllerSendInvite(payload);

      set((state) => ({
        invites: [invite, ...state.invites],
        isInviting: false,
      }));
    } catch (error) {
      console.error('[Team] Failed to send invite:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to send invite',
        isInviting: false,
      });
      throw error;
    }
  },

  /**
   * Send bulk invites from CSV import
   */
  sendBulkInvites: async (rows: CsvImportRow[]) => {
    set({ isInviting: true, error: null });

    try {
      // Map rows to BulkInviteDto format
      // Note: The API has changed - BulkInviteDto now only has defaultRole
      // Individual invites are sent as separate requests or the API handles the CSV differently
      const payload: BulkInviteDto = {
        defaultRole: rows[0]?.role as BulkInviteDto['defaultRole'],
      };

      // Use generated client - response is BulkInviteResultDto[] directly (no wrapper)
      const results = await teamControllerSendBulkInvites(payload);

      // Extract successful invites from results
      // BulkInviteResultDto.invite is InviteDto which matches TeamInvite
      type BulkResult = { success: boolean; invite?: TeamInvite };
      const resultsArray = results as unknown as BulkResult[];
      const successfulInvites = resultsArray
        .filter((result): result is BulkResult & { invite: TeamInvite } =>
          result.success && result.invite !== undefined
        )
        .map((result) => result.invite);

      const sent = resultsArray.filter((r) => r.success).length;
      const failed = resultsArray.filter((r) => !r.success).length;

      // Add new invites to state
      set((state) => ({
        invites: [...successfulInvites, ...state.invites],
        isInviting: false,
      }));

      return { sent, failed };
    } catch (error) {
      console.error('[Team] Failed to send bulk invites:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to send bulk invites',
        isInviting: false,
      });
      throw error;
    }
  },

  /**
   * Resend an existing invite
   */
  resendInvite: async (inviteId: string) => {
    try {
      // Use generated client
      await teamControllerResendInvite(inviteId);

      // Optionally refresh invites to get updated timestamp
      await get().fetchTeamData();
    } catch (error) {
      console.error('[Team] Failed to resend invite:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to resend invite',
      });
      throw error;
    }
  },

  /**
   * Cancel a pending invite
   */
  cancelInvite: async (inviteId: string) => {
    try {
      // Use generated client
      await teamControllerCancelInvite(inviteId);

      // Remove invite from state
      set((state) => ({
        invites: state.invites.filter((i) => i.id !== inviteId),
      }));
    } catch (error) {
      console.error('[Team] Failed to cancel invite:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel invite',
      });
      throw error;
    }
  },

  /**
   * Update a member's role
   */
  updateMemberRole: async (memberId: string, role: TeamRole, isMaster?: boolean) => {
    const previousMembers = get().members;

    // Optimistic update
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? { ...m, role, ...(isMaster !== undefined ? { isMaster: isMaster } : {}) }
          : m
      ),
    }));

    try {
      // Use generated client
      const payload: UpdateMemberDto = {
        role: role as UpdateMemberDto['role'],
        isMaster,
      };
      await teamControllerUpdateMember(memberId, payload);
    } catch (error) {
      console.error('[Team] Failed to update member role:', error);
      // Revert on failure
      set({ members: previousMembers });
      set({
        error: error instanceof Error ? error.message : 'Failed to update member role',
      });
      throw error;
    }
  },

  /**
   * Remove a member from the team
   */
  removeMember: async (memberId: string) => {
    const previousMembers = get().members;

    // Optimistic update
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    }));

    try {
      // Use generated client
      await teamControllerRemoveMember(memberId);
    } catch (error) {
      console.error('[Team] Failed to remove member:', error);
      // Revert on failure
      set({ members: previousMembers });
      set({
        error: error instanceof Error ? error.message : 'Failed to remove member',
      });
      throw error;
    }
  },

  /**
   * Leave the team (self-removal)
   */
  leaveTeam: async () => {
    try {
      // Use generated client
      await teamControllerLeaveTeam();

      // The user will be removed from the tenant, so we'll need to
      // redirect or refresh tenant claims after this
    } catch (error) {
      console.error('[Team] Failed to leave team:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to leave team',
      });
      throw error;
    }
  },

  /**
   * Clear any error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset the store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));
