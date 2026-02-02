# AI Assistant Components

This directory contains all the components for the AI Assistant chat feature.

## Components

### `index.tsx`
Main export that combines ChatFloatingButton and ChatWindow.

**Usage:**
```tsx
import AIAssistant from 'components/ai-assistant';

function App() {
  return (
    <>
      {/* Your app content */}
      <AIAssistant />
    </>
  );
}
```

### `ChatFloatingButton.tsx`
Floating action button that opens the chat window.

**Features:**
- Shows/hides based on chat window state
- Connection status badge (green dot when online)
- Tooltip on hover
- Fixed position at bottom-right

**Customization:**
```tsx
// Change position
sx={{
  bottom: 32,  // Distance from bottom
  right: 32,   // Distance from right
}}

// Change icon
<IconifyIcon icon="your:icon" />

// Change color
<Fab color="secondary">
```

### `ChatWindow.tsx`
Main chat interface with messages, input, and controls.

**Features:**
- Message display area with auto-scroll
- Input field with send button
- Connection status indicator
- Welcome message for empty state
- Example question chips
- Clear conversation button
- Typing indicator
- Responsive design

**Customization:**
```tsx
// Change size
sx={{
  width: { xs: '100%', sm: 500 },
  height: { xs: '100vh', sm: 700 },
}}

// Modify welcome message
<Typography>Your custom message</Typography>

// Change example questions
const examples = [
  'Custom question 1',
  'Custom question 2',
];
```

### `ChatMessage.tsx`
Individual message component for user and AI messages.

**Features:**
- Different styling for user vs AI
- Avatar icons
- Timestamps
- Word wrapping
- Responsive layout

**Props:**
```typescript
interface ChatMessageProps {
  message: ChatMessage;  // Message object from store
}
```

## State Management

All components use the `chat.store.ts` Zustand store:

```tsx
import { useChatStore } from 'modules/chat';

// Available state and actions
const {
  isOpen,           // Chat window open/closed
  isTyping,         // AI typing indicator
  isConnected,      // WebSocket connection status
  openChat,         // Open chat window
  closeChat,        // Close chat window
  toggleChat,       // Toggle chat window
  sendMessage,      // Send a message
  connect,          // Connect to WebSocket
  disconnect,       // Disconnect from WebSocket
} = useChatStore();
```

## Styling

All components use Material-UI and inherit your app's theme.

**Theme Integration:**
- `primary.main` - Chat header, AI messages
- `secondary.main` - User messages
- `background.neutral` - Message area background
- `text.primary` - Message text
- `divider` - Separators

## Dependencies

- `@mui/material` - UI components
- `components/base/IconifyIcon` - Icon component
- `store/chat.store` - State management
- `services/socket/socket.service` - WebSocket connection
- `date-fns` - Date formatting

## Events

Components respond to these store events:

| Event | Description |
|-------|-------------|
| `chat:message` | New message received |
| `chat:typing` | Typing indicator changed |
| `connected` | WebSocket connected |
| `disconnect` | WebSocket disconnected |

## Accessibility

- All buttons have `aria-label`
- Keyboard navigation supported (Enter to send)
- Screen reader friendly
- Focus management
- Color contrast compliant

## Mobile Support

All components are fully responsive:

- **Small screens**: Chat takes full screen
- **Large screens**: Chat is a fixed-size window
- **Touch support**: All interactions work on touch
- **Landscape mode**: Adapts to orientation

## Performance

- Auto-scroll optimized with refs
- Event listeners cleaned up on unmount
- Messages virtualized for large conversations
- Debounced typing indicators
- Optimized re-renders with Zustand

## Testing

Example test scenarios:

```tsx
// Open/close chat
const { openChat, closeChat } = useChatStore();
openChat();
expect(isOpen).toBe(true);

// Send message
sendMessage('Hello');
expect(messages).toContain('Hello');

// Connection status
expect(isConnected).toBe(true);
```

## Troubleshooting

**Chat won't open:**
- Check if AIAssistant is imported in App.tsx
- Verify store is initialized

**Messages not appearing:**
- Check WebSocket connection
- Review browser console for errors
- Verify backend is running

**Styling issues:**
- Check MUI theme is loaded
- Verify z-index conflicts
- Test on different screen sizes

## Future Enhancements

Planned features:

- [ ] Voice input
- [ ] File attachments
- [ ] Message search
- [ ] Export conversation
- [ ] Markdown rendering
- [ ] Code syntax highlighting
- [ ] Message reactions
- [ ] Multiple conversations UI

