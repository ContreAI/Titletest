/**
 * Team types - imports from @contreai/api-client with UI-specific extensions
 */

import type {
  TeamMemberDto,
  TeamMemberDtoRole,
  InviteDto,
  InviteDtoRole,
  InviteDtoStatus,
} from '@contreai/api-client';

/**
 * Team member - re-export from API client
 */
export type TeamMember = TeamMemberDto;

/**
 * Team role - re-export from API client
 * Values: 'broker' | 'agent' | 'transactionCoordinator' | 'admin'
 */
export type TeamRole = TeamMemberDtoRole;

/**
 * Team invite - re-export from API client
 */
export type TeamInvite = InviteDto;

/**
 * Invite role - re-export from API client
 */
export type InviteRole = InviteDtoRole;

/**
 * Invite status - re-export from API client
 * Values: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled'
 */
export type InviteStatus = InviteDtoStatus;

/**
 * Invite form data
 */
export interface InviteFormData {
  email: string;
  role: TeamRole;
  isMaster: boolean;
}

/**
 * CSV import row
 */
export interface CsvImportRow {
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Parsed CSV row with validation
 */
export interface ParsedCsvRow extends CsvImportRow {
  rowIndex: number;
  isValid: boolean;
  errors: string[];
}

/**
 * CSV validation result
 */
export interface CsvValidationResult {
  isValid: boolean;
  rows: ParsedCsvRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

/**
 * Team data response from API
 */
export interface TeamData {
  members: TeamMember[];
  invites: TeamInvite[];
}

/**
 * Team store state
 */
export interface TeamState {
  members: TeamMember[];
  invites: TeamInvite[];
  isLoading: boolean;
  isInviting: boolean;
  error: string | null;
}

/**
 * Team store actions
 */
export interface TeamActions {
  fetchTeamData: () => Promise<void>;
  sendInvite: (data: InviteFormData) => Promise<void>;
  sendBulkInvites: (rows: CsvImportRow[]) => Promise<{ sent: number; failed: number }>;
  resendInvite: (inviteId: string) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: TeamRole, isMaster?: boolean) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  leaveTeam: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export type TeamStore = TeamState & TeamActions;

/**
 * Brokerage info for invite acceptance
 */
export interface BrokerageInfo {
  id: string;
  name: string;
  logo?: string;
}

/**
 * Invite details for acceptance page
 */
export interface InviteDetails {
  token: string;
  email: string;
  role: TeamRole;
  isMaster: boolean;
  brokerage: BrokerageInfo;
  invitedBy: {
    name: string;
    email: string;
  };
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}

/**
 * Invite validation response
 */
export interface InviteValidationResponse {
  valid: boolean;
  invite?: InviteDetails;
  error?: {
    code: 'EXPIRED' | 'ALREADY_CLAIMED' | 'NOT_FOUND' | 'REVOKED';
    message: string;
  };
}

/**
 * Claim invite response
 */
export interface ClaimInviteResponse {
  success: boolean;
  message: string;
}
