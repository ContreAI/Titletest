/**
 * Add Participant Dialog
 *
 * Dialog for adding a new participant directly to the transaction.
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
import type { AddParticipantFormData } from '../../types/participant.types';
import { ROLE_OPTIONS, PERMISSION_OPTIONS } from '../../types/participant.types';

interface AddParticipantDialogProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess?: () => void;
}

export const AddParticipantDialog = ({
  open,
  onClose,
  transactionId,
  onSuccess,
}: AddParticipantDialogProps) => {
  const { addParticipant, isSaving } = useParticipantStore();
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddParticipantFormData>({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'other',
      roleLabel: '',
      permissionLevel: 'view',
    },
  });

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: AddParticipantFormData) => {
    setError(null);
    try {
      await addParticipant(transactionId, data);
      enqueueSnackbar('Participant added successfully', { variant: 'success' });
      handleClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant');
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
            <IconifyIcon icon="mdi:account-plus" sx={{ fontSize: 24 }} />
            Add Participant
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    placeholder="John"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    placeholder="Doe"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Stack>

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  placeholder="john@example.com"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone (optional)"
                  placeholder="(555) 123-4567"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />

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
                  helperText="Override the default role label with a custom description"
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
                <IconifyIcon icon="mdi:account-plus" />
              )
            }
          >
            {isSaving ? 'Adding...' : 'Add Participant'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddParticipantDialog;
