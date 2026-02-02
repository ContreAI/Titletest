/**
 * Participants Table
 *
 * Displays a list of transaction participants with their roles and actions.
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useSnackbar } from 'notistack';
import type { Participant } from '../../types/participant.types';
import {
  getRoleLabel,
  getPermissionLabel,
  getStatusColor,
} from '../../types/participant.types';
import { useParticipantStore } from '../../store/participant.store';
import { EditParticipantDialog } from '../dialogs/EditParticipantDialog';
import { ConfirmRemoveDialog } from '../dialogs/ConfirmRemoveDialog';

interface ParticipantsTableProps {
  participants: Participant[];
  transactionId: string;
}

export const ParticipantsTable = ({ participants, transactionId }: ParticipantsTableProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { removeParticipant } = useParticipantStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, participant: Participant) => {
    setAnchorEl(event.currentTarget);
    setSelectedParticipant(participant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    setEditDialogOpen(true);
  };

  const handleRemove = () => {
    handleMenuClose();
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedParticipant) return;

    try {
      await removeParticipant(selectedParticipant.id);
      enqueueSnackbar('Participant removed successfully', { variant: 'success' });
      setRemoveDialogOpen(false);
      setSelectedParticipant(null);
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to remove participant',
        { variant: 'error' }
      );
    }
  };

  const getParticipantName = (participant: Participant) => {
    if (participant.firstName || participant.lastName) {
      return [participant.firstName, participant.lastName].filter(Boolean).join(' ');
    }
    return participant.email || 'Unknown';
  };

  const getInitials = (participant: Participant) => {
    const name = getParticipantName(participant);
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (participants.length === 0) {
    return null;
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="Participants list">
          <TableHead>
            <TableRow>
              <TableCell>Participant</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Permission</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant) => {
              const name = getParticipantName(participant);

              return (
                <TableRow key={participant.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                        {getInitials(participant)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {name}
                        </Typography>
                        {participant.email && name !== participant.email && (
                          <Typography variant="caption" color="text.secondary">
                            {participant.email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={participant.roleLabel || getRoleLabel(participant.role)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {getPermissionLabel(participant.permissionLevel)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                      size="small"
                      color={getStatusColor(participant.status)}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="More options">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, participant)}
                        aria-label={`Options for ${name}`}
                      >
                        <IconifyIcon icon="mdi:dots-vertical" sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <IconifyIcon icon="mdi:pencil" sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <IconifyIcon icon="mdi:delete" sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      {selectedParticipant && (
        <EditParticipantDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedParticipant(null);
          }}
          participant={selectedParticipant}
          transactionId={transactionId}
        />
      )}

      {/* Remove Confirmation Dialog */}
      {selectedParticipant && (
        <ConfirmRemoveDialog
          open={removeDialogOpen}
          onClose={() => {
            setRemoveDialogOpen(false);
            setSelectedParticipant(null);
          }}
          onConfirm={handleConfirmRemove}
          participantName={getParticipantName(selectedParticipant)}
        />
      )}
    </>
  );
};

export default ParticipantsTable;
