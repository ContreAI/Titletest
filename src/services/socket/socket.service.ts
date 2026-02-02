/**
 * WebSocket Service for Real-time Communication
 *
 * Handles Socket.IO connection with authentication and event management
 */

import { io, Socket } from 'socket.io-client';

// Use environment variable, or derive URL from current page location to avoid mixed content issues
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // Fallback: use same protocol as current page to avoid mixed content
  const protocol = window.location.protocol;
  return `${protocol}//localhost:3001`;
};

const SOCKET_URL = getSocketUrl();

export interface ChatExtractedField {
  field: string;
  value: string;
  source: string;
  section: string;
}

export interface ChatSourceDocument {
  documentId: string;
  documentName: string;
  section?: string;
  score?: number;
}

export interface ChatMessageMetadata {
  /** Whether a guardrail was triggered for this response */
  guardrailTriggered?: boolean;
  /** Type of guardrail triggered */
  guardrailType?: 'legal' | 'financial' | 'tax' | 'negotiation' | 'general';
  /** Legal disclaimers to display */
  disclaimers?: string[];
  /** Source documents referenced in the response */
  sourceDocs?: ChatSourceDocument[];
  /** State context used for the response (e.g., "CA", "TX") */
  stateContext?: string;
  /** Model used for the response */
  model?: string;
  /** Response timing in ms */
  timing?: number;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
  conversationId?: string;
  extractedFields?: ChatExtractedField[];
  /** Enhanced metadata for Transaction IQ responses */
  metadata?: ChatMessageMetadata;
}

export interface TypingIndicator {
  isTyping: boolean;
  conversationId?: string;
}

/**
 * Socket event payload types for type-safe event handling
 */
export interface SocketEventMap {
  // Chat events
  'chat:message': ChatMessage;
  'chat:message:ack': { messageId: string; timestamp: string };
  'chat:typing': { isTyping: boolean };

  // Transaction events
  'transaction:updated': {
    transactionId: string;
    transaction: Record<string, unknown>;
    userId: string;
    timestamp: string;
  };
  'transaction:created': {
    transaction: Record<string, unknown>;
    userId: string;
    timestamp: string;
  };
  'transaction:deleted': {
    transactionId: string;
    userId: string;
    timestamp: string;
  };

  // Document events
  'document:progress': {
    documentId: string;
    transactionId?: string;
    step: string;
    percentage: number;
    message: string;
    timestamp: string;
  };
  'document:updated': {
    documentId: string;
    updates: {
      document_name?: string;
      document_type?: string;
      metadata?: Record<string, unknown>;
      parsed_status?: 'pending' | 'processing' | 'completed' | 'error';
      processing_step?: string | null;
      progress_percentage?: number;
    };
    timestamp: string;
  };
  'document:deleted': {
    documentId: string;
    transactionId: string;
    documentName: string;
    timestamp: string;
  };
  'document:status': unknown;

  // Notification events
  'notification:new': {
    id?: string;
    type?: string;
    title?: string;
    message?: string;
    transactionId?: string;
    documentId?: string;
    [key: string]: unknown;
  };
  'notification:read': { id: string };
  'notification:all-read': void;

  // Report events - use Record<string, unknown> for data to allow flexible typing at consumer
  'report:updated': {
    transactionId: string;
    report: {
      id: string;
      transactionId: string;
      userId?: string;
      status?: string;
      data?: Record<string, unknown>;
      documentCount?: number;
      metadata?: Record<string, unknown>;
      createdAt?: string;
      updatedAt?: string;
    };
    userId: string;
    timestamp: string;
  };
  'report:created': {
    transactionId: string;
    report: {
      id: string;
      transactionId: string;
      userId?: string;
      status?: string;
      data?: Record<string, unknown>;
      documentCount?: number;
      metadata?: Record<string, unknown>;
      createdAt?: string;
      updatedAt?: string;
    };
    userId: string;
    timestamp: string;
  };
  'report:deleted': {
    transactionId: string;
    userId: string;
    timestamp: string;
  };

  // Connection events
  'connected': { socketId: string; [key: string]: unknown };
  'disconnect': string;
  'user:online': { userId: string };
  'user:offline': { userId: string };
}

/** Type-safe event callback */
type TypedEventCallback<T> = (data: T) => void;

