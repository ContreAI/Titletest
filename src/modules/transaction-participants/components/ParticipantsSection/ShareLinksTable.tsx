/**
 * Share Links Table
 *
 * Displays share links with copy, toggle, and delete actions.
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Switch,
  CircularProgress,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useSnackbar } from 'notistack';
import type { ShareLink } from '../../types/participant.types';
import { getAccessLevelLabel } from '../../types/participant.types';
import { useParticipantStore } from '../../store/participant.store';

interface ShareLinksTableProps {
  shareLinks: ShareLink[];
  transactionId: string;
}

export const ShareLinksTable = ({
  shareLinks,

  transactionId: _transactionId,
}: ShareLinksTableProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { updateShareLink, deleteShareLink } = useParticipantStore();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/share/${token}`;
  };

  const handleCopyLink = async (token: string) => {
    const url = getShareUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      enqueueSnackbar('Link copied to clipboard', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to copy link', { variant: 'error' });
    }
  };

  const handleToggleActive = async (link: ShareLink) => {
    setTogglingId(link.id);
    try {
      await updateShareLink(link.id, { isActive: !link.isActive });
      enqueueSnackbar(
        link.isActive ? 'Share link deactivated' : 'Share link activated',
        { variant: 'success' }
      );
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to update share link',
        { variant: 'error' }
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (linkId: string) => {
    setDeletingId(linkId);
    try {
      await deleteShareLink(linkId);
      enqueueSnackbar('Share link deleted', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to delete share link',
        { variant: 'error' }
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!Array.isArray(shareLinks) || shareLinks.length === 0) {
    return null;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Share links list">
        <TableHead>
          <TableRow>
            <TableCell>Link</TableCell>
            <TableCell>Access Level</TableCell>
            <TableCell>Uses</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shareLinks.map((link) => {
            const expired = isExpired(link.expiresAt);
            const active = link.isActive && !expired;

            return (
              <TableRow
                key={link.id}
                hover
                sx={{ opacity: !active ? 0.6 : 1 }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconifyIcon
                      icon="mdi:link-variant"
                      sx={{ fontSize: 18, color: 'text.secondary' }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {link.token.substring(0, 8)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {getAccessLevelLabel(link.accessLevel)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="Number of times link has been used">
                    <Chip
                      icon={<IconifyIcon icon="mdi:eye" sx={{ fontSize: 14 }} />}
                      label={link.useCount}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(link.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {expired ? (
                    <Chip
                      label="Expired"
                      size="small"
                      color="error"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {togglingId === link.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Switch
                          size="small"
                          checked={link.isActive}
                          onChange={() => handleToggleActive(link)}
                          inputProps={{ 'aria-label': 'Toggle link active state' }}
                        />
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Copy link">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyLink(link.token)}
                        aria-label="Copy share link"
                      >
                        <IconifyIcon icon="mdi:content-copy" sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete link">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(link.id)}
                        disabled={deletingId === link.id}
                        aria-label="Delete share link"
                      >
                        {deletingId === link.id ? (
                          <CircularProgress size={16} color="error" />
                        ) : (
                          <IconifyIcon icon="mdi:delete" sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ShareLinksTable;
