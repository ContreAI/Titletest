import { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Typography,
  Avatar,
  Box,
  dialogClasses,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTeamMembers, type TeamMember } from 'modules/team';

interface ConfirmRemoveDialogProps {
  open: boolean;
  member: TeamMember;
  onClose: () => void;
}

const ConfirmRemoveDialog = ({ open, member, onClose }: ConfirmRemoveDialogProps) => {
  const { removeMember } = useTeamMembers();
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const memberName = [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email;

  const handleRemove = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await removeMember(member.id);
      enqueueSnackbar(`${memberName} has been removed from the team`, { variant: 'success' });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          <IconifyIcon icon="mdi:account-remove-outline" sx={{ fontSize: 24, color: 'error.main' }} />
          Remove Team Member
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
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

          <Typography variant="body2" color="text.secondary">
            Are you sure you want to remove this member from your team? They will lose
            access to all team resources and will need to be re-invited to rejoin.
          </Typography>
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
          variant="contained"
          color="error"
          onClick={handleRemove}
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <IconifyIcon icon="mdi:account-remove" />
            )
          }
        >
          {isSubmitting ? 'Removing...' : 'Remove Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmRemoveDialog;
