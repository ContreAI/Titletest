/**
 * Edit Participant Dialog
 *
 * Dialog for editing an existing participant's details.
 */

import { useState, useEffect } from 'react';
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
import type { Participant, ParticipantRole, ParticipantPermissionLevel } from '../../types/participant.types';
import { ROLE_OPTIONS, PERMISSION_OPTIONS } from '../../types/participant.types';

interface EditParticipantFormData {
  firstName: string;
  lastName: string;
  phone: string;
  role: ParticipantRole;
  roleLabel: string;
  permissionLevel: ParticipantPermissionLevel;
}

interface EditParticipantDialogProps {
  open: boolean;
  onClose: () => void;
  participant: Participant;
  transactionId: string;
}

export const EditParticipantDialog = ({
  open,
  onClose,
  participant,
   
  transactionId: _transactionId,
}: EditParticipantDialogProps) => {
  const { updateParticipant, isSaving } = useParticipantStore();
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditParticipantFormData>({
    defaultValues: {
      firstName: participant.firstName || '',
      lastName: participant.lastName || '',
      phone: participant.phone || '',
      role: participant.role,
      roleLabel: participant.roleLabel || '',
      permissionLevel: participant.permissionLevel,
    },
  });

  // Reset form when participant changes
  useEffect(() => {
    reset({
      firstName: participant.firstName || '',
      lastName: participant.lastName || '',
      phone: participant.phone || '',
      role: participant.role,
      roleLabel: participant.roleLabel || '',
      permissionLevel: participant.permissionLevel,
    });
  }, [participant, reset]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const onSubmit = async (data: EditParticipantFormData) => {
    setError(null);
    try {
      await updateParticipant(participant.id, {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone || undefined,
        role: data.role,
        roleLabel: data.roleLabel || undefined,
        permissionLevel: data.permissionLevel,
      });
      enqueueSnackbar('Participant updated successfully', { variant: 'success' });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update participant');
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
            <IconifyIcon icon="mdi:account-edit" sx={{ fontSize: 24 }} />
            Edit Participant
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Email is read-only */}
            {participant.email && (
              <TextField
                value={participant.email}
                label="Email Address"
                fullWidth
                disabled
                helperText="Email cannot be changed"
              />
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
                <IconifyIcon icon="mdi:check" />
              )
            }
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditParticipantDialog;
