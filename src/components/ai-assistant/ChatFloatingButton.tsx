/**
 * Chat Floating Button Component
 *
 * Smart floating action button - the single entry point for AI assistant chat.
 * Features a subtle pulse animation to draw attention and indicates connection status.
 * Page-aware: shows contextual tooltips based on current page.
 */

import { useMemo } from 'react';
import { Badge, Fab, Tooltip, Box, keyframes } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useChatStore } from 'modules/chat';
import { useSocketStore } from 'services/socket/socket.store';
import { ChatPageType, isTransactionContext } from 'modules/chat/typings/chat.types';

// Subtle pulse animation to draw attention
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

// Contextual tooltips based on page type
const getTooltipText = (pageType: ChatPageType, transactionAddress?: string): string => {
  switch (pageType) {
    case 'transaction-detail':
      return transactionAddress
        ? `Ask about ${transactionAddress}`
        : 'Ask about this transaction';
    case 'transactions-list':
      return 'Ask about your transactions';
    case 'dashboard':
      return 'Ask Transaction IQ™ anything';
    case 'documents':
      return 'Ask about your documents';
    case 'settings':
      return 'Need help with settings?';
    default:
      return 'Ask Transaction IQ™ anything';
  }
};

const ChatFloatingButton = () => {
  const { isOpen, openChat, pageContext } = useChatStore();
  const isConnected = useSocketStore((state) => state.isConnected);

  const transactionAddress = isTransactionContext(pageContext) ? pageContext.transactionAddress : undefined;
  const tooltipText = useMemo(
    () => getTooltipText(pageContext.pageType, transactionAddress),
    [pageContext.pageType, transactionAddress]
  );

  // Don't show button when chat is open
  if (isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1300,
      }}
    >
      <Tooltip
        title={tooltipText}
        placement="left"
        arrow
      >
        <Fab
          color="success"
          aria-label={`Open Transaction IQ™ - ${tooltipText}`}
          onClick={openChat}
          size="large"
          sx={{
            width: 64,
            height: 64,
            boxShadow: 6,
            animation: isConnected ? `${pulse} 2s ease-in-out infinite` : 'none',
            '&:hover': {
              boxShadow: 10,
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          }}
        >
          <Badge
            color="error"
            variant="dot"
            invisible={isConnected}
            sx={{
              '& .MuiBadge-badge': {
                right: 4,
                top: 4,
              },
            }}
          >
            <IconifyIcon
              icon="mdi:robot-happy-outline"
              sx={{ fontSize: 32 }}
            />
          </Badge>
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default ChatFloatingButton;

