import { ChatMessage } from 'services/socket/socket.service';

/**
 * Context key used to associate conversations with their scope.
 * - 'brokerage' for brokerage-level conversations
 * - 'transaction:{transactionId}' for transaction-specific conversations
 */
export type ConversationContextKey = string;

/**
 * Maps context keys to conversation IDs.
 * Keeps conversation association logic separate from the Conversation data model.
 */
export type ConversationContextMap = Record<ConversationContextKey, string>;

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Page context types for chat awareness
 */
export type ChatPageType =
  | 'dashboard'           // Broker-level overview
  | 'transaction-detail'  // Specific transaction
  | 'transactions-list'   // Transaction list/search
  | 'documents'           // Documents page
  | 'settings'            // Settings pages
  | 'unknown';            // Fallback

/**
 * Transaction-scoped chat context
 * When transactionId is present, chat searches within that transaction
 */
export interface TransactionChatContext {
  pageType: ChatPageType;
  transactionId: string;
  transactionAddress?: string;
  documentId?: string;
  documentName?: string;
}

/**
 * Brokerage-scoped chat context
 * When brokerageId is present (without transactionId), chat searches across all transactions
 */
export interface BrokerageChatContext {
  pageType: ChatPageType;
  brokerageId?: string; // Optional - can be inferred from auth
  transactionStatuses?: string[];
  propertyTypes?: string[];
  representation?: string;
}

/**
 * Context about the current page for chat awareness
 * The shape of the context determines behavior:
 * - transactionId present → transaction-scoped search
 * - no transactionId → brokerage-wide search
 */
export type ChatPageContext = TransactionChatContext | BrokerageChatContext | { pageType: ChatPageType };

/** Type guard to check if context is transaction-scoped */
export function isTransactionContext(context: ChatPageContext): context is TransactionChatContext {
  return 'transactionId' in context && !!context.transactionId;
}

/** Type guard to check if context has brokerage filters */
export function hasBrokerageFilters(context: ChatPageContext): context is BrokerageChatContext {
  return 'brokerageId' in context || 'transactionStatuses' in context ||
         'propertyTypes' in context || 'representation' in context;
}

/** Generate a context key from page context for conversation association */
export function getContextKey(context: ChatPageContext): ConversationContextKey {
  if (isTransactionContext(context)) {
    return `transaction:${context.transactionId}`;
  }
  return 'brokerage';
}

/**
 * Transaction summary for brokerage-wide responses
 */
export interface TransactionSummary {
  id: string;
  transactionName: string;
  propertyAddress: string;
  status: string;
  representation: string;
  estimatedClosingDate?: string;
  offerPrice?: number;
}

/**
 * Extended chat message with brokerage context
 */
export interface BrokerageChatMessage extends ChatMessage {
  referencedTransactions?: TransactionSummary[];
  transactionsSearched?: number;
}

export interface ChatState {
  // UI State
  isOpen: boolean;
  isTyping: boolean;

  // Page Context
  pageContext: ChatPageContext;

  // Chat State
  currentConversationId: string | null;
  conversations: Conversation[];
  selectedDocumentId: string | null;

  // Context-to-conversation mapping (separate from conversation data)
  conversationContextMap: ConversationContextMap;

  // Actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;

  // Messages
  sendMessage: (message: string, context?: any) => void;
  addMessage: (message: ChatMessage) => void;
  setTyping: (isTyping: boolean) => void;

  // Document Selection
  setSelectedDocument: (documentId: string | null) => void;

  // Page Context
  setPageContext: (context: ChatPageContext) => void;
  clearPageContext: () => void;

  // Conversations
  createConversation: () => string;
  setCurrentConversation: (id: string) => void;
  clearCurrentConversation: () => void;
  deleteConversation: (id: string) => void;

  // Utilities
  getCurrentConversation: () => Conversation | null;

  // Socket listener setup/teardown
  setupChatListeners: () => void;
  removeChatListeners: () => void;
}

