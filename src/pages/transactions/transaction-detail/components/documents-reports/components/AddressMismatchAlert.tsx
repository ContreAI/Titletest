/**
 * Address Mismatch Alert Component
 *
 * Displays a warning banner when document address doesn't match transaction address.
 * Provides actions to keep, move to different transaction, or create new transaction.
 */

import { useState } from 'react';
import { Box, Typography, Button, Stack, Alert, AlertTitle, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

export interface AddressMismatchAlertProps {
  /** Document ID */
  documentId: string;
  /** Document name */
  documentName: string;
  /** Address extracted from document */
  documentAddress: string;
  /** Address from transaction */
  transactionAddress: string;
  /** Match confidence (0-1) */
  confidence: number;
  /** Callback when user chooses to keep in current transaction */
  onKeep: (documentId: string) => void;
  /** Callback when user chooses to move to different transaction */
  onMoveToTransaction: (documentId: string) => void;
  /** Callback when user chooses to create new transaction */
  onCreateNewTransaction: (documentId: string) => void;
}

const AddressMismatchAlert = ({
  documentId,
  documentName,
  documentAddress,
  transactionAddress,
  confidence,
  onKeep,
  onMoveToTransaction,
  onCreateNewTransaction,
}: AddressMismatchAlertProps) => {
  const theme = useTheme();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const confidencePercent = Math.round(confidence * 100);

  return (
    <Alert
      severity="warning"
      icon={<IconifyIcon icon="mdi:alert" sx={{ fontSize: 24 }} />}
      sx={{
        mb: 2,
        border: `1px solid ${theme.palette.warning.main}`,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Address Mismatch Detected
        </Typography>
        <Chip
          label={`${confidencePercent}% Match`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.6875rem',
            fontWeight: 600,
            bgcolor: alpha(theme.palette.warning.main, 0.2),
            color: 'warning.dark',
          }}
        />
      </AlertTitle>

      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        The address in <strong>{documentName}</strong> doesn't match the transaction property address.
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
              fontSize: '0.6875rem',
            }}
          >
            Document Address
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'warning.dark',
              fontWeight: 500,
              mt: 0.25,
              fontSize: '0.875rem',
              fontFamily: 'monospace',
            }}
          >
            {documentAddress}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
              fontSize: '0.6875rem',
            }}
          >
            Transaction Address
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              fontWeight: 500,
              mt: 0.25,
              fontSize: '0.875rem',
              fontFamily: 'monospace',
            }}
          >
            {transactionAddress}
          </Typography>
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
        <Button
          size="small"
          variant="outlined"
          color="warning"
          startIcon={<IconifyIcon icon="mdi:check" />}
          onClick={() => {
            onKeep(documentId);
            setIsDismissed(true);
          }}
          sx={{ flex: { xs: 1, sm: 0 } }}
        >
          Keep Here
        </Button>
        <Button
          size="small"
          variant="contained"
          color="warning"
          startIcon={<IconifyIcon icon="mdi:folder-move" />}
          onClick={() => onMoveToTransaction(documentId)}
          sx={{ flex: { xs: 1, sm: 0 } }}
        >
          Move to Transaction
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="warning"
          startIcon={<IconifyIcon icon="mdi:plus-circle-outline" />}
          onClick={() => onCreateNewTransaction(documentId)}
          sx={{ flex: { xs: 1, sm: 0 } }}
        >
          Create New Transaction
        </Button>
      </Stack>
    </Alert>
  );
};

export default AddressMismatchAlert;
