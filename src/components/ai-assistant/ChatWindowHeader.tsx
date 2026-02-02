/**
 * Chat Window Header Component
 * 
 * Header section with AI assistant info, transaction context, and document selection
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useChatStore } from 'modules/chat';
import { useSocketStore } from 'services/socket/socket.store';
import { useTransactions } from 'modules/transactions';
import { useDocumentControllerGetTransactionDocuments } from '@contreai/api-client';

interface ChatWindowHeaderProps {
  transactionId?: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onDocumentsChange?: (count: number, selectedName: string) => void;
}

const ChatWindowHeader = ({ transactionId, isMaximized = false, onToggleMaximize, onDocumentsChange }: ChatWindowHeaderProps) => {
  const {
    clearCurrentConversation,
    closeChat,
    selectedDocumentId,
    setSelectedDocument,
  } = useChatStore();
  const isConnected = useSocketStore((state) => state.isConnected);

  const { currentTransaction, fetchTransactionById } = useTransactions();
  const { data: documentsResponse, isLoading: isLoadingDocuments } = useDocumentControllerGetTransactionDocuments(
    transactionId || '',
    { swr: { enabled: !!transactionId } }
  );

  const [documents, setDocuments] = useState<Array<{ id: string; documentName: string; parsedStatus: string }>>([]);
  const [transactionName, setTransactionName] = useState<string>('');
  const [selectedDocumentName, setSelectedDocumentName] = useState<string>('');

  // Fetch transaction name when transactionId changes
  useEffect(() => {
    if (transactionId) {
      if (!currentTransaction || currentTransaction.id !== transactionId) {
        fetchTransactionById(transactionId).catch((error) => {
          console.error('[ChatWindowHeader] Failed to fetch transaction:', error);
        });
      }
    }
  }, [transactionId, currentTransaction, fetchTransactionById]);

  // Update transaction name from currentTransaction
  useEffect(() => {
    if (currentTransaction) {
      const name =
        currentTransaction.transactionName ||
        (currentTransaction.propertyAddress
          ? `${currentTransaction.propertyAddress.streetAddress || ''}, ${currentTransaction.propertyAddress.city || ''}`.trim()
          : 'Transaction');
      setTransactionName(name);
    }
  }, [currentTransaction]);

  // Update documents when response changes (auto-fetched by SWR when transactionId changes)
  useEffect(() => {
    if (documentsResponse) {
      console.log('[ChatWindowHeader] Documents loaded for transaction:', transactionId);
      let docs: any[] = [];

      if (Array.isArray(documentsResponse)) {
        docs = documentsResponse;
      } else if (documentsResponse && typeof documentsResponse === 'object') {
        if (Array.isArray(documentsResponse.data)) {
          docs = documentsResponse.data;
        }
      }

      const formattedDocs = docs.map((doc: any, index: number) => {
        const status = doc.parsedStatus || doc.status || 'pending';
        const docName = doc.documentName || doc.name || `Document ${index + 1}`;
        const docId = doc.id || doc._id;

        return {
          id: docId || `doc-${index}-${Date.now()}`,
          documentName: docName,
          parsedStatus: status,
        };
      });

      setDocuments(formattedDocs);

      // Clear selected document if it's no longer in the list
      if (selectedDocumentId && !formattedDocs.find((d: { id: string }) => d.id === selectedDocumentId)) {
        setSelectedDocument(null);
      }
    } else if (!transactionId) {
      setDocuments([]);
    }
  }, [transactionId, documentsResponse, selectedDocumentId, setSelectedDocument]);

  // Update selected document name when selection changes
  useEffect(() => {
    if (selectedDocumentId) {
      const doc = documents.find((d) => d.id === selectedDocumentId);
      setSelectedDocumentName(doc?.documentName || '');
    } else {
      setSelectedDocumentName('');
    }
  }, [selectedDocumentId, documents]);

  // Notify parent of documents change
  useEffect(() => {
    if (onDocumentsChange) {
      onDocumentsChange(documents.length, selectedDocumentName);
    }
  }, [documents.length, selectedDocumentName, onDocumentsChange]);

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.elevation1',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        position: 'relative',
        zIndex: 1, // Ensure header is above other content
        overflow: 'visible', // Allow dropdown to overflow
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 36,
              height: 36,
            }}
          >
            <IconifyIcon icon="mdi:robot-excited-outline" sx={{ fontSize: 20, color: 'primary.contrastText' }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              Transaction IQ™
            </Typography>
            <Chip
              label={isConnected ? 'Online' : 'Offline'}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.7rem',
                bgcolor: isConnected ? 'success.main' : 'grey.500',
                color: 'white',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          {onToggleMaximize && (
            <Tooltip title={isMaximized ? 'Minimize' : 'Maximize'}>
              <IconButton size="small" onClick={onToggleMaximize} aria-label={isMaximized ? 'Minimize window' : 'Maximize window'} sx={{ color: 'text.secondary' }}>
                <IconifyIcon icon={isMaximized ? 'mdi:window-restore' : 'mdi:window-maximize'} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Clear conversation">
            <IconButton size="small" onClick={clearCurrentConversation} aria-label="Clear conversation" sx={{ color: 'text.secondary' }}>
              <IconifyIcon icon="mdi:refresh" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" onClick={closeChat} aria-label="Close chat" sx={{ color: 'text.secondary' }}>
              <IconifyIcon icon="mdi:close" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Transaction Context Indicator */}
      {transactionId && (
        <Chip
          icon={<IconifyIcon icon="mdi:file-document-outline" sx={{ fontSize: 14 }} />}
          label={transactionName || `Transaction: ${transactionId.substring(0, 8)}...`}
          size="small"
          sx={{
            bgcolor: 'background.elevation1',
            color: 'text.secondary',
            height: 20,
            fontSize: '0.7rem',
            mt: 1,
            '& .MuiChip-label': { px: 1 },
          }}
        />
      )}

      {/* Document Selection */}
      {transactionId && (
        <FormControl fullWidth size="small" sx={{ mt: 1 }} key={`doc-select-${documents.length}`}>
          <InputLabel 
            id="document-select-label" 
            shrink={true}
            sx={{ 
              color: 'text.secondary',
              '&.MuiInputLabel-shrink': {
                color: 'text.secondary',
              },
            }}
          >
            Select Document {documents.length > 0 && `(${documents.length})`}
          </InputLabel>
          <Select
            labelId="document-select-label"
            value={selectedDocumentId || ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedDocument(value || null);
            }}
            label="Select Document"
            displayEmpty
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: 'background.paper',
                  maxHeight: 300,
                  mt: 1,
                  zIndex: 99999,
                  borderRadius: 2,
                  boxShadow: 4,
                  '& .MuiMenuItem-root': {
                    borderRadius: 1,
                    mx: 0.5,
                    my: 0.25,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                      },
                    },
                  },
                },
              },
              disablePortal: false,
              sx: {
                zIndex: 99999,
              },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
            }}
            sx={{
              bgcolor: 'background.elevation1',
              color: 'text.primary',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              '& .MuiSelect-select': {
                color: 'text.primary',
                py: 1,
                fontSize: '0.875rem',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
                borderWidth: 1.5,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: 2,
              },
              '& .MuiSvgIcon-root': {
                color: 'text.secondary',
                fontSize: '1.25rem',
              },
            }}
            renderValue={(value) => {
              if (!value) return 'All Documents';
              const doc = documents.find((d) => d.id === value);
              return doc ? doc.documentName : 'All Documents';
            }}
          >
            <MenuItem value="">
              <em>All Documents</em>
            </MenuItem>
            {documents.map((doc, index) => (
              <MenuItem key={`doc-${doc.id}-${index}`} value={doc.id}>
                {doc.documentName}
                {doc.parsedStatus !== 'completed' && (
                  <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                    (Not indexed)
                  </Typography>
                )}
              </MenuItem>
            ))}
            {!isLoadingDocuments && documents.length === 0 && (
              <MenuItem value="" disabled>
                No documents available
              </MenuItem>
            )}
          </Select>
        </FormControl>
      )}

      {/* Selected Document Indicator */}
      {/* {selectedDocumentId && selectedDocumentName && (
        <Chip
          icon={<IconifyIcon icon="mdi:file-document" sx={{ fontSize: 14 }} />}
          label={selectedDocumentName}
          size="small"
          sx={{
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            height: 20,
            fontSize: '0.7rem',
            mt: 1,
            '& .MuiChip-label': { px: 1 },
          }}
        />
      )} */}
    </Box>
  );
};

export default ChatWindowHeader;

