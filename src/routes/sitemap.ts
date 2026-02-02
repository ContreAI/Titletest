import { SxProps } from '@mui/material';
import paths from './paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  key?: string;
  selectionPrefix?: string;
  path?: string;
  active?: boolean;
  icon?: string;
  iconSx?: SxProps;
  items?: SubMenuItem[];
  new?: boolean;
  hasNew?: boolean;
}

export interface MenuItem {
  id: string;
  key?: string; // used for the locale
  subheader: string;
  icon: string;
  iconSx?: SxProps;
  items: SubMenuItem[];
}

/**
 * Generate sitemap based on user role
 * @param userRole - User's role ('broker', 'agent', 'tc', 'assistant', etc.)
 */
export const getSitemap = (userRole?: string): MenuItem[] => {
  const isBroker = userRole === 'broker';

  return [
    {
      id: 'dashboard',
      subheader: 'Dashboard',
      icon: 'material-symbols:dashboard-outline',
      items: [
        // Show Broker Home or User Home based on role
        {
          name: 'Home',
          path: paths.dashboard,
          pathName: isBroker ? 'broker-dashboard' : 'user-dashboard',
          icon: 'custom:broker-user',
          active: true,
        },
        {
          name: 'Transactions',
          path: paths.transactions,
          pathName: 'transactions',
          icon: 'custom:transactions',
          selectionPrefix: '/transactions',
          active: true,
        },
        {
          name: 'Docs/Training',
          path: paths.docsTraining,
          pathName: 'docs-training',
          icon: 'custom:docs-training',
          active: true,
        },
        {
          name: 'Alerts',
          path: paths.notifications,
          pathName: 'alerts',
          icon: 'material-symbols:manage-accounts-outline',
          active: true,
        },
        {
          name: 'Reports',
          path: undefined, // TODO: Update to actual reports path when available
          pathName: 'reports',
          icon: 'material-symbols:timer-outline',
          active: true,
        },
      ],
    },
    {
      id: 'tools',
      subheader: 'Tools',
      icon: 'material-symbols:build-outline',
      items: [
        {
          name: 'Account',
          path: paths.accountSettings,
          pathName: 'account',
          icon: 'material-symbols:admin-panel-settings-outline',
          selectionPrefix: '/account-settings',
          active: true,
        },
        {
          name: 'FAQ',
          path: undefined, // TODO: Update to actual FAQ path when available
          pathName: 'faq',
          icon: 'custom:faq',
          active: true,
        },
      ],
    },
    {
      id: 'trainings',
      subheader: 'Trainings',
      icon: 'material-symbols:school-outline',
      items: [
        {
          name: 'Help & Support',
          path: undefined, // TODO: Update to actual help path when available
          pathName: 'help-support',
          icon: 'custom:help-support',
          active: true,
        },
        {
          name: "What's New",
          path: undefined, // TODO: Update to actual what's new path when available
          pathName: 'whats-new',
          icon: 'custom:whats-new',
          active: true,
        },
        {
          name: 'Seat Usage',
          path: undefined, // TODO: Update to actual seat usage path when available
          pathName: 'seat-usage',
          icon: 'custom:seat-usage',
          active: true,
        },
      ],
    },
  ];
};

// Default sitemap (for backwards compatibility)
const sitemap: MenuItem[] = getSitemap();

export default sitemap;