/** Generic callback for untyped events */
type GenericEventCallback = (...args: unknown[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers: Map<string, Set<GenericEventCallback>> = new Map();
  private attachedHandlers: Set<GenericEventCallback> = new Set(); // Track which handlers are attached to current socket

  /**
   * Initialize socket connection with authentication
   * Gets Supabase access token and passes it in the handshake auth object
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('✅ Already connected to WebSocket');
      return;
    }

    // Get the current Supabase session for the access token
    // Import supabase lazily to avoid test failures when env vars are missing
    let accessToken: string | null = null;
    try {
      const { supabase } = await import('lib/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        accessToken = session.access_token;
        console.log('🔑 Got Supabase access token for WebSocket auth');
      }
    } catch (error) {
      console.warn('⚠️ Could not get Supabase session:', error);
    }

    console.log('🔌 Connecting to WebSocket at:', SOCKET_URL);

    // Clear attached handlers tracking for new connection
    this.attachedHandlers.clear();

    return new Promise((resolve, reject) => {
      let isResolved = false;

      // Connection timeout - if server doesn't respond within 15 seconds, reject
      const connectionTimeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          console.error('❌ WebSocket connection timeout');
          reject(new Error('Connection timeout - server did not respond'));
        }
      }, 15000);

      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true, // Include cookies for auth (fallback)
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        autoConnect: true,
        // Pass access token in handshake auth for cross-origin scenarios
        auth: accessToken ? { token: accessToken } : undefined,
      });

      // Connection successful - server confirmed authentication
      this.socket.on('connected', (data) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(connectionTimeout);

        console.log('✅ WebSocket connected:', data);
        this.reconnectAttempts = 0;

        // Attach all registered event handlers to the socket
        this.attachEventHandlers();

        resolve();
      });

      // Also attach handlers on 'connect' event (Socket.IO standard)
      // Note: We MUST NOT call attachEventHandlers() here because it would remove
      // the 'connected' handler that's waiting to resolve this Promise.
      // Instead, attachEventHandlers() is called in the 'connected' handler above
      // after the Promise is resolved.
      this.socket.on('connect', () => {
        console.log('✅ Socket.IO connected');
        // Handlers will be attached when 'connected' event is received
      });

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts && !isResolved) {
          isResolved = true;
          clearTimeout(connectionTimeout);
          reject(new Error('Failed to connect to WebSocket server'));
        }
      });

      // Authentication or other error from server
      this.socket.on('error', (error: { code?: string; message?: string }) => {
        console.error('❌ WebSocket error:', error);
        if (!isResolved) {
          isResolved = true;
          clearTimeout(connectionTimeout);
          reject(new Error(error.message || 'WebSocket error'));
        }
      });

      // Reconnection
      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
        this.reconnectAttempts = 0;
        this.attachEventHandlers();
      });

      // Disconnect during initial connection attempt means auth failed
      this.socket.on('disconnect', (reason) => {
        console.log('⚠️  WebSocket disconnected:', reason);
        // If disconnected before connected event was received, treat as connection failure
        if (!isResolved && reason !== 'io client disconnect') {
          isResolved = true;
          clearTimeout(connectionTimeout);
          reject(new Error(`Connection failed: ${reason}`));
        }
      });

      // Setup default event handlers
      this.setupDefaultHandlers();
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventHandlers.clear();
      this.attachedHandlers.clear(); // Clear attached handlers tracking
      console.log('🔌 WebSocket disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Send chat message
   */
  sendMessage(message: string, conversationId?: string, context?: any): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('chat:send', {
      message,
      conversationId,
      context,
    });

    console.log('📤 Message sent:', message.substring(0, 50) + '...');
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;

    this.socket.emit('chat:typing', {
      conversationId,
      isTyping,
    });
  }

  /**
   * Subscribe to a typed event
   * @example
   * socketService.on('chat:message', (message) => {
   *   // message is typed as ChatMessage
   * });
   */
  on<K extends keyof SocketEventMap>(
    event: K,
    callback: TypedEventCallback<SocketEventMap[K]>,
  ): void;
  /**
   * Subscribe to an untyped event (for custom/dynamic events)
   */
  on(event: string, callback: GenericEventCallback): void;
  on(event: string, callback: GenericEventCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);

    // Attach listener to socket if it exists and not already attached
    if (this.socket && !this.attachedHandlers.has(callback)) {
      this.socket.on(event, callback as Parameters<Socket['on']>[1]);
      this.attachedHandlers.add(callback);
    }
    // If socket doesn't exist yet, the handler will be attached when socket connects
  }

  /**
   * Unsubscribe from a typed event
   */
  off<K extends keyof SocketEventMap>(
    event: K,
    callback?: TypedEventCallback<SocketEventMap[K]>,
  ): void;
  /**
   * Unsubscribe from an untyped event
   */
  off(event: string, callback?: GenericEventCallback): void;
  off(event: string, callback?: GenericEventCallback): void {
    if (callback) {
      this.eventHandlers.get(event)?.delete(callback);
      this.attachedHandlers.delete(callback); // Remove from tracking
      if (this.socket) {
        this.socket.off(event, callback as Parameters<Socket['off']>[1]);
      }
    } else {
      // Remove all callbacks for this event from tracking
      const callbacks = this.eventHandlers.get(event);
      if (callbacks) {
        callbacks.forEach((cb) => this.attachedHandlers.delete(cb));
      }
      this.eventHandlers.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  /**
   * Attach all registered event handlers to the socket.
   * Uses additive approach to avoid removing handlers set up during connect().
   * Tracks attached handlers to prevent duplicates on reconnection.
   */
  private attachEventHandlers(): void {
    if (!this.socket) return;

    this.eventHandlers.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        // Only attach if not already attached to current socket
        if (!this.attachedHandlers.has(callback)) {
          this.socket!.on(event, callback as Parameters<Socket['on']>[1]);
          this.attachedHandlers.add(callback);
        }
      });
    });
  }

  /**
   * Setup default event handlers
   */
  private setupDefaultHandlers(): void {
    if (!this.socket) return;

    // Chat message received
    this.socket.on('chat:message', (data: ChatMessage) => {
      console.log('📨 Message received from AI:', data);
    });

    // Message acknowledged
    this.socket.on('chat:message:ack', (data) => {
      console.log('✅ Message acknowledged:', data);
    });

    // Typing indicator
    this.socket.on('chat:typing', (data: TypingIndicator) => {
      console.log('⌨️  Typing indicator:', data);
    });

    // User online/offline
    this.socket.on('user:online', (data) => {
      console.log('👤 User online:', data);
    });

    this.socket.on('user:offline', (data) => {
      console.log('👤 User offline:', data);
    });
  }

  /**
   * Get socket instance (use with caution)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
