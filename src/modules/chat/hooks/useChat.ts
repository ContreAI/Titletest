import { useChatStore } from '../store/chat.store';
import { useSocketStore } from 'services/socket/socket.store';

/**
 * Custom hook to access chat store
 * Socket connection state comes from centralized socket store
 */
export const useChat = () => {
  // Chat UI state
  const isOpen = useChatStore((state) => state.isOpen);
  const isTyping = useChatStore((state) => state.isTyping);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const conversations = useChatStore((state) => state.conversations);

  // Socket connection state (from centralized store)
  const isConnected = useSocketStore((state) => state.isConnected);

  // Chat actions
  const toggleChat = useChatStore((state) => state.toggleChat);
  const openChat = useChatStore((state) => state.openChat);
  const closeChat = useChatStore((state) => state.closeChat);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const addMessage = useChatStore((state) => state.addMessage);
  const setTyping = useChatStore((state) => state.setTyping);
  const createConversation = useChatStore((state) => state.createConversation);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const clearCurrentConversation = useChatStore((state) => state.clearCurrentConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const getCurrentConversation = useChatStore((state) => state.getCurrentConversation);

  return {
    // State
    isOpen,
    isTyping,
    isConnected,
    currentConversationId,
    conversations,

    // Actions
    toggleChat,
    openChat,
    closeChat,
    sendMessage,
    addMessage,
    setTyping,
    createConversation,
    setCurrentConversation,
    clearCurrentConversation,
    deleteConversation,
    getCurrentConversation,
  };
};

