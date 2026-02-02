/**
 * Chat Window Component
 *
 * Main chat interface container that orchestrates header, messages, and input
 * Socket connection is managed centrally by socket.store
 */

import { useState } from 'react';
import { useLocation } from 'react-router';
import { Paper, Divider } from '@mui/material';
import { useChatStore } from 'modules/chat';
import { useSocketStore } from 'services/socket/socket.store';
import ChatWindowHeader from './ChatWindowHeader';
import ChatMessagesArea from './ChatMessagesArea';
import ChatInputArea from './ChatInputArea';

const ChatWindow = () => {
  const { isOpen, sendMessage, selectedDocumentId } = useChatStore();
  const isConnected = useSocketStore((state) => state.isConnected);
  const [inputMessage, setInputMessage] = useState('');
  const [documentsCount, setDocumentsCount] = useState(0);
  const [selectedDocumentName, setSelectedDocumentName] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const location = useLocation();

  // Extract transaction ID from URL (UUID format)
  const transactionId = location.pathname.match(/transactions\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)?.[1];

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    // Include transaction and document context if available
    const context: any = {};
    if (transactionId) {
      context.transactionId = transactionId;
    }
    if (selectedDocumentId) {
      context.documentId = selectedDocumentId;
    }

    sendMessage(inputMessage.trim(), Object.keys(context).length > 0 ? context : undefined);
    setInputMessage('');
  };

  const handleExampleClick = (example: string) => {
    setInputMessage(example);
  };

  const handleToggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  if (!isOpen) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: isMaximized ? '100%' : { xs: 'calc(100% - 32px)', sm: 600 },
        height: isMaximized ? '100vh' : { xs: 'calc(100vh - 48px)', sm: 600 },
        maxHeight: isMaximized ? '100vh' : 'calc(100vh - 48px)',
        margin: isMaximized ? 0 : { xs: '16px', sm: '24px' },
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isMaximized ? 0 : 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        transformOrigin: 'bottom right',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      <ChatWindowHeader
        transactionId={transactionId}
        isMaximized={isMaximized}
        onToggleMaximize={handleToggleMaximize}
        onDocumentsChange={(count, name) => {
          setDocumentsCount(count);
          setSelectedDocumentName(name);
        }}
      />

      <Divider />

      <ChatMessagesArea
        transactionId={transactionId}
        documentsCount={documentsCount}
        selectedDocumentId={selectedDocumentId}
        selectedDocumentName={selectedDocumentName}
        onExampleClick={handleExampleClick}
      />

      <Divider />

      <ChatInputArea
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={handleSendMessage}
        onExampleClick={handleExampleClick}
      />
    </Paper>
  );
};

export default ChatWindow;
