/**
 * Role color mapping for consistent styling across team components
 */

export type RoleColor = 'primary' | 'secondary' | 'info' | 'default';

/**
 * Get MUI Chip color based on team role
 * - broker: primary (blue)
 * - admin: secondary (purple)
 * - agent: info (light blue)
 * - transactionCoordinator/default: default (gray)
 */
export const getRoleColor = (role: string): RoleColor => {
  switch (role.toLowerCase()) {
    case 'broker':
      return 'primary';
    case 'admin':
      return 'secondary';
    case 'agent':
      return 'info';
    case 'transactioncoordinator':
      return 'default';
    default:
      return 'default';
  }
};
