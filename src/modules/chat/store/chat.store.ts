/**
 * Chat Store - State Management for AI Assistant
 *
 * Manages chat messages, conversations, and UI state.
 * Socket connection is managed centrally by socket.store.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { socketService, ChatMessage } from 'services/socket/socket.service';
import { useSocketStore } from 'services/socket/socket.store';
import { ChatState, ChatPageContext, isTransactionContext, hasBrokerageFilters, getContextKey } from '../typings/chat.types';

// Default page context
const DEFAULT_PAGE_CONTEXT: ChatPageContext = {
  pageType: 'unknown',
};

// Version for storage migration
// v2: initial persisted structure
// v3: added contextKey to conversations for navigation-based conversation switching
const CHAT_STORAGE_VERSION = 3;

// Track if chat listeners are setup
let chatListenersSetup = false;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial State
      isOpen: false,
      isTyping: false,
      pageContext: DEFAULT_PAGE_CONTEXT,
      currentConversationId: null,
      conversations: [],
      selectedDocumentId: null,
      conversationContextMap: {},

      // UI Actions
      toggleChat: () => {
        const isOpen = !get().isOpen;
        set({ isOpen });

        // Setup listeners when opening chat (socket connection managed centrally)
        if (isOpen) {
          get().setupChatListeners();
        }
      },

      openChat: () => {
        set({ isOpen: true });
        get().setupChatListeners();
      },

      closeChat: () => set({ isOpen: false }),

      setTyping: (isTyping: boolean) => set({ isTyping }),

      // Message Actions
      sendMessage: (message: string, context?: any) => {
        const state = get();

        // Check socket is connected before sending
        const { isConnected } = useSocketStore.getState();
        if (!isConnected) {
          console.error('[Chat] Cannot send message - socket not connected');
          state.addMessage({
            id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            message: 'Cannot send message. Please check your connection and try again.',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            conversationId: state.currentConversationId || undefined,
          });
          return;
        }

        // Create conversation if none exists
        let conversationId = state.currentConversationId;
        if (!conversationId) {
          conversationId = state.createConversation();
        }

        // Add user message to state with unique ID
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          message,
          sender: 'user',
          timestamp: new Date().toISOString(),
          conversationId,
        };
        state.addMessage(userMessage);

        // Build message context with page awareness
        // Context shape determines behavior: transactionId → transaction-scoped, otherwise → brokerage-wide
        const pageContext = state.pageContext;

        // Build context based on interface shape (no mode flag needed)
        const messageContext: Record<string, unknown> = {
          ...context,
          pageType: pageContext.pageType,
        };

        // Transaction-scoped context: include transaction details
        if (isTransactionContext(pageContext)) {
          messageContext.transactionId = pageContext.transactionId;
          if (pageContext.transactionAddress) {
            messageContext.transactionAddress = pageContext.transactionAddress;
          }
          // Document can come from selection, page context, or passed context
          const documentId = state.selectedDocumentId || pageContext.documentId || context?.documentId;
          if (documentId) {
            messageContext.documentId = documentId;
          }
        }
        // Brokerage-scoped context: include any filters
        else if (hasBrokerageFilters(pageContext)) {
          if (pageContext.brokerageId) {
            messageContext.brokerageId = pageContext.brokerageId;
          }
          if (pageContext.transactionStatuses?.length) {
            messageContext.transactionStatuses = pageContext.transactionStatuses;
          }
          if (pageContext.propertyTypes?.length) {
            messageContext.propertyTypes = pageContext.propertyTypes;
          }
          if (pageContext.representation) {
            messageContext.representation = pageContext.representation;
          }
        }
        // No specific context - backend will default to brokerage-wide via auth

        // Send via WebSocket
        try {
          socketService.sendMessage(message, conversationId, messageContext);
          set({ isTyping: true });
        } catch (error) {
          console.error('Failed to send message:', error);
          state.addMessage({
            id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            message: 'Failed to send message. Please try again.',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            conversationId,
          });
        }
      },

      addMessage: (message: ChatMessage) => {
        set((state) => {
          const conversations = [...state.conversations];
          const convIndex = conversations.findIndex(
            (c) => c.id === (message.conversationId || state.currentConversationId)
          );

          if (convIndex >= 0) {
            // Check if message already exists (prevent duplicates)
            const messageExists = conversations[convIndex].messages.some(m => m.id === message.id);
            if (messageExists) {
              console.log('[Chat] Message already exists, skipping:', message.id);
              return { conversations };
            }
            
            conversations[convIndex] = {
              ...conversations[convIndex],
              messages: [...conversations[convIndex].messages, message],
              updatedAt: new Date().toISOString(),
            };
          }

          return { conversations };
        });
      },

      // Document Selection
      setSelectedDocument: (documentId: string | null) => set({ selectedDocumentId: documentId }),

      // Page Context
      setPageContext: (context: ChatPageContext) => {
        const state = get();
        const newContextKey = getContextKey(context);
        const currentContextKey = getContextKey(state.pageContext);

        // If context key changed, switch to appropriate conversation
        if (newContextKey !== currentContextKey) {
          // Look up conversation ID in the context map
          const existingConversationId = state.conversationContextMap[newContextKey];

          if (existingConversationId) {
            // Switch to existing conversation for this context
            set({
              pageContext: context,
              currentConversationId: existingConversationId,
              selectedDocumentId: null, // Clear document selection when switching contexts
            });
          } else {
            // No existing conversation for this context - clear current conversation
            // A new one will be created when the user sends their first message
            set({
              pageContext: context,
              currentConversationId: null,
              selectedDocumentId: null,
            });
          }
        } else {
          // Same context key, just update the context details
          set({ pageContext: context });
        }
      },
      clearPageContext: () => set({ pageContext: DEFAULT_PAGE_CONTEXT }),

      // Conversation Actions
      createConversation: () => {
        const state = get();
        const id = `conv-${Date.now()}`;
        const contextKey = getContextKey(state.pageContext);
        const newConversation = {
          id,
          title: 'New Conversation',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((prev) => ({
          conversations: [newConversation, ...prev.conversations],
          currentConversationId: id,
          // Update the context map to associate this conversation with the current context
          conversationContextMap: {
            ...prev.conversationContextMap,
            [contextKey]: id,
          },
        }));

        return id;
      },

      setCurrentConversation: (id: string) => set({ currentConversationId: id }),

      clearCurrentConversation: () => {
        const state = get();
        if (state.currentConversationId) {
          set((prev) => ({
            conversations: prev.conversations.map((c) =>
              c.id === state.currentConversationId
                ? { ...c, messages: [] }
                : c
            ),
          }));
        }
      },

      deleteConversation: (id: string) => {
        set((state) => {
          // Remove the conversation from the context map
          const updatedContextMap = { ...state.conversationContextMap };
          for (const [key, convId] of Object.entries(updatedContextMap)) {
            if (convId === id) {
              delete updatedContextMap[key];
            }
          }

          return {
            conversations: state.conversations.filter((c) => c.id !== id),
            currentConversationId:
              state.currentConversationId === id ? null : state.currentConversationId,
            conversationContextMap: updatedContextMap,
          };
        });
      },

      // Utilities
      getCurrentConversation: () => {
        const state = get();
        return (
          state.conversations.find((c) => c.id === state.currentConversationId) || null
        );
      },

      // Socket listener setup - called by centralized socket events manager
      setupChatListeners: () => {
        if (chatListenersSetup) {
          console.log('[Chat] Socket listeners already setup, skipping');
          return;
        }
        chatListenersSetup = true;

        console.log('[Chat] Setting up socket listeners');

        // Remove existing listeners first to avoid duplicates
        socketService.off('chat:message');
        socketService.off('chat:typing');

        socketService.on('chat:message', (message: ChatMessage) => {
          get().addMessage(message);
          get().setTyping(false);
        });

        socketService.on('chat:typing', (data: { isTyping: boolean }) => {
          get().setTyping(data.isTyping);
        });

        console.log('[Chat] ✅ Socket listeners setup complete');
      },

      // Remove socket listeners - called on disconnect
      removeChatListeners: () => {
        console.log('[Chat] Removing socket listeners');
        socketService.off('chat:message');
        socketService.off('chat:typing');
        chatListenersSetup = false;
        console.log('[Chat] ✅ Socket listeners removed');
      },
    }),
    {
      name: 'chat-storage',
      version: CHAT_STORAGE_VERSION,
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        conversationContextMap: state.conversationContextMap,
      }),
      migrate: (persistedState: any, version: number) => {
        // v2 -> v3: Initialize conversationContextMap from any legacy contextKey fields
        if (version === 2 && persistedState?.conversations) {
          console.log('[Chat] Migrating v2 -> v3: Creating conversationContextMap');
          const contextMap: Record<string, string> = {};

          // Build map from any existing contextKey fields (legacy), then remove them
          for (const conv of persistedState.conversations) {
            if (conv.contextKey) {
              contextMap[conv.contextKey] = conv.id;
            }
          }

          // Remove contextKey from conversations
          const cleanedConversations = persistedState.conversations.map((conv: any) => {
            const { contextKey, ...rest } = conv;
            return rest;
          });

          return {
            ...persistedState,
            conversations: cleanedConversations,
            conversationContextMap: contextMap,
          };
        }
        // Clear old data if version too old
        if (version < 2) {
          console.log('[Chat] Migrating chat storage, clearing old messages');
          return {
            conversations: [],
            currentConversationId: null,
            conversationContextMap: {},
          };
        }
        return persistedState;
      },
    }
  )
);

