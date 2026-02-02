/**
 * Socket Events Manager
 *
 * Centralized initialization of all WebSocket event listeners.
 * Called once when socket connects (via socket.store.ts).
 *
 * This ensures all stores receive real-time updates regardless of which page the user is on.
 */

import { useDocumentsStore } from 'modules/documents/store/documents.store';
import { useNotificationStore } from 'modules/notifications/store/notification.store';
import { useTransactionsStore } from 'modules/transactions/store/transactions.store';
import { useTransactionReportsStore } from 'modules/transaction-reports/store/transaction-reports.store';
import { useChatStore } from 'modules/chat/store/chat.store';

// Track if listeners have been set up to avoid duplicates
let listenersInitialized = false;

/**
 * Initialize all socket event listeners for the application.
 * Should be called once when socket connects.
 */
export function initializeSocketEventListeners(): void {
  if (listenersInitialized) {
    console.log('[SocketEvents] Listeners already initialized, skipping');
    return;
  }

  console.log('[SocketEvents] Initializing all socket event listeners...');

  // Initialize document processing listeners
  useDocumentsStore.getState().setupSocketListeners();

  // Initialize notification listeners
  useNotificationStore.getState().setupSocketListeners();

  // Initialize transaction listeners
  useTransactionsStore.getState().setupSocketListeners();

  // Initialize transaction report listeners (for timeline/deal status updates)
  useTransactionReportsStore.getState().setupSocketListeners();

  // Initialize chat listeners
  useChatStore.getState().setupChatListeners();

  listenersInitialized = true;
  console.log('[SocketEvents] ✅ All socket event listeners initialized');
}

/**
 * Remove all socket event listeners.
 * Should be called when socket disconnects or app unmounts.
 * Uses store methods to ensure proper cleanup and flag resets.
 */
export function removeSocketEventListeners(): void {
  if (!listenersInitialized) {
    return;
  }

  console.log('[SocketEvents] Removing all socket event listeners...');

  // Remove document listeners via store method
  useDocumentsStore.getState().removeSocketListeners();

  // Remove notification listeners via store method
  useNotificationStore.getState().removeSocketListeners();

  // Remove transaction listeners via store method
  useTransactionsStore.getState().removeSocketListeners();

  // Remove transaction report listeners via store method
  useTransactionReportsStore.getState().removeSocketListeners();

  // Remove chat listeners via store method (resets chatListenersSetup flag)
  useChatStore.getState().removeChatListeners();

  listenersInitialized = false;
  console.log('[SocketEvents] ✅ All socket event listeners removed');
}

/**
 * Check if socket event listeners are initialized.
 */
export function areSocketListenersInitialized(): boolean {
  return listenersInitialized;
}

/**
 * Re-initialize socket listeners.
 * Useful after reconnection.
 */
export function reinitializeSocketEventListeners(): void {
  listenersInitialized = false;
  initializeSocketEventListeners();
}

