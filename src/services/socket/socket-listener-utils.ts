/**
 * Socket Listener Utilities
 *
 * Provides helpers for setting up and tearing down socket listeners with consistent patterns.
 * Centralizes the repeated setup/teardown logic found in multiple stores.
 */

import { socketService, SocketEventMap } from './socket.service';

/**
 * Socket event handler configuration
 */
export interface SocketEventConfig<K extends keyof SocketEventMap> {
  /** The event name to listen for */
  event: K;
  /** The handler function to call when the event is received */
  handler: (data: SocketEventMap[K]) => void;
}

/**
 * Creates a consistent setup/teardown pair for socket listeners.
 *
 * @param moduleName - Name of the module (used for logging)
 * @param events - Array of event configurations
 * @returns Object with setup and remove functions
 *
 * @example
 * const socketListeners = createSocketListeners('Documents', [
 *   { event: 'document:progress', handler: handleProgress },
 *   { event: 'document:updated', handler: handleUpdated },
 * ]);
 *
 * // In store:
 * setupSocketListeners: () => socketListeners.setup(),
 * removeSocketListeners: () => socketListeners.remove(),
 */
export function createSocketListeners<K extends keyof SocketEventMap>(
  moduleName: string,
  events: SocketEventConfig<K>[]
): { setup: () => void; remove: () => void } {
  return {
    setup: () => {
      console.log(`[${moduleName}] Setting up Socket.IO listeners`);

      // Remove existing listeners first to avoid duplicates
      events.forEach(({ event }) => {
        socketService.off(event);
      });

      // Attach new listeners
      events.forEach(({ event, handler }) => {
        socketService.on(event, handler as Parameters<typeof socketService.on>[1]);
      });

      console.log(`[${moduleName}] ✅ Socket.IO listeners set up`);
    },
    remove: () => {
      console.log(`[${moduleName}] Removing Socket.IO listeners`);

      events.forEach(({ event }) => {
        socketService.off(event);
      });

      console.log(`[${moduleName}] ✅ Socket.IO listeners removed`);
    },
  };
}

/**
 * Creates a unique log prefix for socket events with timestamp
 */
export const createEventLogger = (moduleName: string) => ({
  received: (eventType: string, data: unknown) => {
    console.log(`[${moduleName}] 📨 ${eventType} received:`, data);
  },
  updated: (id: string) => {
    console.log(`[${moduleName}] ✅ Updated in store:`, id);
  },
  created: (id: string) => {
    console.log(`[${moduleName}] ✅ Created in store:`, id);
  },
  deleted: (id: string) => {
    console.log(`[${moduleName}] ✅ Deleted from store:`, id);
  },
  error: (message: string, error: unknown) => {
    console.error(`[${moduleName}] ❌ ${message}:`, error);
  },
});
