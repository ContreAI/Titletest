/**
 * Transaction Participant Store
 *
 * Manages participants, invites, and share links for transactions.
 * Uses Zustand for state management.
 */

import { create } from 'zustand';
import axios from 'services/axios/axiosInstance';
import type {
  ParticipantStore,
  ParticipantStoreState,
  TransactionParticipant,
  TransactionInvite,
  TransactionShareLink,
  ParticipantsOverview,
  AddParticipantFormData,
  SendInviteFormData,
  CreateShareLinkFormData,
} from '../types/participant.types';
import { apiEndpoints } from 'routes/paths';

const initialState: ParticipantStoreState = {
  participants: [],
  pendingInvites: [],
  shareLinks: [],
  isLoading: false,
  isSaving: false,
  error: null,
  currentTransactionId: null,
};

export const useParticipantStore = create<ParticipantStore>()((set, get) => ({
  ...initialState,

  /**
   * Fetch participants and pending invites for a transaction
   */
  fetchParticipants: async (transactionId: string) => {
    set({ isLoading: true, error: null, currentTransactionId: transactionId });

    try {
      // Note: axiosInstance interceptor returns response.data directly
      const data = await axios.get<ParticipantsOverview>(
        apiEndpoints.transactionParticipants.list(transactionId)
      ) as unknown as ParticipantsOverview;

      set({
        participants: data.participants || [],
        pendingInvites: data.pendingInvites || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('[Participants] Failed to fetch participants:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch participants',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Add a participant manually
   */
  addParticipant: async (transactionId: string, data: AddParticipantFormData) => {
    set({ isSaving: true, error: null });

    try {
      // Note: axiosInstance interceptor returns response.data directly
      const newParticipant = await axios.post<TransactionParticipant>(
        apiEndpoints.transactionParticipants.list(transactionId),
        data
      ) as unknown as TransactionParticipant;

      set((state) => ({
        participants: [...state.participants, newParticipant],
        isSaving: false,
      }));

      return newParticipant;
    } catch (error) {
      console.error('[Participants] Failed to add participant:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to add participant',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Update a participant
   */
  updateParticipant: async (participantId: string, data: Partial<AddParticipantFormData>) => {
    const { currentTransactionId, participants } = get();
    if (!currentTransactionId) throw new Error('No transaction selected');

    const previousParticipants = participants;

    // Optimistic update
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === participantId ? { ...p, ...data } : p
      ),
      isSaving: true,
      error: null,
    }));

    try {
      // Note: axiosInstance interceptor returns response.data directly
      const updatedParticipant = await axios.patch<TransactionParticipant>(
        apiEndpoints.transactionParticipants.participant(currentTransactionId, participantId),
        data
      ) as unknown as TransactionParticipant;

      set((state) => ({
        participants: state.participants.map((p) =>
          p.id === participantId ? updatedParticipant : p
        ),
        isSaving: false,
      }));

      return updatedParticipant;
    } catch (error) {
      console.error('[Participants] Failed to update participant:', error);
      // Revert optimistic update
      set({
        participants: previousParticipants,
        error: error instanceof Error ? error.message : 'Failed to update participant',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Remove a participant
   */
  removeParticipant: async (participantId: string) => {
    const { currentTransactionId, participants } = get();
    if (!currentTransactionId) throw new Error('No transaction selected');

    const previousParticipants = participants;

    // Optimistic update
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
      isSaving: true,
      error: null,
    }));

    try {
      await axios.delete(
        apiEndpoints.transactionParticipants.participant(currentTransactionId, participantId)
      );

      set({ isSaving: false });
    } catch (error) {
      console.error('[Participants] Failed to remove participant:', error);
      // Revert optimistic update
      set({
        participants: previousParticipants,
        error: error instanceof Error ? error.message : 'Failed to remove participant',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Send an invite
   */
  sendInvite: async (transactionId: string, data: SendInviteFormData) => {
    set({ isSaving: true, error: null });

    try {
      // Note: axiosInstance interceptor returns response.data directly
      const newInvite = await axios.post<TransactionInvite>(
        apiEndpoints.transactionParticipants.invites(transactionId),
        data
      ) as unknown as TransactionInvite;

      set((state) => ({
        pendingInvites: [newInvite, ...state.pendingInvites],
        isSaving: false,
      }));

      return newInvite;
    } catch (error) {
      console.error('[Participants] Failed to send invite:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to send invite',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Cancel an invite
   */
  cancelInvite: async (inviteId: string) => {
    const { currentTransactionId } = get();
    if (!currentTransactionId) throw new Error('No transaction selected');

    try {
      await axios.delete(
        apiEndpoints.transactionParticipants.invite(currentTransactionId, inviteId)
      );

      set((state) => ({
        pendingInvites: state.pendingInvites.filter((i) => i.id !== inviteId),
      }));
    } catch (error) {
      console.error('[Participants] Failed to cancel invite:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel invite',
      });
      throw error;
    }
  },

  /**
   * Resend an invite
   */
  resendInvite: async (inviteId: string) => {
    const { currentTransactionId } = get();
    if (!currentTransactionId) throw new Error('No transaction selected');

    try {
      await axios.post(
        apiEndpoints.transactionParticipants.resendInvite(currentTransactionId, inviteId)
      );

      // Refresh to get updated expiration
      await get().fetchParticipants(currentTransactionId);
    } catch (error) {
      console.error('[Participants] Failed to resend invite:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to resend invite',
      });
      throw error;
    }
  },

  /**
   * Fetch share links for a transaction
   */
  fetchShareLinks: async (transactionId: string) => {
    try {
      // Note: axiosInstance interceptor returns response.data directly
      const shareLinks = await axios.get<TransactionShareLink[]>(
        apiEndpoints.transactionParticipants.shareLinks(transactionId)
      ) as unknown as TransactionShareLink[];

      set({ shareLinks: shareLinks || [] });
    } catch (error) {
      console.error('[Participants] Failed to fetch share links:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch share links',
      });
      throw error;
    }
  },

  /**
   * Create a share link
   */
  createShareLink: async (transactionId: string, data: CreateShareLinkFormData) => {
    set({ isSaving: true, error: null });

    try {
      // Note: axiosInstance interceptor returns response.data directly
      const newLink = await axios.post<TransactionShareLink>(
        apiEndpoints.transactionParticipants.shareLinks(transactionId),
        data
      ) as unknown as TransactionShareLink;

      set((state) => ({
        shareLinks: [newLink, ...state.shareLinks],
        isSaving: false,
      }));

      return newLink;
    } catch (error) {
      console.error('[Participants] Failed to create share link:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create share link',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Update a share link
   */
  updateShareLink: async (linkId: string, data: Partial<CreateShareLinkFormData & { isActive: boolean }>) => {
    const { currentTransactionId, shareLinks } = get();
    if (!currentTransactionId) throw new Error('No transaction selected');

    const previousLinks = shareLinks;

    // Optimistic update
    set((state) => ({
      shareLinks: state.shareLinks.map((l) =>
        l.id === linkId ? { ...l, ...data } : l
      ),
      isSaving: true,
      error: null,
    }));

    try {
      // Note: axiosInstance interceptor returns response.data directly
      const updatedLink = await axios.patch<TransactionShareLink>(
        apiEndpoints.transactionParticipants.shareLink(currentTransactionId, linkId),
        data
      ) as unknown as TransactionShareLink;

      set((state) => ({
        shareLinks: state.shareLinks.map((l) =>
          l.id === linkId ? updatedLink : l
        ),
        isSaving: false,
      }));

      return updatedLink;
    } catch (error) {
      console.error('[Participants] Failed to update share link:', error);
      // Revert optimistic update
      set({
        shareLinks: previousLinks,
        error: error instanceof Error ? error.message : 'Failed to update share link',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Delete a share link
   */
  deleteShareLink: async (linkId: string) => {
    const { currentTransactionId, shareLinks } = get();
    if (!currentTransactionId) throw new Error('No transaction selected');

    const previousLinks = shareLinks;

    // Optimistic update
    set((state) => ({
      shareLinks: state.shareLinks.filter((l) => l.id !== linkId),
      isSaving: true,
      error: null,
    }));

    try {
      await axios.delete(
        apiEndpoints.transactionParticipants.shareLink(currentTransactionId, linkId)
      );

      set({ isSaving: false });
    } catch (error) {
      console.error('[Participants] Failed to delete share link:', error);
      // Revert optimistic update
      set({
        shareLinks: previousLinks,
        error: error instanceof Error ? error.message : 'Failed to delete share link',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));
