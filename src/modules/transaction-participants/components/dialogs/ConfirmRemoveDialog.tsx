/**
 * Confirm Remove Dialog
 *
 * Confirmation dialog for removing a participant from a transaction.
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  dialogClasses,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface ConfirmRemoveDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  participantName: string;
}

export const ConfirmRemoveDialog = ({
  open,
  onClose,
  onConfirm,
  participantName,
}: ConfirmRemoveDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <IconifyIcon icon="mdi:account-remove" sx={{ fontSize: 24, color: 'error.main' }} />
          Remove Participant
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to remove <strong>{participantName}</strong> from this transaction?
          They will no longer have access to view or collaborate on this transaction.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="soft" color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          startIcon={<IconifyIcon icon="mdi:delete" />}
        >
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmRemoveDialog;
