import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  Stack,
  SxProps,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import paths from 'routes/paths';
import { Notification } from 'types/notification';
import Image from 'components/base/Image';
import NotificationActionMenu from './NotificationActionMenu';
import NotificationListItemAvatar from './NotificationListItemAvatar';
import { useNotificationStore } from 'modules/notifications';

dayjs.extend(relativeTime);
interface NotificationListProps {
  title: string;
  notifications: Notification[];
  sx?: SxProps;
  variant?: 'default' | 'small';
  onItemClick?: () => void;
}

const NotificationList = ({
  title,
  notifications,
  sx,
  variant = 'default',
  onItemClick,
}: NotificationListProps) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotificationStore();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read using the store (which handles API call and state update)
    // Only mark as read if not already read
    if (!notification.readAt) {
      const notificationId = String(notification.id);
      await markAsRead(notificationId);
    }

    // Use actionUrl if available (from backend notification), otherwise default to notifications page
    const url = (notification as any).actionUrl || paths.notifications;

    if (onItemClick) {
      onItemClick();
    }

    // Navigate to the action URL
    if (url.startsWith('/')) {
      navigate(url);
    } else {
      window.location.href = url;
    }
  };

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
      <List
        subheader={
          <ListSubheader
            component={Typography}
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              lineHeight: 1.45,
              mb: 0.5,
              position: 'static',
              bgcolor: 'transparent',
            }}
          >
            {title}
          </ListSubheader>
        }
        sx={sx}
      >
        {notifications.map((notification) => (
          <ListItem
            key={notification.id}
            disablePadding
            secondaryAction={<NotificationActionMenu />}
            sx={{
              '& .MuiListItemSecondaryAction-root': {
                top: 16,
                transform: 'none',
              },
            }}
          >
            <ListItemButton
              disableRipple
              onClick={() => handleNotificationClick(notification)}
              sx={[
                {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderRadius: 0,
                  p: 2,
                  gap: 1,
                  '&:hover': {
                    bgcolor: 'background.menuElevation1',
                  },
                },
                variant === 'default' && {
                  borderRadius: 6,
                  '&:hover': {
                    bgcolor: 'background.elevation1',
                  },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
              ]}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: 'flex-start',
                  width: 1,
                }}
              >
                {/* Unread indicator dot */}
                <Box sx={{ width: 8, height: 8, mt: 0.5, flexShrink: 0 }}>
                  {!notification.readAt && (
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        height: 8,
                        width: 8,
                        bgcolor: 'error.main',
                        outline: 2,
                        outlineColor: 'background.paper',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </Box>
                
                {/* Avatar */}
                <Box sx={{ flexShrink: 0 }}>
                  <NotificationListItemAvatar notification={notification} variant={variant} />
                </Box>
                
                {/* Content */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineClamp: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {notification.detail}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.disabled',
                      }}
                    >
                      {dayjs(notification.createdAt).fromNow()}
                    </Typography>
                    {(notification as any).actionUrl && (
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        • {(notification as any).actionLabel || 'View'}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
              {notification.images && (
                <Stack
                  sx={[
                    {
                      gap: 1,
                      ml: 12,
                    },
                    variant === 'small' && {
                      ml: 10,
                    },
                  ]}
                >
                  {notification.images.slice(0, 3).map((image) => (
                    <Image
                      src={image}
                      key={image}
                      height={80}
                      width={80}
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Stack>
              )}
              {['friend_request', 'group_invitation'].includes(notification.type) && (
                <Stack
                  sx={[
                    {
                      gap: 1,
                      ml: 12,
                      pointerEvents: 'auto',
                    },
                    variant === 'small' && {
                      ml: 10,
                    },
                  ]}
                >
                  <Button
                    variant="soft"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="soft"
                    color="neutral"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
  );
};

export default NotificationList;
