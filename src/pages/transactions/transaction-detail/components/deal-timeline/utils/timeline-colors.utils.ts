import { Theme } from '@mui/material';
import type { TimelineState, AlertLevel } from '../types';

export interface StateColors {
  dot: string;
  dotBorder: string;
  stem: string;
  label: string;
  caption: string;
  labelWeight: number;
  opacity: number;
  alertBadge?: string;
}

/**
 * Get color definitions for each timeline state
 */
export const getStateColors = (
  state: TimelineState,
  theme: Theme,
  alertLevel?: AlertLevel
): StateColors => {
  const fernGreen = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  const warningColor = theme.palette.warning.main;

  // Handle N/A state (cash transactions - financing not applicable)
  if (state === 'not_applicable') {
    return {
      dot: theme.palette.grey[200],
      dotBorder: `1px dashed ${theme.palette.grey[300]}`,
      stem: theme.palette.grey[300],
      label: theme.palette.text.disabled,
      caption: theme.palette.text.disabled,
      labelWeight: 400,
      opacity: 0.6,
    };
  }

  // Handle alert states (overrides normal styling for non-complete states)
  if (alertLevel && alertLevel !== 'none' && state !== 'past') {
    const alertColor = alertLevel === 'error' ? errorColor : warningColor;
    const glowColor = alertLevel === 'error'
      ? (theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.5)' : 'rgba(211, 47, 47, 0.3)')
      : (theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.5)' : 'rgba(237, 108, 2, 0.3)');

    return {
      dot: theme.palette.background.paper,
      dotBorder: `0 0 0 3px ${theme.palette.background.paper}, 0 0 0 5px ${alertColor}, 0 0 12px ${glowColor}`,
      stem: alertColor,
      label: alertColor,
      caption: alertColor,
      labelWeight: 600,
      opacity: 1,
      alertBadge: alertColor,
    };
  }

  switch (state) {
    case 'past':
      return {
        dot: fernGreen,
        dotBorder: 'none',
        stem: fernGreen,
        label: theme.palette.text.secondary,
        caption: theme.palette.text.secondary,
        labelWeight: 500,
        opacity: 0.85,
      };
    case 'current':
      return {
        dot: fernGreen,
        dotBorder: `0 0 0 3px ${theme.palette.background.paper}, 0 0 0 5px ${fernGreen}, 0 0 12px ${theme.palette.mode === 'dark' ? 'rgba(96, 125, 59, 0.6)' : 'rgba(96, 125, 59, 0.4)'}`,
        stem: fernGreen,
        label: theme.palette.text.secondary,
        caption: theme.palette.text.secondary,
        labelWeight: 500,
        opacity: 1,
      };
    case 'future':
    default:
      return {
        dot: theme.palette.grey[400],
        dotBorder: 'none',
        stem: theme.palette.grey[400],
        label: theme.palette.text.disabled,
        caption: theme.palette.text.disabled,
        labelWeight: 500,
        opacity: 1,
      };
  }
};

