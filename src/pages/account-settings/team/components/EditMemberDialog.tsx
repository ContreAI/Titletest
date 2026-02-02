import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  Typography,
  Avatar,
  Box,
  dialogClasses,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTeamMembers, editMemberSchema, type TeamMember, type EditMemberSchemaType } from 'modules/team';
import { ROLE_DESCRIPTIONS } from 'modules/team/utils/role-descriptions';

interface EditMemberDialogProps {
  open: boolean;
  member: TeamMember;
  onClose: () => void;
}

const EditMemberDialog = ({ open, member, onClose }: EditMemberDialogProps) => {
  const { updateMemberRole, isOwner } = useTeamMembers();
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memberName = [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditMemberSchemaType>({
    resolver: yupResolver(editMemberSchema),
    defaultValues: {
      role: member.role,
      isMaster: member.isMaster,
    },
  });

  // Reset form when member changes to sync form values with current member data
  useEffect(() => {
    if (member) {
      reset({
        role: member.role,
        isMaster: member.isMaster,
      });
    }
  }, [member, reset]);

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: EditMemberSchemaType) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await updateMemberRole(member.id, data.role as any, data.isMaster);
      enqueueSnackbar(`Updated role for ${memberName}`, { variant: 'success' });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
    } finally {
      setIsSubmitting(false);
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
            <IconifyIcon icon="mdi:account-edit-outline" sx={{ fontSize: 24 }} />
            Edit Team Member
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Member Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Avatar src={member.avatarUrl} alt={memberName} sx={{ width: 48, height: 48 }}>
                {memberName?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={500}>
                  {memberName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.email}
                </Typography>
              </Box>
            </Box>

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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !isDirty}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <IconifyIcon icon="mdi:check" />
              )
            }
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditMemberDialog;
