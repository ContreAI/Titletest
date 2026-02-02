import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTeamStore } from '../store/team.store';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  teamControllerGetTeamOverview: vi.fn(),
  teamControllerSendInvite: vi.fn(),
  teamControllerSendBulkInvites: vi.fn(),
  teamControllerResendInvite: vi.fn(),
  teamControllerCancelInvite: vi.fn(),
  teamControllerUpdateMember: vi.fn(),
  teamControllerRemoveMember: vi.fn(),
  teamControllerLeaveTeam: vi.fn(),
}));

describe('Team Store', () => {
  const mockMember = {
    id: 'member-1',
    email: 'member@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'agent',
    isMaster: false,
    avatarUrl: 'https://example.com/avatar.jpg',
    joinedAt: '2024-01-01T00:00:00Z',
  };

  const mockInvite = {
    id: 'invite-1',
    email: 'invited@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'agent',
    status: 'pending',
    invitedBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    expiresAt: '2024-01-08T00:00:00Z',
  };

  beforeEach(() => {
    useTeamStore.getState().reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTeamStore.getState();
      expect(state.members).toEqual([]);
      expect(state.invites).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isInviting).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchTeamData', () => {
    it('should fetch and store team data', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerGetTeamOverview).mockResolvedValueOnce({
        members: [mockMember],
        pendingInvites: [mockInvite],
      } as any);

      await useTeamStore.getState().fetchTeamData();

      expect(apiClient.teamControllerGetTeamOverview).toHaveBeenCalled();
      expect(useTeamStore.getState().members).toHaveLength(1);
      expect(useTeamStore.getState().invites).toHaveLength(1);
      expect(useTeamStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.teamControllerGetTeamOverview).mockReturnValueOnce(promise as any);

      const fetchPromise = useTeamStore.getState().fetchTeamData();
      expect(useTeamStore.getState().isLoading).toBe(true);

      resolvePromise!({ members: [], pendingInvites: [] });
      await fetchPromise;
      expect(useTeamStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerGetTeamOverview).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(useTeamStore.getState().fetchTeamData()).rejects.toThrow('Network error');
      expect(useTeamStore.getState().error).toBe('Network error');
      expect(useTeamStore.getState().isLoading).toBe(false);
    });
  });

  describe('sendInvite', () => {
    it('should send invite and add to state', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerSendInvite).mockResolvedValueOnce(mockInvite as any);

      await useTeamStore.getState().sendInvite({ email: 'new@example.com', role: 'agent', isMaster: false });

      expect(apiClient.teamControllerSendInvite).toHaveBeenCalledWith({
        email: 'new@example.com',
        role: 'agent',
      });
      expect(useTeamStore.getState().invites).toHaveLength(1);
      expect(useTeamStore.getState().isInviting).toBe(false);
    });

    it('should set isInviting during invite', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.teamControllerSendInvite).mockReturnValueOnce(promise as any);

      const invitePromise = useTeamStore.getState().sendInvite({ email: 'new@example.com', role: 'agent', isMaster: false });
      expect(useTeamStore.getState().isInviting).toBe(true);

      resolvePromise!(mockInvite);
      await invitePromise;
      expect(useTeamStore.getState().isInviting).toBe(false);
    });

    it('should handle invite errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerSendInvite).mockRejectedValueOnce(new Error('Failed to send'));

      await expect(
        useTeamStore.getState().sendInvite({ email: 'new@example.com', role: 'agent', isMaster: false })
      ).rejects.toThrow('Failed to send');
      expect(useTeamStore.getState().error).toBe('Failed to send');
    });
  });

  describe('cancelInvite', () => {
    it('should cancel invite and remove from state', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerCancelInvite).mockResolvedValueOnce({ success: true } as any);

      useTeamStore.setState({ invites: [mockInvite as any] });

      await useTeamStore.getState().cancelInvite('invite-1');

      expect(apiClient.teamControllerCancelInvite).toHaveBeenCalledWith('invite-1');
      expect(useTeamStore.getState().invites).toEqual([]);
    });
  });

  describe('resendInvite', () => {
    it('should resend invite and refresh data', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerResendInvite).mockResolvedValueOnce({ success: true } as any);
      vi.mocked(apiClient.teamControllerGetTeamOverview).mockResolvedValueOnce({
        members: [],
        pendingInvites: [mockInvite],
      } as any);

      await useTeamStore.getState().resendInvite('invite-1');

      expect(apiClient.teamControllerResendInvite).toHaveBeenCalledWith('invite-1');
      expect(apiClient.teamControllerGetTeamOverview).toHaveBeenCalled();
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role with optimistic update', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerUpdateMember).mockResolvedValueOnce({ id: 'member-1', role: 'admin' } as any);

      useTeamStore.setState({ members: [mockMember as any] });

      await useTeamStore.getState().updateMemberRole('member-1', 'admin');

      expect(apiClient.teamControllerUpdateMember).toHaveBeenCalledWith('member-1', {
        role: 'admin',
        isMaster: undefined,
      });
      expect(useTeamStore.getState().members[0].role).toBe('admin');
    });

    it('should revert on failure', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerUpdateMember).mockRejectedValueOnce(new Error('Update failed'));

      useTeamStore.setState({ members: [mockMember as any] });

      await expect(useTeamStore.getState().updateMemberRole('member-1', 'admin')).rejects.toThrow();
      expect(useTeamStore.getState().members[0].role).toBe('agent');
    });
  });

  describe('removeMember', () => {
    it('should remove member with optimistic update', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerRemoveMember).mockResolvedValueOnce({ success: true } as any);

      useTeamStore.setState({ members: [mockMember as any] });

      await useTeamStore.getState().removeMember('member-1');

      expect(apiClient.teamControllerRemoveMember).toHaveBeenCalledWith('member-1');
      expect(useTeamStore.getState().members).toEqual([]);
    });

    it('should revert on failure', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerRemoveMember).mockRejectedValueOnce(new Error('Remove failed'));

      useTeamStore.setState({ members: [mockMember as any] });

      await expect(useTeamStore.getState().removeMember('member-1')).rejects.toThrow();
      expect(useTeamStore.getState().members).toHaveLength(1);
    });
  });

  describe('leaveTeam', () => {
    it('should call leave team API', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerLeaveTeam).mockResolvedValueOnce({ success: true } as any);

      await useTeamStore.getState().leaveTeam();

      expect(apiClient.teamControllerLeaveTeam).toHaveBeenCalled();
    });

    it('should handle leave errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.teamControllerLeaveTeam).mockRejectedValueOnce(new Error('Cannot leave'));

      await expect(useTeamStore.getState().leaveTeam()).rejects.toThrow('Cannot leave');
      expect(useTeamStore.getState().error).toBe('Cannot leave');
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useTeamStore.setState({ error: 'Some error' });
      useTeamStore.getState().clearError();
      expect(useTeamStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useTeamStore.setState({
        members: [mockMember as any],
        invites: [mockInvite as any],
        isLoading: true,
        isInviting: true,
        error: 'Error',
      });

      useTeamStore.getState().reset();

      const state = useTeamStore.getState();
      expect(state.members).toEqual([]);
      expect(state.invites).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isInviting).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
