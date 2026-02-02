/**
 * Chat Message Component
 *
 * Individual message bubble for user or AI with enhanced response elements
 * for Transaction IQ including guardrails, citations, state context, and disclaimers.
 */

import { memo, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Avatar, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';
import { ChatMessage as ChatMessageType } from 'services/socket/socket.service';
import { format } from 'date-fns';
import {
  GuardrailAlert,
  CitationFooter,
  StateContextBadge,
  DisclaimerSection,
  TransactionIQMarkdown,
} from './response-elements';
import type { Citation } from './response-elements';

interface ChatMessageProps {
  message: ChatMessageType;
  /** Callback when user requests document content from guardrail */
  onShowDocumentContent?: () => void;
  /** Callback when a citation is clicked */
  onCitationClick?: (documentId: string, section?: string) => void;
}

const ChatMessage = memo(({
  message,
  onShowDocumentContent,
  onCitationClick,
}: ChatMessageProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isAI = message.sender === 'ai';
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();

  // Extract metadata
  const metadata = message.metadata;
  const hasGuardrail = metadata?.guardrailTriggered;
  const hasDisclaimers = metadata?.disclaimers && metadata.disclaimers.length > 0;
  const hasSourceDocs = metadata?.sourceDocs && metadata.sourceDocs.length > 0;
  const stateContext = metadata?.stateContext;

  // Convert source docs to citations
  const citations: Citation[] = useMemo(() => {
    if (!metadata?.sourceDocs) return [];
    return metadata.sourceDocs.map((doc, index) => ({
      id: `${doc.documentId}-${index}`,
      documentName: doc.documentName,
      section: doc.section,
      documentId: doc.documentId,
      score: doc.score,
    }));
  }, [metadata?.sourceDocs]);

  // Handle citation click
  const handleCitationClick = useCallback(
    (documentId: string, section?: string) => {
      onCitationClick?.(documentId, section);
    },
    [onCitationClick]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isAI ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        gap: 1,
        mb: 2,
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: isAI ? 'primary.main' : 'secondary.main',
        }}
      >
        {isAI ? (
          <IconifyIcon icon="mdi:robot-excited-outline" sx={{ fontSize: 18 }} />
        ) : (
          <IconifyIcon icon="mdi:account" sx={{ fontSize: 18 }} />
        )}
      </Avatar>

      {/* Message Content */}
      <Stack
        spacing={0.5}
        sx={{
          maxWidth: '75%',
          alignItems: isAI ? 'flex-start' : 'flex-end',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: isAI ? 'background.paper' : 'primary.main',
            color: isAI ? 'text.primary' : 'primary.contrastText',
            borderRadius: 2,
            position: 'relative',
            ...(isAI && {
              border: '1px solid',
              borderColor: 'divider',
            }),
          }}
        >
          {/* State Context Badge - positioned based on screen size */}
          {isAI && stateContext && (
            <StateContextBadge
              state={stateContext}
              position={isMobile ? 'inline' : 'absolute'}
            />
          )}

          {/* Guardrail Alert - shown before message content */}
          {isAI && hasGuardrail && (
            <GuardrailAlert
              message={message.message}
              type={metadata?.guardrailType}
              onShowDocumentContent={onShowDocumentContent}
            />
          )}

          {/* Main Message Content */}
          {isAI ? (
            <>
              {/* Only show markdown if not a guardrail-only message */}
              {!hasGuardrail && (
                <TransactionIQMarkdown onCitationClick={handleCitationClick}>
                  {message.message}
                </TransactionIQMarkdown>
              )}

              {/* Citation Footer */}
              {hasSourceDocs && (
                <CitationFooter
                  citations={citations}
                  onCitationClick={handleCitationClick}
                />
              )}

              {/* Disclaimer Section */}
              {hasDisclaimers && (
                <DisclaimerSection
                  disclaimers={metadata!.disclaimers!}
                  guardrailTriggered={hasGuardrail}
                />
              )}
            </>
          ) : (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.message}
            </Typography>
          )}
        </Paper>

        {/* Timestamp */}
        <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
          {format(timestamp, 'HH:mm')}
        </Typography>
      </Stack>
    </Box>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
