/**
 * Role descriptions for team permission tooltips
 * Helps users understand what each role can do
 */

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  broker: 'Full access: manage team, billing, and all settings',
  admin: 'Can invite members and manage day-to-day operations',
  agent: 'Standard access to transactions and documents',
  transactioncoordinator: 'Coordinate and manage transaction workflows',
};

/**
 * Get description for a role
 * Returns empty string for unknown roles
 */
export const getRoleDescription = (role: string): string => {
  return ROLE_DESCRIPTIONS[role.toLowerCase()] || '';
};
