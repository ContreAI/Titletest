import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useChatStore } from '../store/chat.store';
import { isTransactionContext, TransactionChatContext, getContextKey } from '../typings/chat.types';

// Mock socket service
vi.mock('services/socket/socket.service', () => ({
  socketService: {
    on: vi.fn(),
    off: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

// Mock socket store
vi.mock('services/socket/socket.store', () => ({
  useSocketStore: {
    getState: vi.fn(() => ({
      isConnected: true,
    })),
  },
}));

describe('Chat Store', () => {
  beforeEach(() => {
    // Reset store state - manually reset since persist middleware complicates setState
    useChatStore.setState({
      isOpen: false,
      isTyping: false,
      pageContext: { pageType: 'unknown' },
      currentConversationId: null,
      conversations: [],
      selectedDocumentId: null,
      conversationContextMap: {},
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useChatStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.isTyping).toBe(false);
      expect(state.pageContext.pageType).toBe('unknown');
      expect(state.currentConversationId).toBeNull();
      expect(state.conversations).toEqual([]);
      expect(state.selectedDocumentId).toBeNull();
    });
  });

  describe('toggleChat', () => {
    it('should toggle chat open state', () => {
      expect(useChatStore.getState().isOpen).toBe(false);

      useChatStore.getState().toggleChat();
      expect(useChatStore.getState().isOpen).toBe(true);

      useChatStore.getState().toggleChat();
      expect(useChatStore.getState().isOpen).toBe(false);
    });
  });

  describe('openChat', () => {
    it('should open chat', () => {
      useChatStore.getState().openChat();
      expect(useChatStore.getState().isOpen).toBe(true);
    });
  });

  describe('closeChat', () => {
    it('should close chat', () => {
      useChatStore.setState({ isOpen: true });
      useChatStore.getState().closeChat();
      expect(useChatStore.getState().isOpen).toBe(false);
    });
  });

  describe('setTyping', () => {
    it('should set typing state to true', () => {
      useChatStore.getState().setTyping(true);
      expect(useChatStore.getState().isTyping).toBe(true);
    });

    it('should set typing state to false', () => {
      useChatStore.setState({ isTyping: true });
      useChatStore.getState().setTyping(false);
      expect(useChatStore.getState().isTyping).toBe(false);
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', () => {
      const convId = useChatStore.getState().createConversation();

      expect(convId).toMatch(/^conv-\d+$/);
      expect(useChatStore.getState().conversations).toHaveLength(1);
      expect(useChatStore.getState().currentConversationId).toBe(convId);
    });

    it('should prepend new conversation to list', () => {
      const existingConv = {
        id: 'existing-conv',
        title: 'Existing',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({ conversations: [existingConv] });

      const newConvId = useChatStore.getState().createConversation();

      expect(useChatStore.getState().conversations).toHaveLength(2);
      expect(useChatStore.getState().conversations[0].id).toBe(newConvId);
    });

    it('should associate conversation with brokerage context by default', () => {
      useChatStore.setState({
        pageContext: { pageType: 'dashboard' },
      });

      const convId = useChatStore.getState().createConversation();

      // Context map should associate conversation with brokerage
      expect(useChatStore.getState().conversationContextMap['brokerage']).toBe(convId);
    });

    it('should associate conversation with transaction context when on transaction page', () => {
      useChatStore.setState({
        pageContext: {
          pageType: 'transaction-detail',
          transactionId: 'txn-abc-123',
        } as TransactionChatContext,
      });

      const convId = useChatStore.getState().createConversation();

      // Context map should associate conversation with transaction
      expect(useChatStore.getState().conversationContextMap['transaction:txn-abc-123']).toBe(convId);
    });
  });

  describe('getContextKey', () => {
    it('should return brokerage for non-transaction contexts', () => {
      expect(getContextKey({ pageType: 'dashboard' })).toBe('brokerage');
      expect(getContextKey({ pageType: 'transactions-list' })).toBe('brokerage');
      expect(getContextKey({ pageType: 'unknown' })).toBe('brokerage');
    });

    it('should return transaction key for transaction contexts', () => {
      const context: TransactionChatContext = {
        pageType: 'transaction-detail',
        transactionId: 'txn-123',
      };
      expect(getContextKey(context)).toBe('transaction:txn-123');
    });
  });

  describe('setCurrentConversation', () => {
    it('should set current conversation ID', () => {
      useChatStore.getState().setCurrentConversation('conv-123');
      expect(useChatStore.getState().currentConversationId).toBe('conv-123');
    });
  });

  describe('clearCurrentConversation', () => {
    it('should clear messages from current conversation', () => {
      const conv = {
        id: 'conv-1',
        title: 'Test',
        messages: [
          { id: 'msg-1', message: 'Hello', sender: 'user' as const, timestamp: new Date().toISOString() },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
      });

      useChatStore.getState().clearCurrentConversation();

      expect(useChatStore.getState().conversations[0].messages).toEqual([]);
    });

    it('should not affect other conversations', () => {
      const conv1 = {
        id: 'conv-1',
        title: 'Conv 1',
        messages: [{ id: 'msg-1', message: 'Hello', sender: 'user' as const, timestamp: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const conv2 = {
        id: 'conv-2',
        title: 'Conv 2',
        messages: [{ id: 'msg-2', message: 'World', sender: 'user' as const, timestamp: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv1, conv2],
        currentConversationId: 'conv-1',
      });

      useChatStore.getState().clearCurrentConversation();

      expect(useChatStore.getState().conversations[0].messages).toEqual([]);
      expect(useChatStore.getState().conversations[1].messages).toHaveLength(1);
    });

    it('should do nothing if no current conversation', () => {
      useChatStore.setState({ currentConversationId: null, conversations: [] });
      useChatStore.getState().clearCurrentConversation();
      // Should not throw
      expect(useChatStore.getState().conversations).toEqual([]);
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', () => {
      const conv = {
        id: 'conv-to-delete',
        title: 'Delete me',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({ conversations: [conv] });

      useChatStore.getState().deleteConversation('conv-to-delete');

      expect(useChatStore.getState().conversations).toEqual([]);
    });

    it('should clear currentConversationId if deleting current', () => {
      const conv = {
        id: 'conv-1',
        title: 'Current',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
      });

      useChatStore.getState().deleteConversation('conv-1');

      expect(useChatStore.getState().currentConversationId).toBeNull();
    });

    it('should not affect currentConversationId if deleting different conversation', () => {
      const conv1 = {
        id: 'conv-1',
        title: 'Conv 1',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const conv2 = {
        id: 'conv-2',
        title: 'Conv 2',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv1, conv2],
        currentConversationId: 'conv-1',
      });

      useChatStore.getState().deleteConversation('conv-2');

      expect(useChatStore.getState().currentConversationId).toBe('conv-1');
    });

    it('should remove conversation from context map when deleted', () => {
      const conv = {
        id: 'conv-1',
        title: 'Conv 1',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        conversationContextMap: {
          'brokerage': 'conv-1',
        },
      });

      useChatStore.getState().deleteConversation('conv-1');

      expect(useChatStore.getState().conversationContextMap['brokerage']).toBeUndefined();
    });
  });

  describe('addMessage', () => {
    it('should add message to current conversation', () => {
      const conv = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
      });

      const newMessage = {
        id: 'msg-1',
        message: 'Hello',
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
        conversationId: 'conv-1',
      };

      useChatStore.getState().addMessage(newMessage);

      expect(useChatStore.getState().conversations[0].messages).toHaveLength(1);
      expect(useChatStore.getState().conversations[0].messages[0].message).toBe('Hello');
    });

    it('should prevent duplicate messages', () => {
      const existingMessage = {
        id: 'msg-1',
        message: 'Hello',
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
      };
      const conv = {
        id: 'conv-1',
        title: 'Test',
        messages: [existingMessage],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
      });

      // Try to add same message again
      useChatStore.getState().addMessage({ ...existingMessage, conversationId: 'conv-1' });

      expect(useChatStore.getState().conversations[0].messages).toHaveLength(1);
    });

    it('should update conversation updatedAt timestamp', () => {
      const oldDate = '2024-01-01T00:00:00Z';
      const conv = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: oldDate,
        updatedAt: oldDate,
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
      });

      useChatStore.getState().addMessage({
        id: 'msg-1',
        message: 'Hello',
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
        conversationId: 'conv-1',
      });

      expect(useChatStore.getState().conversations[0].updatedAt).not.toBe(oldDate);
    });
  });

  describe('setSelectedDocument', () => {
    it('should set selected document ID', () => {
      useChatStore.getState().setSelectedDocument('doc-123');
      expect(useChatStore.getState().selectedDocumentId).toBe('doc-123');
    });

    it('should clear selected document ID', () => {
      useChatStore.setState({ selectedDocumentId: 'doc-123' });
      useChatStore.getState().setSelectedDocument(null);
      expect(useChatStore.getState().selectedDocumentId).toBeNull();
    });
  });

  describe('setPageContext', () => {
    it('should set page context', () => {
      const context = {
        pageType: 'transaction-detail' as const,
        transactionId: 'txn-123',
        transactionAddress: '123 Main St',
      };

      useChatStore.getState().setPageContext(context);

      const pageContext = useChatStore.getState().pageContext;
      expect(pageContext.pageType).toBe('transaction-detail');
      expect(isTransactionContext(pageContext)).toBe(true);
      if (isTransactionContext(pageContext)) {
        expect(pageContext.transactionId).toBe('txn-123');
      }
    });

    it('should switch to existing conversation when context changes', () => {
      // Setup: Create conversations
      const brokerageConv = {
        id: 'conv-brokerage',
        title: 'Brokerage Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const transactionConv = {
        id: 'conv-txn-123',
        title: 'Transaction Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [brokerageConv, transactionConv],
        currentConversationId: 'conv-txn-123',
        pageContext: {
          pageType: 'transaction-detail',
          transactionId: 'txn-123',
        } as TransactionChatContext,
        // Use context map instead of contextKey on conversations
        conversationContextMap: {
          'brokerage': 'conv-brokerage',
          'transaction:txn-123': 'conv-txn-123',
        },
      });

      // Navigate to brokerage level (e.g., transactions list)
      useChatStore.getState().setPageContext({
        pageType: 'transactions-list',
      });

      // Should switch to brokerage conversation
      expect(useChatStore.getState().currentConversationId).toBe('conv-brokerage');
    });

    it('should clear conversation when navigating to context with no existing conversation', () => {
      // Setup: Only have a brokerage-level conversation
      const brokerageConv = {
        id: 'conv-brokerage',
        title: 'Brokerage Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [brokerageConv],
        currentConversationId: 'conv-brokerage',
        pageContext: { pageType: 'transactions-list' },
        conversationContextMap: {
          'brokerage': 'conv-brokerage',
        },
      });

      // Navigate to a transaction (no existing conversation for it)
      useChatStore.getState().setPageContext({
        pageType: 'transaction-detail',
        transactionId: 'txn-new',
      } as TransactionChatContext);

      // Should clear current conversation
      expect(useChatStore.getState().currentConversationId).toBeNull();
    });

    it('should not change conversation when navigating within same context', () => {
      // Setup: On a transaction detail page
      const transactionConv = {
        id: 'conv-txn-123',
        title: 'Transaction Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [transactionConv],
        currentConversationId: 'conv-txn-123',
        pageContext: {
          pageType: 'transaction-detail',
          transactionId: 'txn-123',
        } as TransactionChatContext,
        conversationContextMap: {
          'transaction:txn-123': 'conv-txn-123',
        },
      });

      // Update context with same transaction (e.g., document selection change)
      useChatStore.getState().setPageContext({
        pageType: 'transaction-detail',
        transactionId: 'txn-123',
        documentId: 'doc-456',
      } as TransactionChatContext);

      // Conversation should stay the same
      expect(useChatStore.getState().currentConversationId).toBe('conv-txn-123');
    });

    it('should clear selected document when switching contexts', () => {
      useChatStore.setState({
        conversations: [],
        currentConversationId: null,
        selectedDocumentId: 'doc-123',
        pageContext: {
          pageType: 'transaction-detail',
          transactionId: 'txn-123',
        } as TransactionChatContext,
      });

      // Navigate to brokerage level
      useChatStore.getState().setPageContext({
        pageType: 'transactions-list',
      });

      // Should clear selected document
      expect(useChatStore.getState().selectedDocumentId).toBeNull();
    });
  });

  describe('clearPageContext', () => {
    it('should reset page context to default', () => {
      useChatStore.setState({
        pageContext: {
          pageType: 'transaction-detail',
          transactionId: 'txn-123',
        } as TransactionChatContext,
      });

      useChatStore.getState().clearPageContext();

      const pageContext = useChatStore.getState().pageContext;
      expect(pageContext.pageType).toBe('unknown');
      expect(isTransactionContext(pageContext)).toBe(false);
    });
  });

  describe('getCurrentConversation', () => {
    it('should return current conversation', () => {
      const conv = {
        id: 'conv-1',
        title: 'Current',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
      });

      const result = useChatStore.getState().getCurrentConversation();

      expect(result).not.toBeNull();
      expect(result?.id).toBe('conv-1');
    });

    it('should return null if no current conversation', () => {
      useChatStore.setState({
        conversations: [],
        currentConversationId: null,
      });

      const result = useChatStore.getState().getCurrentConversation();

      expect(result).toBeNull();
    });

    it('should return null if current ID not found', () => {
      useChatStore.setState({
        conversations: [],
        currentConversationId: 'non-existent',
      });

      const result = useChatStore.getState().getCurrentConversation();

      expect(result).toBeNull();
    });
  });

  describe('sendMessage', () => {
    it('should create conversation if none exists', async () => {
      const { socketService } = await import('services/socket/socket.service');

      useChatStore.setState({
        conversations: [],
        currentConversationId: null,
      });

      useChatStore.getState().sendMessage('Hello');

      expect(useChatStore.getState().conversations).toHaveLength(1);
      expect(socketService.sendMessage).toHaveBeenCalled();
    });

    it('should add user message to conversation', async () => {
      const conv = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
      });

      useChatStore.getState().sendMessage('Hello AI');

      const messages = useChatStore.getState().conversations[0].messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Hello AI');
      expect(messages[0].sender).toBe('user');
    });

    it('should set typing state to true after sending', async () => {
      const conv = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
      });

      useChatStore.getState().sendMessage('Hello');

      expect(useChatStore.getState().isTyping).toBe(true);
    });

    it('should add error message when socket is not connected', async () => {
      const { useSocketStore } = await import('services/socket/socket.store');
      vi.mocked(useSocketStore.getState).mockReturnValue({ isConnected: false } as any);

      const conv = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
      });

      useChatStore.getState().sendMessage('Hello');

      const messages = useChatStore.getState().conversations[0].messages;
      expect(messages[0].sender).toBe('ai');
      expect(messages[0].message).toContain('Cannot send message');
    });

    it('should include page context in message', async () => {
      const { socketService } = await import('services/socket/socket.service');
      const { useSocketStore } = await import('services/socket/socket.store');
      vi.mocked(useSocketStore.getState).mockReturnValue({ isConnected: true } as any);

      const conv = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useChatStore.setState({
        conversations: [conv],
        currentConversationId: 'conv-1',
        pageContext: {
          pageType: 'transaction-detail',
          transactionId: 'txn-123',
        },
      });

      useChatStore.getState().sendMessage('What is this transaction?');

      expect(socketService.sendMessage).toHaveBeenCalledWith(
        'What is this transaction?',
        'conv-1',
        expect.objectContaining({
          pageType: 'transaction-detail',
          transactionId: 'txn-123',
        })
      );
    });
  });
});
