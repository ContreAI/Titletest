/**
 * Transaction Participant Types
 *
 * Type definitions for transaction participation system.
 */

/**
 * Participant roles in a transaction
 */
export type ParticipantRole =
  | 'buyer'
  | 'seller'
  | 'buyer_agent'
  | 'seller_agent'
  | 'transaction_coordinator'
  | 'lender'
  | 'title_officer'
  | 'inspector'
  | 'escrow_officer'
  | 'attorney'
  | 'other';

/**
 * Permission levels for participants
 */
export type ParticipantPermissionLevel = 'view' | 'comment' | 'edit' | 'admin';

/**
 * Participant status
 */
export type ParticipantStatus = 'pending' | 'active' | 'inactive' | 'declined';

/**
 * Invite status
 */
export type TransactionInviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled' | 'declined';

/**
 * Share link access levels
 */
export type ShareLinkAccessLevel = 'view' | 'view_documents' | 'full';

/**
 * Participant roles array for UI
 */
export const PARTICIPANT_ROLES: { value: ParticipantRole; label: string }[] = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'buyer_agent', label: 'Buyer\'s Agent' },
  { value: 'seller_agent', label: 'Seller\'s Agent' },
  { value: 'transaction_coordinator', label: 'Transaction Coordinator' },
  { value: 'lender', label: 'Lender' },
  { value: 'title_officer', label: 'Title Officer' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'escrow_officer', label: 'Escrow Officer' },
  { value: 'attorney', label: 'Attorney' },
  { value: 'other', label: 'Other' },
];

/**
 * Permission levels array for UI
 */
export const PERMISSION_LEVELS: { value: ParticipantPermissionLevel; label: string; description: string }[] = [
  { value: 'view', label: 'View Only', description: 'Can view transaction details' },
  { value: 'comment', label: 'Comment', description: 'Can view and add comments' },
  { value: 'edit', label: 'Edit', description: 'Can edit transaction details' },
  { value: 'admin', label: 'Admin', description: 'Full access including managing participants' },
];

/**
 * Transaction participant
 */
export interface TransactionParticipant {
  id: string;
  transactionId: string;
  userId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: ParticipantRole;
  roleLabel: string | null;
  permissionLevel: ParticipantPermissionLevel;
  status: ParticipantStatus;
  displayName?: string;
  isCurrentUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction invite
 */
export interface TransactionInvite {
  id: string;
  transactionId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: ParticipantRole;
  roleLabel: string | null;
  permissionLevel: ParticipantPermissionLevel;
  status: TransactionInviteStatus;
  invitedBy: {
    id: string;
    name: string | null;
  };
  personalMessage: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  createdAt: string;
  acceptedAt: string | null;
}

/**
 * Share link
 */
export interface TransactionShareLink {
  id: string;
  transactionId: string;
  token: string;
  url: string;
  accessLevel: ShareLinkAccessLevel;
  requireEmail: boolean;
  expiresAt: string | null;
  maxUses: number | null;
  useCount: number;
  isActive: boolean;
  isExpired: boolean;
  isMaxedOut: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Participants overview response
 */
export interface ParticipantsOverview {
  participants: TransactionParticipant[];
  pendingInvites: TransactionInvite[];
  totalParticipants: number;
  totalPendingInvites: number;
}

/**
 * Invite validation response
 */
export interface InviteValidationResponse {
  email: string;
  role: ParticipantRole;
  roleLabel: string | null;
  permissionLevel: ParticipantPermissionLevel;
  transactionName: string;
  propertyAddress: string;
  inviterName: string | null;
  personalMessage: string | null;
  expiresAt: string | null;
  isExpired: boolean;
}

/**
 * Invite claim response
 */
export interface InviteClaimResponse {
  participantId: string;
  transactionId: string;
  role: ParticipantRole;
  permissionLevel: ParticipantPermissionLevel;
}

/**
 * Share link validation response
 */
export interface ShareLinkValidationResponse {
  transactionId: string;
  transactionName: string;
  propertyAddress: string;
  accessLevel: ShareLinkAccessLevel;
  requireEmail: boolean;
  isValid: boolean;
  reason?: string;
}

/**
 * Share link analytics
 */
export interface ShareLinkAnalytics {
  shareLink: TransactionShareLink;
  totalViews: number;
  uniqueVisitors: number;
  conversions: number;
  participants: number;
}

/**
 * Conversion analytics
 */
export interface ConversionAnalytics {
  totalLinks: number;
  activeLinks: number;
  totalViews: number;
  uniqueVisitors: number;
  conversions: number;
  newParticipants: number;
  conversionRate: number;
}

/**
 * Form data for adding participant
 */
export interface AddParticipantFormData {
  email?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: ParticipantRole;
  roleLabel?: string;
  permissionLevel: ParticipantPermissionLevel;
}

/**
 * Form data for sending invite
 */
export interface SendInviteFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  role: ParticipantRole;
  roleLabel?: string;
  permissionLevel: ParticipantPermissionLevel;
  personalMessage?: string;
}

/**
 * Access levels array for UI
 */
export const ACCESS_LEVELS: { value: ShareLinkAccessLevel; label: string; description: string }[] = [
  { value: 'view', label: 'View Only', description: 'Can view transaction summary' },
  { value: 'view_documents', label: 'View Documents', description: 'Can view transaction and documents' },
  { value: 'full', label: 'Full Access', description: 'Full access to transaction details' },
];

/**
 * Form data for creating share link
 */
export interface CreateShareLinkFormData {
  accessLevel: ShareLinkAccessLevel;
  requireEmail?: boolean;
  expiresAt?: string;
  maxUses?: number;
}

/**
 * Store state
 */
export interface ParticipantStoreState {
  participants: TransactionParticipant[];
  pendingInvites: TransactionInvite[];
  shareLinks: TransactionShareLink[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  currentTransactionId: string | null;
}

/**
 * Store actions
 */
export interface ParticipantStoreActions {
  // Participant actions
  fetchParticipants: (transactionId: string) => Promise<void>;
  addParticipant: (transactionId: string, data: AddParticipantFormData) => Promise<TransactionParticipant>;
  updateParticipant: (participantId: string, data: Partial<AddParticipantFormData>) => Promise<TransactionParticipant>;
  removeParticipant: (participantId: string) => Promise<void>;

