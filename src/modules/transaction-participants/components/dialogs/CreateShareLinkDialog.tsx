/**
 * Create Share Link Dialog
 *
 * Dialog for creating a shareable link to the transaction.
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
  FormControlLabel,
  Switch,
  Box,
  Typography,
  IconButton,
  Tooltip,
  dialogClasses,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useParticipantStore } from '../../store/participant.store';
import type { CreateShareLinkFormData } from '../../types/participant.types';
import { ACCESS_LEVELS } from '../../types/participant.types';

interface CreateShareLinkDialogProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess?: () => void;
}

export const CreateShareLinkDialog = ({
  open,
  onClose,
  transactionId,
  onSuccess,
}: CreateShareLinkDialogProps) => {
  const { createShareLink, isSaving } = useParticipantStore();
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<CreateShareLinkFormData>({
    defaultValues: {
      accessLevel: 'view',
      requireEmail: false,
      maxUses: undefined,
    },
  });

  // Track expiration selection (in days) separately for UI
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const requireEmail = watch('requireEmail');

  const handleClose = () => {
    reset();
    setError(null);
    setCreatedLink(null);
    onClose();
  };

  const handleCopyLink = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      enqueueSnackbar('Link copied to clipboard', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to copy link', { variant: 'error' });
    }
  };

  const onSubmit = async (data: CreateShareLinkFormData) => {
    setError(null);
    try {
      // Calculate expiresAt from expiresInDays
      let expiresAt: string | undefined;
      if (expiresInDays > 0) {
        const date = new Date();
        date.setDate(date.getDate() + expiresInDays);
        expiresAt = date.toISOString();
      }

      const result = await createShareLink(transactionId, {
        ...data,
        expiresAt,
      });
      const shareUrl = `${window.location.origin}/share/${result.token}`;
      setCreatedLink(shareUrl);
      enqueueSnackbar('Share link created successfully', { variant: 'success' });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    }
  };

  // If link was created, show success state
  if (createdLink) {
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
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <IconifyIcon icon="mdi:check-circle" sx={{ fontSize: 24, color: 'success.main' }} />
            Share Link Created
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Your share link has been created. Copy and share it with anyone you want to give
              access to this transaction.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              <TextField
                value={createdLink}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
                }}
              />
              <Tooltip title="Copy link">
                <IconButton onClick={handleCopyLink} color="primary">
                  <IconifyIcon icon="mdi:content-copy" />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

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
            <IconifyIcon icon="mdi:link-variant" sx={{ fontSize: 24 }} />
            Create Share Link
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
              name="accessLevel"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Access Level</InputLabel>
                  <Select {...field} label="Access Level">
                    {ACCESS_LEVELS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {ACCESS_LEVELS.find((a) => a.value === field.value)?.description}
                  </FormHelperText>
                </FormControl>
              )}
            />

            <FormControl fullWidth>
              <InputLabel>Link Expiration</InputLabel>
              <Select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value as number)}
                label="Link Expiration"
              >
                <MenuItem value={1}>1 day</MenuItem>
                <MenuItem value={7}>7 days</MenuItem>
                <MenuItem value={14}>14 days</MenuItem>
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={0}>Never expires</MenuItem>
              </Select>
            </FormControl>

            <Controller
              name="maxUses"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val ? parseInt(val, 10) : undefined);
                  }}
                  type="number"
                  label="Maximum Uses (optional)"
                  placeholder="Leave blank for unlimited"
                  fullWidth
                  helperText="Limit how many times this link can be used"
                  inputProps={{ min: 1 }}
                />
              )}
            />

            <Controller
              name="requireEmail"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Require email to access"
                />
              )}
            />

            {requireEmail && (
              <Alert severity="info" icon={<IconifyIcon icon="mdi:information" />}>
                Visitors must provide their email address before viewing the transaction.
              </Alert>
            )}
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
                <IconifyIcon icon="mdi:link-variant-plus" />
              )
            }
          >
            {isSaving ? 'Creating...' : 'Create Link'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateShareLinkDialog;
