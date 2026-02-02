import { SyntheticEvent, useState, useEffect, useMemo } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import { Breadcrumbs, Button, Link, Stack, Typography, CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Tab, { tabClasses } from '@mui/material/Tab';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import NotificationTabPanel from 'components/sections/notification/NotificationTabPanel';
import { useNotificationStore } from 'modules/notifications';
import { Notification as UINotification, NotificationType } from 'types/notification';
// dayjs import removed - not currently used

const Notifications = () => {
  const [currentTab, setCurrentTab] = useState('all');
  const {
    notifications: notificationData,
    isLoading,
    fetchNotifications,
    markAllAsRead,
    unreadCount,
  } = useNotificationStore();

  const { up } = useBreakpoints();
  const upSm = up('sm');

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  // Convert notifications to display format
  const notifications = useMemo(() => {
    return notificationData.map((n: any): UINotification => {
      // Map backend notification types to frontend types
      const mapType = (type: string): NotificationType => {
        if (type.includes('document')) return 'commented';
        if (type.includes('agent')) return 'following';
        return 'commented';
      };
      
      // Use string ID to avoid collisions
      const notificationId = n.id || n._id || `notif-${Date.now()}-${Math.random()}`;
      
      return {
        id: String(notificationId),
        type: mapType(n.type),
        detail: <>{n.message}</>,
        readAt: n.readAt ? new Date(n.readAt) : (n.read ? new Date() : null),
        user: [],
        createdAt: new Date(n.createdAt),
      };
    });
  }, [notificationData]);

  // Filter by type for different tabs (using backend type strings)
  const documentNotifications = useMemo(() => {
    return notificationData
      .filter((n: any) => 
        n.type === 'document_uploaded' ||
        n.type === 'document_processed' ||
        n.type === 'document_failed'
      )
      .map((n: any): UINotification => {
        const notificationId = n.id || n._id || `notif-${Date.now()}-${Math.random()}`;
        return {
          id: String(notificationId),
          type: 'commented' as NotificationType,
          detail: <>{n.message}</>,
          readAt: n.readAt ? new Date(n.readAt) : (n.read ? new Date() : null),
          user: [],
          createdAt: new Date(n.createdAt),
        };
      });
  }, [notificationData]);

  const agentNotifications = useMemo(() => {
    return notificationData
      .filter((n: any) => 
        n.type === 'agent_uploaded_document' ||
        n.type === 'agent_commented'
      )
      .map((n: any) => ({
        id: parseInt(n.id) || Date.now(),
        type: 'following' as NotificationType,
        detail: <>{n.message}</>,
        readAt: n.readAt ? new Date(n.readAt) : (n.read ? new Date() : null),
        user: [],
        createdAt: new Date(n.createdAt),
        actionUrl: n.actionUrl,
        icon: n.icon,
      }));
  }, [notificationData]);

  return (
    <Box
      sx={{
        p: { xs: 3, md: 5 },
      }}
    >
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="#!">Pages</Link>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          Notifications
        </Typography>
      </Breadcrumbs>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </Typography>
        <Button
          variant="soft"
          color="neutral"
          startIcon={<IconifyIcon icon="material-symbols:check-rounded" />}
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || isLoading}
        >
          Mark all as read
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TabContext value={currentTab}>
          <Stack
            sx={{
              justifyContent: 'space-between',
            }}
          >
            <TabList onChange={handleChange} aria-label="notification tabs">
              <Tab
                label={upSm ? `All (${notifications.length})` : undefined}
                value="all"
                icon={
                  <IconifyIcon icon="material-symbols:notifications-outline-rounded" fontSize={20} />
                }
                iconPosition="start"
                sx={{
                  [`& .${tabClasses.icon}`]: {
                    mr: 0.5,
                  },
                }}
              />
              <Tab
                label={upSm ? `Documents (${documentNotifications.length})` : undefined}
                value="documents"
                icon={
                  <IconifyIcon icon="material-symbols:file-copy-outline" fontSize={20} />
                }
                iconPosition="start"
              />
              <Tab
                label={upSm ? `Agent Activity (${agentNotifications.length})` : undefined}
                value="agents"
                icon={
                  <IconifyIcon icon="material-symbols:people-outline" fontSize={20} />
                }
                iconPosition="start"
              />
            </TabList>
          </Stack>
          <NotificationTabPanel value="all" notificationsData={notifications} />
          <NotificationTabPanel value="documents" notificationsData={documentNotifications} />
          <NotificationTabPanel value="agents" notificationsData={agentNotifications} />
        </TabContext>
      )}
    </Box>
  );
};

export default Notifications;
