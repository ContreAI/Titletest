# AI Assistant Setup Guide

## Overview

The AI Assistant is a real-time chat interface that allows users to interact with an AI powered by your document knowledge base. It uses WebSocket connections for real-time communication and integrates with your existing document chunking and vector search system.

## Features

- 🤖 **Real-time AI Chat** - Instant responses via WebSocket
- 💬 **Conversation Management** - Multiple conversations with persistence
- 🔌 **Auto-reconnection** - Handles connection drops gracefully
- 📱 **Responsive UI** - Works on mobile and desktop
- 🎨 **Material-UI Design** - Consistent with your app's theme
- 💾 **Local Storage** - Conversations persist across sessions
- ⌨️ **Typing Indicators** - Shows when AI is processing

## Architecture

### Frontend Components

1. **AIAssistant** (`components/ai-assistant/index.tsx`)
   - Main component that combines floating button and chat window
   - Automatically included in App.tsx

2. **ChatFloatingButton** (`components/ai-assistant/ChatFloatingButton.tsx`)
   - Floating action button to open the chat
   - Shows connection status with a badge
   - Hidden when chat window is open

3. **ChatWindow** (`components/ai-assistant/ChatWindow.tsx`)
   - Main chat interface
   - Message display area
   - Input field with send button
   - Connection status indicator

4. **ChatMessage** (`components/ai-assistant/ChatMessage.tsx`)
   - Individual message component
   - Different styling for user vs AI messages
   - Timestamps and avatars

### State Management

**Chat Store** (`store/chat.store.ts`)
- Built with Zustand
- Manages conversations, messages, and UI state
- Persists conversations to localStorage
- Handles WebSocket connection state

### Services

**Socket Service** (`services/socket/socket.service.ts`)
- WebSocket connection management
- Event subscription/unsubscription
- Message sending/receiving
- Auto-reconnection logic

## Environment Variables

Add the following to your `.env` file:

```env
# WebSocket Server URL
VITE_SOCKET_URL=http://localhost:3001
```

For production:

```env
VITE_SOCKET_URL=https://api.contre.ai
```

## Backend Integration

The frontend connects to the existing WebSocket gateway in the backend:

- **Endpoint**: `/ws` namespace
- **Authentication**: Cookie-based (Supabase JWT)
- **Events**:
  - `connected` - Connection established
  - `chat:send` - Send message to AI
  - `chat:message` - Receive message from AI
  - `chat:typing` - Typing indicator
  - `chat:message:ack` - Message acknowledged

### Backend Services Used

1. **WebsocketGateway** - Handles WebSocket connections
2. **ChatService** - Processes chat messages
3. **VectorSearchService** - Searches document chunks
4. **PineconeService** - Vector database queries

## Usage

### For Users

1. Click the AI Assistant button (robot icon) in the bottom-right corner
2. Type your question in the input field
3. Press Enter or click the send button
4. Wait for AI response (typing indicator will show)
5. Continue the conversation or start a new one

### For Developers

#### Opening Chat Programmatically

```typescript
import { useChatStore } from 'store/chat.store';

function MyComponent() {
  const { openChat } = useChatStore();
  
  return (
    <button onClick={openChat}>
      Ask AI
    </button>
  );
}
```

#### Sending Messages with Context

```typescript
const { sendMessage } = useChatStore();

// Send message with transaction context
sendMessage('What are the key dates?', {
  transactionId: 'txn-123',
  documentIds: ['doc-1', 'doc-2']
});
```

#### Listening to Events

```typescript
import { socketService } from 'services/socket/socket.service';

// Subscribe to custom events
socketService.on('custom:event', (data) => {
  console.log('Custom event:', data);
});

// Unsubscribe
socketService.off('custom:event');
```

## Customization

### Styling

The chat interface uses Material-UI components and inherits your app's theme. To customize:

```typescript
// In ChatWindow.tsx
<Paper
  sx={{
    // Your custom styles
    bgcolor: 'custom.background',
    borderRadius: 3,
  }}
>
```

### Position

To change the floating button position:

```typescript
// In ChatFloatingButton.tsx
<Fab
  sx={{
    position: 'fixed',
    bottom: 24, // Adjust this
    right: 24,  // Adjust this
  }}
>
```

### Welcome Message

Customize the welcome message in `ChatWindow.tsx`:

```typescript
<Typography variant="h6">
  Your Custom Welcome Title
</Typography>
<Typography variant="body2">
  Your custom welcome message
</Typography>
```

### Example Questions

Update suggested questions in `ChatWindow.tsx`:

```typescript
{[
  'Your custom question 1',
  'Your custom question 2',
  'Your custom question 3',
].map((example, index) => (
  <Chip label={example} onClick={() => setInputMessage(example)} />
))}
```

## Troubleshooting

### Connection Issues

**Symptom**: "Offline" status or connection errors

**Solutions**:
1. Check if backend server is running
2. Verify `VITE_SOCKET_URL` environment variable
3. Check browser console for WebSocket errors
4. Ensure you're logged in (WebSocket requires authentication)

### Messages Not Sending

**Symptom**: Messages don't appear or get stuck

**Solutions**:
1. Check WebSocket connection status
2. Verify backend chat processing queue is running
3. Check browser network tab for failed requests
4. Clear localStorage and refresh

### Styling Issues

**Symptom**: Chat looks broken or misaligned

**Solutions**:
1. Check if Material-UI theme is properly loaded
2. Verify z-index conflicts with other components
3. Test on different screen sizes
4. Check browser console for CSS errors

### Clear Chat Data

To reset all conversations:

```typescript
localStorage.removeItem('chat-storage');
window.location.reload();
```

## Performance Considerations

1. **Message History**: Only recent messages are kept in memory
2. **Auto-reconnection**: Limited to 5 attempts to prevent infinite loops
3. **localStorage**: Conversations are persisted but size is limited
4. **Event Cleanup**: All event listeners are cleaned up on unmount

## Security

1. **Authentication**: WebSocket connections require valid Supabase session
2. **Authorization**: Backend validates user permissions per tenant
3. **Rate Limiting**: Backend throttles requests to prevent abuse
4. **Input Sanitization**: All user input is sanitized before processing

## Future Enhancements

- [ ] Voice input/output
- [ ] File attachments
- [ ] Message reactions
- [ ] Conversation search
- [ ] Export conversations
- [ ] Multi-language support
- [ ] Code syntax highlighting in responses
- [ ] Markdown rendering

## Dependencies

- `socket.io-client` - WebSocket client
- `zustand` - State management
- `date-fns` - Date formatting
- `@mui/material` - UI components

## Support

For issues or questions:
1. Check the backend logs for WebSocket/chat errors
2. Review browser console for frontend errors
3. Verify environment variables are set correctly
4. Test WebSocket connection independently

