/**
 * Notification Store
 *
 * Manages notifications with real-time Socket.IO updates
 */

import { create } from 'zustand';
import { socketService } from 'services/socket/socket.service';
import {
  notificationControllerGetNotifications,
  notificationControllerMarkAsRead,
  notificationControllerMarkAllAsRead,
  notificationControllerDeleteNotification,
  notificationControllerDeleteAll,
} from '@contreai/api-client';
import { useDocumentsStore } from 'modules/documents/store/documents.store';
import type { NotificationState, Notification } from '../typings/notification.types';
import { NotificationType, NotificationPriority } from '../typings/notification.types';

// Track IDs that we just marked as read to avoid double-decrementing from socket events
const recentlyMarkedAsRead = new Set<string>();

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  // Fetch notifications from API
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      // Use generated client
      const response = await notificationControllerGetNotifications({ limit: '50', skip: '0' });
      console.log('[Notifications] API response:', response);

      const notificationsArray = Array.isArray(response?.notifications)
        ? response.notifications
        : response?.notifications
          ? [response.notifications]
          : [];

      // Normalize IDs
      const normalizedNotifications = notificationsArray.map((n: any) => ({
        ...n,
        id: n.id || `notif-${Date.now()}-${Math.random()}`,
      }));

      console.log('[Notifications] Processed notifications:', normalizedNotifications.length);

      set({
        notifications: normalizedNotifications,
        unreadCount: response?.unreadCount || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error('[Notifications] Failed to fetch:', error);
      set({ isLoading: false });
    }
  },

  // Add new notification (from Socket.IO)
  addNotification: (notification: Notification) => {
    console.log('[Notifications] Adding notification:', notification);
    set((state) => {
      // Check if notification already exists to avoid duplicates
      const exists = state.notifications.some((n) => n.id === notification.id);
      if (exists) {
        console.log('[Notifications] Notification already exists, skipping:', notification.id);
        return state;
      }

      return {
        notifications: [notification, ...state.notifications],
        unreadCount: !notification.read ? state.unreadCount + 1 : state.unreadCount,
      };
    });

    // Show browser notification if permitted
    if (!notification.read && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  },

  // Mark as read
  markAsRead: async (id: string) => {
    const stringId = String(id);

    // Check if already read to avoid duplicate API calls
    const notification = get().notifications.find((n) => String(n.id) === stringId);
    if (notification?.read) {
      return; // Already read, skip
    }

    // Track this ID to prevent socket handler from double-decrementing
    recentlyMarkedAsRead.add(stringId);
    // Clear after 5 seconds to allow future reads from other devices
    setTimeout(() => recentlyMarkedAsRead.delete(stringId), 5000);

    try {
      await notificationControllerMarkAsRead(stringId);
      console.log('[Notifications] Marked as read:', stringId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          String(n.id) === stringId ? { ...n, read: true, readAt: new Date().toISOString() } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('[Notifications] Failed to mark as read:', error);
      // Remove from tracking on error so retry can work
      recentlyMarkedAsRead.delete(stringId);
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await notificationControllerMarkAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('[Notifications] Failed to mark all as read:', error);
    }
  },

  // Delete notification
  deleteNotification: async (id: string) => {
    try {
      await notificationControllerDeleteNotification(id);
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification && !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      console.error('[Notifications] Failed to delete:', error);
    }
  },

  // Delete all
  deleteAll: async () => {
    try {
      await notificationControllerDeleteAll();
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('[Notifications] Failed to delete all:', error);
    }
  },

  // Setup Socket.IO listeners
  setupSocketListeners: () => {
    console.log('[Notifications] Setting up Socket.IO listeners');

    // Remove existing listeners first to avoid duplicates
    socketService.off('notification:new');
    socketService.off('notification:read');
    socketService.off('notification:all-read');

    // New notification received
    const handleNewNotification = (data: any) => {
      console.log('[Notifications] 🔔 New notification received via Socket.IO:', data);

      // Convert backend notification format to frontend format
      const notification: Notification = {
        id: data.id || `notif-${Date.now()}-${Math.random()}`,
        type: data.type as NotificationType,
        title: data.title || 'Notification',
        message: data.message || '',
        transactionId: data.transactionId,
        documentId: data.documentId,
        agentId: data.agentId,
        jobId: data.jobId,
        metadata: data.metadata,
        read: data.read || false,
        readAt: data.readAt,
        priority: data.priority || NotificationPriority.NORMAL,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        icon: data.icon,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      console.log('[Notifications] Converted notification:', notification);
      get().addNotification(notification);

      // Update document store based on notification type
      // Handle document-related notifications (require documentId)
      if (notification.documentId && notification.transactionId) {
        try {
          const { updateDocumentStatus } = useDocumentsStore.getState();
          console.log('[Notifications] Updating document status:', {
            documentId: notification.documentId,
            type: notification.type,
          });

          if (notification.type === 'document_processed') {
            updateDocumentStatus(notification.documentId, 'completed');

            // Fetch transaction report after document is processed
            // The backend automatically generates the report after processing
            const transactionId = notification.transactionId;
            if (transactionId) {
              setTimeout(() => {
                try {
                  // Dynamic import to avoid circular dependency
                  import('modules/transaction-reports/store/transaction-reports.store')
                    .then((module) => {
                      module.useTransactionReportsStore.getState().fetchTransactionReport(transactionId);
                      console.log('[Notifications] Transaction report fetch triggered after document processing');
                    })
                    .catch((err) => {
                      console.error('[Notifications] Failed to fetch transaction report:', err);
                    });
                } catch (err) {
                  console.error('[Notifications] Failed to fetch transaction report:', err);
                }
              }, 2000); // Wait 2 seconds for backend to generate report
            }
          } else if (notification.type === 'document_failed') {
            updateDocumentStatus(notification.documentId, 'error');
          } else if (notification.type === 'document_uploaded') {
            updateDocumentStatus(notification.documentId, 'processing');
          }
        } catch (err) {
          console.error('[Notifications] Failed to update document status:', err);
        }
      }

      // Handle transaction report ready notifications (may not have documentId after deletion)
      if (notification.type === 'transaction_report_ready' && notification.transactionId) {
        // When document deletion is complete and report is regenerated, refetch transaction report
        // Follow the same pattern as document_processed notification
        const transactionId = notification.transactionId;
        setTimeout(() => {
          try {
            // Dynamic import to avoid circular dependency
            import('modules/transaction-reports/store/transaction-reports.store')
              .then((module) => {
                module.useTransactionReportsStore.getState().fetchTransactionReport(transactionId);
                console.log('[Notifications] Transaction report refetched after document deletion');
              })
              .catch((err) => {
                console.error('[Notifications] Failed to refetch transaction report after deletion:', err);
              });
          } catch (err) {
            console.error('[Notifications] Failed to refetch transaction report after deletion:', err);
          }
        }, 2000); // Wait 2 seconds for backend to complete report regeneration (same as document processing)
      }

      // Note: We trust the socket event for real-time updates and don't refetch
      // The addNotification() call above already updates the state optimistically
    };

    socketService.on('notification:new', handleNewNotification);

    // Notification marked as read (from another device/tab)
    socketService.on('notification:read', (data: { id: string }) => {
      const stringId = String(data.id);

      // If we just marked this as read ourselves, skip to avoid double-decrementing
      if (recentlyMarkedAsRead.has(stringId)) {
        console.log('[Notifications] Skipping socket read event (we just marked it):', stringId);
        return;
      }

      console.log('[Notifications] Notification read via Socket.IO (from another device/tab):', stringId);
      set((state) => {
        // Only decrement if the notification was actually unread
        const notification = state.notifications.find((n) => String(n.id) === stringId);
        const shouldDecrement = notification && !notification.read;

        return {
          notifications: state.notifications.map((n) =>
            String(n.id) === stringId ? { ...n, read: true, readAt: new Date().toISOString() } : n,
          ),
          unreadCount: shouldDecrement ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    });

    // All notifications marked as read (from another device/tab)
    socketService.on('notification:all-read', () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    });

    // Document processing updates
    socketService.on('document:status', (data: any) => {
      console.log('[Notifications] Document status update:', data);
      // Status updates handled by transaction/document stores
    });
  },

  // Remove Socket.IO listeners
  removeSocketListeners: () => {
    console.log('[Notifications] Removing Socket.IO listeners');
    socketService.off('notification:new');
    socketService.off('notification:read');
    socketService.off('notification:all-read');
    socketService.off('document:status');
  },
}));
