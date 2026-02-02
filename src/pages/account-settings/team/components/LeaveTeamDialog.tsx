import { useState } from 'react';
import { useNavigate } from 'react-router';
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
  dialogClasses,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTeamMembers } from 'modules/team';
import { useTenantStore } from 'modules/tenant/store/tenant.store';
import paths from 'routes/paths';

interface LeaveTeamDialogProps {
  open: boolean;
  onClose: () => void;
}

const LeaveTeamDialog = ({ open, onClose }: LeaveTeamDialogProps) => {
  const navigate = useNavigate();
  const { leaveTeam } = useTeamMembers();
  const { activeTenant, loadTenantClaims } = useTenantStore();
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleLeave = async () => {
    setError(null);
    setIsSubmitting(true);
    const teamName = activeTenant?.name || 'the team';
    try {
      await leaveTeam();
      enqueueSnackbar(`You have left ${teamName}`, { variant: 'success' });
      // Refresh tenant claims after leaving
      await loadTenantClaims();
      // Navigate to dashboard (will show different tenant or prompt to join one)
      navigate(paths.dashboard);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave team');
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
          <IconifyIcon icon="mdi:exit-to-app" sx={{ fontSize: 24, color: 'warning.main' }} />
          Leave Team
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Typography variant="body1">
            Are you sure you want to leave <strong>{activeTenant?.name || 'this team'}</strong>?
          </Typography>

          <Typography variant="body2" color="text.secondary">
            You will lose access to all team resources. If you want to rejoin,
            you will need to be invited again by a team administrator.
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
          color="warning"
          onClick={handleLeave}
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <IconifyIcon icon="mdi:exit-to-app" />
            )
          }
        >
          {isSubmitting ? 'Leaving...' : 'Leave Team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveTeamDialog;
