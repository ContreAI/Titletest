/**
 * Guardrail Alert Component
 *
 * Displays when the AI redirects users seeking legal, financial, tax, or negotiation advice
 * to appropriate professionals. Visually distinct from normal responses with a quick action
 * to show document content instead.
 */

import { Box, Alert, Chip, Collapse, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

export interface GuardrailAlertProps {
  /** The redirect message to display */
  message: string;
  /** Type of guardrail triggered */
  type?: 'legal' | 'financial' | 'tax' | 'negotiation' | 'general';
  /** Callback when user clicks "Show document content instead" */
  onShowDocumentContent?: () => void;
  /** Whether the alert is visible */
  visible?: boolean;
}

const GUARDRAIL_CONFIG = {
  legal: {
    icon: 'mdi:scale-balance',
    label: 'Legal Guidance',
    professional: 'attorney',
  },
  financial: {
    icon: 'mdi:finance',
    label: 'Financial Guidance',
    professional: 'financial advisor',
  },
  tax: {
    icon: 'mdi:calculator-variant',
    label: 'Tax Guidance',
    professional: 'tax professional',
  },
  negotiation: {
    icon: 'mdi:handshake',
    label: 'Negotiation Guidance',
    professional: 'your agent',
  },
  general: {
    icon: 'mdi:shield-check-outline',
    label: 'Professional Guidance',
    professional: 'appropriate professional',
  },
};

const GuardrailAlert = ({
  message,
  type = 'general',
  onShowDocumentContent,
  visible = true,
}: GuardrailAlertProps) => {
  const theme = useTheme();
  const config = GUARDRAIL_CONFIG[type];

  return (
    <Collapse in={visible} timeout={300}>
      <Alert
        severity="info"
        variant="outlined"
        icon={<IconifyIcon icon="mdi:shield-check-outline" sx={{ fontSize: 22 }} />}
        sx={{
          mb: 2,
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: 'info.main',
          backgroundColor: alpha(theme.palette.info.main, 0.08),
          borderRadius: 2,
          '& .MuiAlert-icon': {
            color: 'info.main',
          },
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Box>
          {/* Guardrail type badge */}
          <Chip
            size="xsmall"
            variant="soft"
            color="info"
            icon={<IconifyIcon icon={config.icon} />}
            label={config.label}
            sx={{ mb: 1 }}
          />

          {/* Main message */}
          <Typography variant="body2" sx={{ mb: 1.5, color: 'text.primary' }}>
            {message}
          </Typography>

          {/* Quick action */}
          {onShowDocumentContent && (
            <Chip
              clickable
              size="small"
              variant="soft"
              color="primary"
              icon={<IconifyIcon icon="mdi:file-document-outline" />}
              label="Show document content instead"
              onClick={onShowDocumentContent}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
                transition: 'transform 150ms ease-in-out',
              }}
            />
          )}
        </Box>
      </Alert>
    </Collapse>
  );
};

export default GuardrailAlert;