  // Invite actions
  sendInvite: (transactionId: string, data: SendInviteFormData) => Promise<TransactionInvite>;
  cancelInvite: (inviteId: string) => Promise<void>;
  resendInvite: (inviteId: string) => Promise<void>;

  // Share link actions
  fetchShareLinks: (transactionId: string) => Promise<void>;
  createShareLink: (transactionId: string, data: CreateShareLinkFormData) => Promise<TransactionShareLink>;
  updateShareLink: (linkId: string, data: Partial<CreateShareLinkFormData & { isActive: boolean }>) => Promise<TransactionShareLink>;
  deleteShareLink: (linkId: string) => Promise<void>;

  // Utility actions
  clearError: () => void;
  reset: () => void;
}

export type ParticipantStore = ParticipantStoreState & ParticipantStoreActions;

/**
 * Get role display label
 */
export function getRoleLabel(role: ParticipantRole, customLabel?: string | null): string {
  if (role === 'other' && customLabel) {
    return customLabel;
  }
  const roleConfig = PARTICIPANT_ROLES.find((r) => r.value === role);
  return roleConfig?.label || role;
}

/**
 * Get permission level display label
 */
export function getPermissionLabel(level: ParticipantPermissionLevel): string {
  const config = PERMISSION_LEVELS.find((p) => p.value === level);
  return config?.label || level;
}

/**
 * Get access level display label
 */
export function getAccessLevelLabel(level: ShareLinkAccessLevel): string {
  const config = ACCESS_LEVELS.find((a) => a.value === level);
  return config?.label || level;
}

/**
 * Get status display color
 */
export function getStatusColor(status: ParticipantStatus | TransactionInviteStatus): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'active':
    case 'accepted':
      return 'success';
    case 'pending':
      return 'warning';
    case 'declined':
    case 'cancelled':
    case 'inactive':
      return 'error';
    case 'expired':
      return 'default';
    default:
      return 'default';
  }
}

// Type aliases for backward compatibility with component code
export type Participant = TransactionParticipant;
export type PendingInvite = TransactionInvite;
export type ShareLink = TransactionShareLink;

// Alias for ROLE_OPTIONS and PERMISSION_OPTIONS (used by dialogs)
export const ROLE_OPTIONS = PARTICIPANT_ROLES;
export const PERMISSION_OPTIONS = PERMISSION_LEVELS;
