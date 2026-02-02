/**
 * Chat Messages Area Component
 *
 * Displays chat messages and welcome screen
 */

import { memo, useEffect, useRef } from 'react';
import { Box, Stack, Typography, Chip, Avatar, Paper, CircularProgress } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useChatStore } from 'modules/chat';
import ChatMessage from './ChatMessage';
import { useShallow } from 'zustand/react/shallow';

interface ChatMessagesAreaProps {
  transactionId?: string;
  documentsCount: number;
  selectedDocumentId: string | null;
  selectedDocumentName: string;
  onExampleClick?: (example: string) => void;
}

const ChatMessagesArea = memo(({
  transactionId,
  documentsCount,
  selectedDocumentId,
  selectedDocumentName,
  onExampleClick,
}: ChatMessagesAreaProps) => {
  // Use selective subscriptions to prevent re-renders from unrelated store changes
  const isTyping = useChatStore((state) => state.isTyping);

  // Select messages with shallow comparison to prevent re-renders when array reference changes but content is same
  const messages = useChatStore(
    useShallow((state) => state.conversations.find((c) => c.id === state.currentConversationId)?.messages || [])
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 2,
            color: 'text.secondary',
          }}
        >
          <IconifyIcon icon="mdi:robot-excited-outline" sx={{ fontSize: 64, opacity: 0.3 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Welcome to Transaction IQ™
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {transactionId
                ? documentsCount > 0
                  ? selectedDocumentId
                    ? `Ask me anything about "${selectedDocumentName}".`
                    : `Ask me anything about all ${documentsCount} document${documentsCount > 1 ? 's' : ''} in this transaction, or select a specific document above.`
                  : 'No documents found. Upload documents first.'
                : 'Ask me anything about your documents and transactions.'}
            </Typography>
          </Box>
          <Stack spacing={1} sx={{ mt: 2, width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <Typography variant="caption" fontWeight={600}>
              Example questions:
            </Typography>
            {[
              'What documents are in this transaction?',
              'Summarize the key details',
              'What are the important dates?',
              'What is the property address?',
            ].map((example, index) => (
              <Chip
                key={index}
                label={example}
                size="small"
                onClick={() => onExampleClick?.(example)}
                sx={{ cursor: 'pointer', padding: 1.5 }}
              />
            ))}
          </Stack>
        </Box>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                }}
              >
                <IconifyIcon icon="mdi:robot-excited-outline" sx={{ fontSize: 18 }} />
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CircularProgress size={12} />
                  <Typography variant="body2" color="text.secondary">
                    AI is thinking...
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
});

ChatMessagesArea.displayName = 'ChatMessagesArea';

export default ChatMessagesArea;

