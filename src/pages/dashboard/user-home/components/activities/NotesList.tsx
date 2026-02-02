import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { dashboardSpacing } from 'theme/spacing';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  noteControllerGetTransactionNotes,
  noteControllerDeleteNote,
  getAxiosInstance,
  type NoteDto,
} from '@contreai/api-client';
import { useAuthStore } from 'modules/auth/store/auth.store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface NotesListProps {
  transactionId?: string;
}

const NotesList = ({ transactionId }: NotesListProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthStore();
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<NoteDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!transactionId) return;

    setIsLoading(true);
    try {
      const response = await noteControllerGetTransactionNotes(transactionId);
      setNotes(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  // Fetch notes on mount
  useEffect(() => {
    if (transactionId) {
      fetchNotes();
    }
  }, [transactionId, fetchNotes]);

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      enqueueSnackbar('Please enter a note', { variant: 'warning' });
      return;
    }

    if (!transactionId) {
      enqueueSnackbar('No transaction selected', { variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use getAxiosInstance() since generated noteControllerCreateNote doesn't accept parameters
      const response = await getAxiosInstance().post<NoteDto>('/notes', {
        content: noteText,
        transactionId,
      });

      const newNote = (response.data || response) as NoteDto;
      setNotes([newNote, ...notes]);
      setNoteText('');
      enqueueSnackbar('Note added successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to add note:', error);
      enqueueSnackbar('Failed to add note', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteControllerDeleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      enqueueSnackbar('Note deleted', { variant: 'info' });
    } catch (error) {
      console.error('Failed to delete note:', error);
      enqueueSnackbar('Failed to delete note', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ mt: dashboardSpacing.contentGapSm, px: dashboardSpacing.cardPaddingSm, flex: 1, overflowY: 'auto' }}>
      {/* Note Input */}
      <Paper sx={{ p: dashboardSpacing.cardPaddingSm, bgcolor: 'background.elevation1', border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={dashboardSpacing.contentGapSm}>
          {/* <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Add a Note
          </Typography> */}
          <TextField
            multiline
            rows={2}
            fullWidth
            placeholder="Type your note here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: 'background.paper',
                paddingBottom: 0,
              },
            }}
          />
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              size="medium"
              onClick={handleAddNote}
              disabled={isSubmitting || !noteText.trim()}
              // startIcon={<IconifyIcon icon="material-symbols:add" />}
              sx={{ textTransform: 'none' }}
            >
              Add Note
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Notes List */}
      <Box sx={{ mt: dashboardSpacing.cardPadding }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : notes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <IconifyIcon 
              icon="material-symbols:note-outline" 
              sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} 
            />
            <Typography variant="body2" color="text.secondary">
              {transactionId ? 'No notes yet. Add your first note above.' : 'Select a transaction to view notes'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={dashboardSpacing.componentSpacing}>
            {notes.map((note) => {
              const isCurrentUser = note.userId === user?.id;
              return (
                <Paper
                  key={note.id}
                  sx={{
                    p: dashboardSpacing.cardPaddingSm,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={dashboardSpacing.contentGapXs}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconifyIcon
                          icon="material-symbols:account-circle"
                          sx={{ fontSize: 20, color: 'text.secondary' }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {isCurrentUser ? 'You' : 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          • {dayjs(note.createdAt).fromNow()}
                        </Typography>
                      </Stack>
                      {isCurrentUser && (
                        <IconButton size="small" onClick={() => handleDeleteNote(note.id)} aria-label="Delete note">
                          <IconifyIcon
                            icon="material-symbols:delete-outline"
                            sx={{ fontSize: 18, color: 'text.secondary' }}
                          />
                        </IconButton>
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </Typography>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default NotesList;

