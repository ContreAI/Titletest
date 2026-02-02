import { DealData, KPIData } from 'types/crm';

export const brokerHeaderStats: DealData[] = [
  {
    icon: 'material-symbols:error-outline',
    count: 0,
    label: 'Errors Detected',
    percentage: 0,
    trend: 'up',
  },
  {
    icon: 'material-symbols:timer-outline',
    count: 0,
    label: 'Brokerage Time Saved',
    percentage: 0,
    trend: 'up',
  },
  {
    icon: 'material-symbols:schedule-outline',
    count: 0,
    label: 'Agent Time Saved',
    percentage: 0,
    trend: 'up',
  },
];

export const usersAgentsKPIs: KPIData[] = [
  {
    title: 'Active Deals',
    value: 0,
    subtitle: 'Ongoing transactions',
    icon: {
      name: 'custom:broker-active-deal',
      color: 'primary.main',
    },
  },
  {
    title: 'Projected Commissions',
    value: '$245,000',
    subtitle: 'Expected earnings',
    icon: {
      name: 'custom:broker-project-commission',
      color: 'warning.main',
    },
  },
  {
    title: 'Pre-Contingency Clear',
    value: 0,
    subtitle: 'Ready to proceed',
    icon: {
      name: 'custom:broker-pre-contingency-clear',
      color: 'success.main',
    },
  },
  {
    title: 'Ready for Close',
    value: 0,
    subtitle: 'Final stage deals',
    icon: {
      name: 'custom:broker-ready-for-close',
      color: 'secondary.main',
    },
  },
  {
    title: 'Closed',
    value: 0,
    subtitle: 'Completed deals',
    icon: {
      name: 'custom:broker-closed',
      color: 'info.main',
    },
  },
];

