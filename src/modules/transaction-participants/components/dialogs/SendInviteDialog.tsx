/**
 * Send Invite Dialog
 *
 * Dialog for sending email invitations to join a transaction.
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  FormHelperText,
  dialogClasses,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useParticipantStore } from '../../store/participant.store';
import type { SendInviteFormData } from '../../types/participant.types';
import { ROLE_OPTIONS, PERMISSION_OPTIONS } from '../../types/participant.types';

interface SendInviteDialogProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess?: () => void;
}

export const SendInviteDialog = ({
  open,
  onClose,
  transactionId,
  onSuccess,
}: SendInviteDialogProps) => {
  const { sendInvite, isSaving } = useParticipantStore();
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SendInviteFormData>({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: 'other',
      roleLabel: '',
      permissionLevel: 'view',
      personalMessage: '',
    },
  });

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: SendInviteFormData) => {
    setError(null);
    try {
      await sendInvite(transactionId, data);
      enqueueSnackbar(`Invitation sent to ${data.email}`, { variant: 'success' });
      handleClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 3,
        },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <IconifyIcon icon="mdi:email-send" sx={{ fontSize: 24 }} />
            Send Invitation
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  placeholder="Enter recipient's email"
                  type="email"
                  fullWidth
                  required
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Stack direction="row" spacing={2}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name (optional)"
                    placeholder="John"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name (optional)"
                    placeholder="Doe"
                    fullWidth
                  />
                )}
              />
            </Stack>

            <Controller
              name="role"
              control={control}
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role">
                    {ROLE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.role?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="roleLabel"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Custom Role Label (optional)"
                  placeholder="e.g., Lead Buyer's Agent"
                  fullWidth
                />
              )}
            />

            <Controller
              name="permissionLevel"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Permission Level</InputLabel>
                  <Select {...field} label="Permission Level">
                    {PERMISSION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {field.value === 'view' && 'Can view documents and reports'}
                    {field.value === 'comment' && 'Can view and add comments'}
                    {field.value === 'edit' && 'Can upload and modify documents'}
                    {field.value === 'admin' && 'Full access including participant management'}
                  </FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="personalMessage"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Personal Message (optional)"
                  placeholder="Add a personal note to the invitation email..."
                  multiline
                  rows={3}
                  fullWidth
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="soft" color="neutral" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving}
            startIcon={
              isSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <IconifyIcon icon="mdi:send" />
              )
            }
          >
            {isSaving ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SendInviteDialog;
