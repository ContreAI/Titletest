/**
 * Chat Input Area Component
 * 
 * Input field and send button for chat messages
 */

import { Box, Stack, TextField, IconButton, Chip } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useSocketStore } from 'services/socket/socket.store';

interface ChatInputAreaProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  onExampleClick?: (example: string) => void;
}

const ChatInputArea = ({ inputMessage, setInputMessage, onSendMessage, onExampleClick: _onExampleClick }: ChatInputAreaProps) => {
  const isConnected = useSocketStore((state) => state.isConnected);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
      {!isConnected && (
        <Chip
          icon={<IconifyIcon icon="mdi:alert-circle-outline" />}
          label="Connecting..."
          color="warning"
          size="small"
          sx={{ mb: 1, width: '100%' }}
        />
      )}
      <Stack direction="row" spacing={1} alignItems="flex-end">
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Ask me anything..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
          size="small"
          sx={{
            '& .MuiFilledInput-root': {
              borderRadius: 2,
              '&.MuiInputBase-multiline': {
                paddingTop: 0,
                paddingBottom: 1,
              },
             
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={onSendMessage}
          disabled={!inputMessage.trim() || !isConnected}
          aria-label="Send message"
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
            },
          }}
        >
          <IconifyIcon icon="mdi:send" />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default ChatInputArea;

