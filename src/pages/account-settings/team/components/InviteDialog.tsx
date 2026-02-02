import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Stack,
  Alert,
  CircularProgress,
  FormHelperText,
  dialogClasses,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTeamInvites, inviteSchema, type InviteFormData } from 'modules/team';
import { ROLE_DESCRIPTIONS } from 'modules/team/utils/role-descriptions';

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
}

const InviteDialog = ({ open, onClose }: InviteDialogProps) => {
  const { sendInvite, isInviting, isOwner } = useTeamInvites();
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: yupResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'agent',
      isMaster: false,
    },
  });

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: InviteFormData) => {
    setError(null);
    try {
      await sendInvite(data);
      enqueueSnackbar(`Invite sent to ${data.email}`, { variant: 'success' });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
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
            <IconifyIcon icon="mdi:account-plus-outline" sx={{ fontSize: 24 }} />
            Invite Team Member
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  placeholder="Enter email address"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoFocus
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role">
                    <MenuItem value="broker">Broker</MenuItem>
                    <MenuItem value="agent">Agent</MenuItem>
                    <MenuItem value="transactionCoordinator">Transaction Coordinator</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                  <FormHelperText error={!!errors.role}>
                    {errors.role?.message || ROLE_DESCRIPTIONS[field.value] || ''}
                  </FormHelperText>
                </FormControl>
              )}
            />

            {isOwner && (
              <Controller
                name="isMaster"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Grant master account capabilities"
                  />
                )}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="soft"
            color="neutral"
            onClick={handleClose}
            disabled={isInviting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isInviting}
            startIcon={
              isInviting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <IconifyIcon icon="mdi:send-outline" />
              )
            }
          >
            {isInviting ? 'Sending...' : 'Send Invite'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteDialog;
