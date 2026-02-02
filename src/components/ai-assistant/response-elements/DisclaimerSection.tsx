/**
 * Disclaimer Section Component
 *
 * Displays legal disclaimers at the bottom of AI responses.
 * Collapsible by default, with option to expand for full text.
 * More prominent display when guardrails were triggered.
 */

import { useState } from 'react';
import { Box, Collapse, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

export interface DisclaimerSectionProps {
  /** List of disclaimer messages to display */
  disclaimers: string[];
  /** Whether a guardrail was triggered (shows more prominently) */
  guardrailTriggered?: boolean;
  /** Initially expanded state */
  defaultExpanded?: boolean;
}

const DisclaimerSection = ({
  disclaimers,
  guardrailTriggered = false,
  defaultExpanded,
}: DisclaimerSectionProps) => {
  const theme = useTheme();
  // Expand by default if guardrail was triggered
  const [expanded, setExpanded] = useState(defaultExpanded ?? guardrailTriggered);

  if (!disclaimers.length) {
    return null;
  }

  // Combine all disclaimers into single display
  const combinedDisclaimer = disclaimers.join(' ');
  const previewText =
    combinedDisclaimer.length > 80
      ? `${combinedDisclaimer.substring(0, 77)}...`
      : combinedDisclaimer;

  return (
    <Box
      sx={{
        mt: 2,
        borderLeft: `3px solid ${theme.palette.warning.main}`,
        borderRadius: '0 4px 4px 0',
        backgroundColor: alpha(theme.palette.warning.main, 0.08),
        overflow: 'hidden',
      }}
    >
      {/* Header - clickable to expand/collapse */}
      <Box
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse disclaimer' : 'Expand disclaimer'}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          p: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: alpha(theme.palette.warning.main, 0.04),
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
          },
        }}
      >
        <IconifyIcon
          icon="mdi:information-outline"
          sx={{
            fontSize: 16,
            color: 'warning.dark',
            flexShrink: 0,
            mt: 0.25,
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Collapsed view */}
          <Collapse in={!expanded} timeout={200}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: 'warning.dark',
                }}
              >
                Legal disclaimer
              </Box>
              <Box component="span" sx={{ color: 'text.tertiary' }}>
                {previewText}
              </Box>
            </Typography>
          </Collapse>

          {/* Expanded view */}
          <Collapse in={expanded} timeout={200}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'warning.dark',
                mb: 0.5,
                display: 'block',
              }}
            >
              Legal disclaimer
            </Typography>
            {disclaimers.map((disclaimer, index) => (
              <Typography
                key={index}
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  lineHeight: 1.5,
                  mb: index < disclaimers.length - 1 ? 0.5 : 0,
                }}
              >
                {disclaimer}
              </Typography>
            ))}
          </Collapse>
        </Box>

        <IconifyIcon
          icon={expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
          sx={{
            fontSize: 16,
            color: 'text.secondary',
            flexShrink: 0,
            transition: 'transform 200ms ease-in-out',
          }}
        />
      </Box>
    </Box>
  );
};

export default DisclaimerSection;
