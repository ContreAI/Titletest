import { useEffect, useState, useMemo } from 'react';
import React from 'react';
import { NavLink } from 'react-router';
import { Box, Button, Popover, Stack, Typography, badgeClasses, paperClasses } from '@mui/material';
import dayjs from 'dayjs';
import { useSettingsContext } from 'providers/SettingsProvider';
import paths from 'routes/paths';
import { DatewiseNotification, Notification, NotificationType } from 'types/notification';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import NotificationList from 'components/sections/notification/NotificationList';
import OutlinedBadge from 'components/styled/OutlinedBadge';
import { useNotificationStore } from 'modules/notifications';

interface NotificationMenuProps {
  type?: 'default' | 'slim';
}

const NotificationMenu = ({ type = 'default' }: NotificationMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    notifications: notificationData,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
  } = useNotificationStore();
  // Note: Socket listeners are now centrally managed by socket.events.ts

  const {
    config: { textDirection },
  } = useSettingsContext();

  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Notifications are fetched on mount and kept up-to-date via Socket.IO
    // No need to fetch again on every menu open
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Fetch notifications on mount (via HTTP, doesn't require socket)
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Socket listeners are now centrally managed by socket.events.ts
  // They are initialized automatically when socket connects

  // Convert to datewise format
  const notifications = useMemo(() => {
    if (!notificationData || notificationData.length === 0) {
      return { today: [], older: [] };
    }

    return notificationData.reduce(
      (acc: DatewiseNotification, val: any, index: number) => {
        try {
          // Use string ID directly to avoid hash collisions
          const rawId = val.id || val._id;
          const notificationId = rawId ? String(rawId) : `notif-${index}-${Date.now()}`;

          const notification: Notification = {
            id: notificationId,
            type: (val.type === 'document_uploaded' || val.type === 'document_processed' || val.type === 'document_failed'
              ? 'commented'
              : val.type === 'agent_uploaded_document' || val.type === 'agent_commented'
              ? 'following'
              : 'commented') as NotificationType,
            detail: <>{val.message || val.title || 'Notification'}</>,
            readAt: val.readAt ? new Date(val.readAt) : (val.read ? new Date() : null),
            user: [], // Can be populated if needed
            createdAt: val.createdAt ? new Date(val.createdAt) : new Date(),
          };

          const createdAt = val.createdAt ? new Date(val.createdAt) : new Date();
          if (dayjs().diff(dayjs(createdAt), 'days') === 0) {
            acc.today.push(notification);
          } else {
            acc.older.push(notification);
          }
        } catch (error) {
          console.error('[NotificationMenu] Error converting notification at index', index, ':', error, val);
        }
        return acc;
      },
      {
        today: [],
        older: [],
      },
    );
  }, [notificationData]);

  return (
    <>
      <Button
        color="neutral"
        variant={type === 'default' ? 'soft' : 'text'}
        shape="circle"
        size={type === 'slim' ? 'small' : 'medium'}
        onClick={handleClick}
      >
        <OutlinedBadge
          badgeContent={unreadCount > 0 ? unreadCount : null}
          color="error"
          invisible={unreadCount === 0}
          sx={{
            [`& .${badgeClasses.badge}`]: {
              height: 18,
              minWidth: 18,
              top: -4,
              right: -4,
              borderRadius: '50%',
              fontSize: '0.7rem',
            },
          }}
        >
          <IconifyIcon
            icon={
              type === 'slim'
                ? 'material-symbols:notifications-outline-rounded'
                : 'material-symbols-light:notifications-outline-rounded'
            }
            sx={{ fontSize: type === 'slim' ? 18 : 22 }}
          />
        </OutlinedBadge>
      </Button>
      <Popover
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'bottom',
        }}
        sx={{
          [`& .${paperClasses.root}`]: {
            width: 400,
            height: 650,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ pt: 2, flex: 1, overflow: 'hidden' }}>
          <SimpleBar disableHorizontal>
            {notifications.today.length > 0 && (
              <NotificationList
                title="Today"
                notifications={notifications.today}
                variant="small"
                onItemClick={handleClose}
              />
            )}
            {notifications.older.length > 0 && (
              <NotificationList
                title="Older"
                notifications={notifications.older}
                variant="small"
                onItemClick={handleClose}
              />
            )}
            {notifications.today.length === 0 && notifications.older.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            )}
          </SimpleBar>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            py: 1,
            px: 2,
          }}
        >
          <Button
            variant="text"
            color="neutral"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            size="small"
          >
            Mark all read
          </Button>
          <Button
            component={NavLink}
            to={paths.notifications}
            variant="text"
            color="primary"
            size="small"
            onClick={handleClose}
          >
            View All
          </Button>
        </Stack>
      </Popover>
    </>
  );
};

export default NotificationMenu;
