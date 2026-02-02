import { useNotificationStore } from '../store/notification.store';

/**
 * Custom hook to access notifications store
 */
export const useNotifications = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isLoading = useNotificationStore((state) => state.isLoading);
  
  // Actions
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);
  const deleteAll = useNotificationStore((state) => state.deleteAll);
  const setupSocketListeners = useNotificationStore((state) => state.setupSocketListeners);
  const removeSocketListeners = useNotificationStore((state) => state.removeSocketListeners);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    
    // Actions
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    setupSocketListeners,
    removeSocketListeners,
  };
};

