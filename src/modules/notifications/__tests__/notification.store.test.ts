import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useNotificationStore } from '../store/notification.store';
import { NotificationType, NotificationPriority } from '../typings/notification.types';
import type { Notification } from '../typings/notification.types';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  notificationControllerGetNotifications: vi.fn(),
  notificationControllerMarkAsRead: vi.fn(),
  notificationControllerMarkAllAsRead: vi.fn(),
  notificationControllerDeleteNotification: vi.fn(),
  notificationControllerDeleteAll: vi.fn(),
}));

// Mock socket service
vi.mock('services/socket/socket.service', () => ({
  socketService: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// Mock documents store
vi.mock('modules/documents/store/documents.store', () => ({
  useDocumentsStore: {
    getState: vi.fn(() => ({
      updateDocumentStatus: vi.fn(),
    })),
  },
}));

// Mock transaction reports store (used in notification handler)
vi.mock('modules/transaction-reports/store/transaction-reports.store', () => ({
  useTransactionReportsStore: {
    getState: vi.fn(() => ({
      fetchTransactionReport: vi.fn(),
    })),
  },
}));

describe('Notification Store', () => {
  const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
    id: `notif-${Date.now()}-${Math.random()}`,
    type: NotificationType.DOCUMENT_PROCESSED,
    title: 'Test Notification',
    message: 'Test message',
    read: false,
    priority: NotificationPriority.NORMAL,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    // Reset store state
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useNotificationStore.getState();
      expect(state.notifications).toEqual([]);
      expect(state.unreadCount).toBe(0);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('fetchNotifications', () => {
    it('should fetch and store notifications', async () => {
      const apiClient = await import('@contreai/api-client');
      const mockNotif = createMockNotification({ id: 'notif-1' });
      vi.mocked(apiClient.notificationControllerGetNotifications).mockResolvedValueOnce({
        notifications: [mockNotif],
        unreadCount: 1,
      } as any);

      await useNotificationStore.getState().fetchNotifications();

      expect(apiClient.notificationControllerGetNotifications).toHaveBeenCalledWith({
        limit: '50',
        skip: '0',
      });
      expect(useNotificationStore.getState().notifications).toHaveLength(1);
      expect(useNotificationStore.getState().unreadCount).toBe(1);
      expect(useNotificationStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.notificationControllerGetNotifications).mockReturnValueOnce(promise as any);

      const fetchPromise = useNotificationStore.getState().fetchNotifications();

      expect(useNotificationStore.getState().isLoading).toBe(true);

      resolvePromise!({ notifications: [], unreadCount: 0 });
      await fetchPromise;

      expect(useNotificationStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch errors gracefully', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerGetNotifications).mockRejectedValueOnce(
        new Error('Network error')
      );

      // Should not throw
      await useNotificationStore.getState().fetchNotifications();

      expect(useNotificationStore.getState().isLoading).toBe(false);
    });

    it('should handle empty notifications array', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerGetNotifications).mockResolvedValueOnce({
        notifications: [],
        unreadCount: 0,
      } as any);

      await useNotificationStore.getState().fetchNotifications();

      expect(useNotificationStore.getState().notifications).toEqual([]);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should normalize notification IDs', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerGetNotifications).mockResolvedValueOnce({
        notifications: [{ title: 'No ID notification', message: 'test' }],
        unreadCount: 0,
      } as any);

      await useNotificationStore.getState().fetchNotifications();

      const notifs = useNotificationStore.getState().notifications;
      expect(notifs[0].id).toMatch(/^notif-/);
    });
  });

  describe('addNotification', () => {
    it('should add notification to the beginning of list', () => {
      const existingNotif = createMockNotification({ id: 'existing' });
      useNotificationStore.setState({ notifications: [existingNotif], unreadCount: 0 });

      const newNotif = createMockNotification({ id: 'new-notif' });
      useNotificationStore.getState().addNotification(newNotif);

      expect(useNotificationStore.getState().notifications).toHaveLength(2);
      expect(useNotificationStore.getState().notifications[0].id).toBe('new-notif');
    });

    it('should increment unread count for unread notification', () => {
      useNotificationStore.setState({ notifications: [], unreadCount: 0 });

      const newNotif = createMockNotification({ read: false });
      useNotificationStore.getState().addNotification(newNotif);

      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it('should not increment unread count for read notification', () => {
      useNotificationStore.setState({ notifications: [], unreadCount: 0 });

      const newNotif = createMockNotification({ read: true });
      useNotificationStore.getState().addNotification(newNotif);

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should prevent duplicate notifications', () => {
      const notif = createMockNotification({ id: 'duplicate-id' });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 1 });

      // Try to add same notification again
      useNotificationStore.getState().addNotification(notif);

      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerMarkAsRead).mockResolvedValueOnce({ success: true } as any);

      const notif = createMockNotification({ id: 'notif-1', read: false });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 1 });

      await useNotificationStore.getState().markAsRead('notif-1');

      expect(apiClient.notificationControllerMarkAsRead).toHaveBeenCalledWith('notif-1');
      expect(useNotificationStore.getState().notifications[0].read).toBe(true);
      expect(useNotificationStore.getState().notifications[0].readAt).toBeDefined();
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should skip if already read', async () => {
      const apiClient = await import('@contreai/api-client');

      const notif = createMockNotification({ id: 'notif-1', read: true });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 0 });

      await useNotificationStore.getState().markAsRead('notif-1');

      expect(apiClient.notificationControllerMarkAsRead).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerMarkAsRead).mockRejectedValueOnce(
        new Error('API error')
      );

      const notif = createMockNotification({ id: 'notif-1', read: false });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 1 });

      // Should not throw
      await useNotificationStore.getState().markAsRead('notif-1');
    });

    it('should not decrement unread count below zero', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerMarkAsRead).mockResolvedValueOnce({ success: true } as any);

      const notif = createMockNotification({ id: 'notif-1', read: false });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 0 });

      await useNotificationStore.getState().markAsRead('notif-1');

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerMarkAllAsRead).mockResolvedValueOnce({ success: true } as any);

      const notifs = [
        createMockNotification({ id: 'notif-1', read: false }),
        createMockNotification({ id: 'notif-2', read: false }),
      ];
      useNotificationStore.setState({ notifications: notifs, unreadCount: 2 });

      await useNotificationStore.getState().markAllAsRead();

      expect(apiClient.notificationControllerMarkAllAsRead).toHaveBeenCalled();
      expect(useNotificationStore.getState().notifications.every((n) => n.read)).toBe(true);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerMarkAllAsRead).mockRejectedValueOnce(
        new Error('API error')
      );

      const notifs = [createMockNotification({ read: false })];
      useNotificationStore.setState({ notifications: notifs, unreadCount: 1 });

      // Should not throw
      await useNotificationStore.getState().markAllAsRead();

      // State should remain unchanged on error
      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification from list', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerDeleteNotification).mockResolvedValueOnce({ success: true } as any);

      const notif = createMockNotification({ id: 'notif-to-delete' });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 0 });

      await useNotificationStore.getState().deleteNotification('notif-to-delete');

      expect(apiClient.notificationControllerDeleteNotification).toHaveBeenCalledWith(
        'notif-to-delete'
      );
      expect(useNotificationStore.getState().notifications).toEqual([]);
    });

    it('should decrement unread count when deleting unread notification', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerDeleteNotification).mockResolvedValueOnce({ success: true } as any);

      const notif = createMockNotification({ id: 'notif-1', read: false });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 1 });

      await useNotificationStore.getState().deleteNotification('notif-1');

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should not decrement unread count when deleting read notification', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerDeleteNotification).mockResolvedValueOnce({ success: true } as any);

      const notif = createMockNotification({ id: 'notif-1', read: true });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 1 });

      await useNotificationStore.getState().deleteNotification('notif-1');

      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it('should handle API errors gracefully', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerDeleteNotification).mockRejectedValueOnce(
        new Error('API error')
      );

      const notif = createMockNotification({ id: 'notif-1' });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 0 });

      // Should not throw
      await useNotificationStore.getState().deleteNotification('notif-1');

      // State should remain unchanged on error
      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });
  });

  describe('deleteAll', () => {
    it('should delete all notifications', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerDeleteAll).mockResolvedValueOnce({ success: true } as any);

      const notifs = [
        createMockNotification({ id: 'notif-1' }),
        createMockNotification({ id: 'notif-2' }),
      ];
      useNotificationStore.setState({ notifications: notifs, unreadCount: 2 });

      await useNotificationStore.getState().deleteAll();

      expect(apiClient.notificationControllerDeleteAll).toHaveBeenCalled();
      expect(useNotificationStore.getState().notifications).toEqual([]);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.notificationControllerDeleteAll).mockRejectedValueOnce(
        new Error('API error')
      );

      const notifs = [createMockNotification()];
      useNotificationStore.setState({ notifications: notifs, unreadCount: 1 });

      // Should not throw
      await useNotificationStore.getState().deleteAll();

      // State should remain unchanged on error
      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });
  });

  describe('setupSocketListeners', () => {
    it('should remove existing listeners and add new ones', async () => {
      const { socketService } = await import('services/socket/socket.service');

      useNotificationStore.getState().setupSocketListeners();

      expect(socketService.off).toHaveBeenCalledWith('notification:new');
      expect(socketService.off).toHaveBeenCalledWith('notification:read');
      expect(socketService.off).toHaveBeenCalledWith('notification:all-read');
      expect(socketService.on).toHaveBeenCalledWith('notification:new', expect.any(Function));
      expect(socketService.on).toHaveBeenCalledWith('notification:read', expect.any(Function));
      expect(socketService.on).toHaveBeenCalledWith('notification:all-read', expect.any(Function));
    });

    it('should handle new notification events', async () => {
      const { socketService } = await import('services/socket/socket.service');

      useNotificationStore.getState().setupSocketListeners();

      // Get the handler that was registered
      const onCall = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'notification:new'
      );
      expect(onCall).toBeDefined();

      const handler = onCall![1] as (data: any) => void;

      // Simulate new notification event
      handler({
        id: 'socket-notif-1',
        type: NotificationType.DOCUMENT_PROCESSED,
        title: 'Document Ready',
        message: 'Your document has been processed',
        read: false,
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);
      expect(useNotificationStore.getState().notifications[0].title).toBe('Document Ready');
    });

    it('should handle notification read events from other devices', async () => {
      const { socketService } = await import('services/socket/socket.service');

      // Use a unique ID that won't be in the recentlyMarkedAsRead set
      const uniqueId = `remote-read-${Date.now()}`;
      const notif = createMockNotification({ id: uniqueId, read: false });
      useNotificationStore.setState({ notifications: [notif], unreadCount: 1 });

      useNotificationStore.getState().setupSocketListeners();

      const onCall = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'notification:read'
      );
      const handler = onCall![1] as (data: any) => void;

      // Simulate notification read event from another device
      handler({ id: uniqueId });

      expect(useNotificationStore.getState().notifications[0].read).toBe(true);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should handle all-read events from other devices', async () => {
      const { socketService } = await import('services/socket/socket.service');

      const notifs = [
        createMockNotification({ id: 'notif-1', read: false }),
        createMockNotification({ id: 'notif-2', read: false }),
      ];
      useNotificationStore.setState({ notifications: notifs, unreadCount: 2 });

      useNotificationStore.getState().setupSocketListeners();

      const onCall = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'notification:all-read'
      );
      const handler = onCall![1] as () => void;

      // Simulate all-read event
      handler();

      expect(useNotificationStore.getState().notifications.every((n) => n.read)).toBe(true);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe('removeSocketListeners', () => {
    it('should remove all socket listeners', async () => {
      const { socketService } = await import('services/socket/socket.service');

      useNotificationStore.getState().removeSocketListeners();

      expect(socketService.off).toHaveBeenCalledWith('notification:new');
      expect(socketService.off).toHaveBeenCalledWith('notification:read');
      expect(socketService.off).toHaveBeenCalledWith('notification:all-read');
      expect(socketService.off).toHaveBeenCalledWith('document:status');
    });
  });
});
