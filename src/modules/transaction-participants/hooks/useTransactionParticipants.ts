/**
 * Transaction Participants Hook
 *
 * Provides easy access to participant store and actions.
 */

import { useCallback, useEffect } from 'react';
import { useParticipantStore } from '../store/participant.store';
import type {
  AddParticipantFormData,
  SendInviteFormData,
  CreateShareLinkFormData,
} from '../types/participant.types';

export interface UseTransactionParticipantsOptions {
  transactionId?: string;
  autoFetch?: boolean;
}

export function useTransactionParticipants(options: UseTransactionParticipantsOptions = {}) {
  const { transactionId, autoFetch = true } = options;

  const {
    participants,
    pendingInvites,
    shareLinks,
    isLoading,
    isSaving,
    error,
    currentTransactionId,
    fetchParticipants,
    addParticipant,
    updateParticipant,
    removeParticipant,
    sendInvite,
    cancelInvite,
    resendInvite,
    fetchShareLinks,
    createShareLink,
    updateShareLink,
    deleteShareLink,
    clearError,
    reset,
  } = useParticipantStore();

  // Auto-fetch on mount or transaction change
  useEffect(() => {
    if (autoFetch && transactionId && transactionId !== currentTransactionId) {
      fetchParticipants(transactionId);
    }
  }, [autoFetch, transactionId, currentTransactionId, fetchParticipants]);

  // Wrapped actions that use the transactionId from options
  const handleAddParticipant = useCallback(
    async (data: AddParticipantFormData) => {
      if (!transactionId) throw new Error('No transaction ID provided');
      return addParticipant(transactionId, data);
    },
    [transactionId, addParticipant]
  );

  const handleSendInvite = useCallback(
    async (data: SendInviteFormData) => {
      if (!transactionId) throw new Error('No transaction ID provided');
      return sendInvite(transactionId, data);
    },
    [transactionId, sendInvite]
  );

  const handleCreateShareLink = useCallback(
    async (data: CreateShareLinkFormData) => {
      if (!transactionId) throw new Error('No transaction ID provided');
      return createShareLink(transactionId, data);
    },
    [transactionId, createShareLink]
  );

  const handleFetchShareLinks = useCallback(async () => {
    if (!transactionId) throw new Error('No transaction ID provided');
    return fetchShareLinks(transactionId);
  }, [transactionId, fetchShareLinks]);

  const handleRefresh = useCallback(async () => {
    if (!transactionId) throw new Error('No transaction ID provided');
    await fetchParticipants(transactionId);
    await fetchShareLinks(transactionId);
  }, [transactionId, fetchParticipants, fetchShareLinks]);

  return {
    // State
    participants,
    pendingInvites,
    shareLinks,
    isLoading,
    isSaving,
    error,

    // Participant actions
    addParticipant: handleAddParticipant,
    updateParticipant,
    removeParticipant,

    // Invite actions
    sendInvite: handleSendInvite,
    cancelInvite,
    resendInvite,

    // Share link actions
    fetchShareLinks: handleFetchShareLinks,
    createShareLink: handleCreateShareLink,
    updateShareLink,
    deleteShareLink,

    // Utility actions
    refresh: handleRefresh,
    clearError,
    reset,
  };
}
