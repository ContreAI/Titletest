/**
 * Socket Store - Centralized WebSocket Connection Management
 *
 * Single source of truth for socket connection state.
 * Handles auth-aware connection lifecycle automatically.
 *
 * Usage:
 * - Components subscribe to connection state via useSocketStore()
 * - Auth changes trigger automatic connect/disconnect
 * - No need to manually call connect() - use initializeSocket() once at app level
 */

import { create } from 'zustand';
import { socketService } from './socket.service';
import { useAuthStore } from 'modules/auth/store/auth.store';
import { initializeSocketEventListeners, removeSocketEventListeners } from './socket.events';

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnectedAt: string | null;
}

interface SocketActions {
  /**
   * Connect to socket server (only if authenticated)
   * Called automatically by auth subscription - rarely needed manually
   */
  connect: () => Promise<void>;

  /**
   * Disconnect from socket server
   */
  disconnect: () => void;

  /**
   * Initialize socket with auth subscription
   * Call once at app startup (e.g., in App.tsx)
   */
  initializeSocket: () => () => void;
}

type SocketStore = SocketState & SocketActions;

// Track if we've set up the auth subscription
let authUnsubscribe: (() => void) | null = null;

// Track socket event listener callbacks for cleanup
let disconnectHandler: (() => void) | null = null;
let connectedHandler: (() => void) | null = null;

export const useSocketStore = create<SocketStore>()((set, get) => ({
  // State
  isConnected: false,
  isConnecting: false,
  error: null,
  lastConnectedAt: null,

  // Actions
  connect: async () => {
    const { isConnecting, isConnected } = get();

    // Prevent duplicate connection attempts
    if (isConnecting || isConnected) {
      return;
    }

    // Check auth state before connecting
    const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore.getState();
    if (isAuthLoading || !isAuthenticated) {
      console.log('[Socket] Skipping connect - not authenticated');
      return;
    }

    set({ isConnecting: true, error: null });

    try {
      await socketService.connect();

      // socketService.connect() resolves when the server's 'connected' event is received,
      // which confirms successful authentication. Set isConnected immediately.
      set({
        isConnected: true,
        isConnecting: false,
        lastConnectedAt: new Date().toISOString(),
      });
      console.log('[Socket] Connected and authenticated successfully');

      // Initialize all socket event listeners after successful connection
      initializeSocketEventListeners();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      set({
        isConnected: false,
        isConnecting: false,
        error: errorMessage,
      });
      console.error('[Socket] Connection failed:', errorMessage);
    }
  },

  disconnect: () => {
    // Remove all socket event listeners before disconnecting
    removeSocketEventListeners();

    socketService.disconnect();
    set({
      isConnected: false,
      isConnecting: false,
      error: null,
    });
    console.log('[Socket] Disconnected');
  },

  initializeSocket: () => {
    // Prevent duplicate subscriptions
    if (authUnsubscribe) {
      return authUnsubscribe;
    }

    console.log('[Socket] Initializing with auth subscription');

    // Subscribe to auth state changes
    // Check initial state first
    const { isAuthenticated, isLoading } = useAuthStore.getState();
    if (!isLoading && isAuthenticated) {
      get().connect();
    }

    // Then subscribe to future changes
    authUnsubscribe = useAuthStore.subscribe((state) => {
      if (state.isLoading) {
        // Auth still loading, wait
        return;
      }

      if (state.isAuthenticated) {
        // User authenticated, connect socket
        get().connect();
      } else {
        // User logged out, disconnect socket
        get().disconnect();
      }
    });

    // Sync socket service events with store state
    disconnectHandler = () => {
      set({ isConnected: false });
    };
    connectedHandler = () => {
      set({ isConnected: true, isConnecting: false });
    };

    socketService.on('disconnect', disconnectHandler);
    socketService.on('connected', connectedHandler);

    // Return cleanup function
    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
        authUnsubscribe = null;
      }
      if (disconnectHandler) {
        socketService.off('disconnect', disconnectHandler);
        disconnectHandler = null;
      }
      if (connectedHandler) {
        socketService.off('connected', connectedHandler);
        connectedHandler = null;
      }
      get().disconnect();
    };
  },
}));

/**
 * Hook to ensure socket is connected before performing socket operations
 * Returns true when socket is ready to use
 */
export const useSocketReady = (): boolean => {
  const isConnected = useSocketStore((state) => state.isConnected);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isConnected && isAuthenticated;
};
