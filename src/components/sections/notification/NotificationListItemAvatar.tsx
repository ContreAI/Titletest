import { AvatarGroup, Badge, badgeClasses } from '@mui/material';
import { Avatar } from '@mui/material';
import { Notification, NotificationType } from 'types/notification';
import IconifyIcon from 'components/base/IconifyIcon';

interface NotificationListItemAvatarProps {
  notification: Notification;
  variant?: 'default' | 'small';
}

const getNotificationBadge = (type: NotificationType): { icon: string; color: string } => {
  switch (type) {
    case 'commented':
      return { icon: 'material-symbols:comment-outline', color: 'primary.main' };
    case 'following':
      return { icon: 'material-symbols:person-add-outline', color: 'info.main' };
    case 'birthday':
      return { icon: 'material-symbols:cake-outline', color: 'warning.main' };
    case 'friend_request':
      return { icon: 'material-symbols:person-add-outline', color: 'success.main' };
    case 'reaction_love':
      return { icon: 'material-symbols:favorite-outline', color: 'error.main' };
    case 'reaction_smile':
      return { icon: 'material-symbols:sentiment-satisfied-outline', color: 'warning.main' };
    case 'photos':
      return { icon: 'material-symbols:image-outline', color: 'info.main' };
    case 'group_invitation':
      return { icon: 'material-symbols:group-add-outline', color: 'success.main' };
    case 'tagged':
      return { icon: 'material-symbols:label-outline', color: 'secondary.main' };
    default:
      return { icon: 'material-symbols:notifications-outline', color: 'grey.500' };
  }
};

const NotificationListItemAvatar = ({ notification, variant }: NotificationListItemAvatarProps) => {
  const badge = getNotificationBadge(notification.type);

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        <Avatar
          sx={[
            {
              height: 24,
              width: 24,
              bgcolor: badge.color,
            },
            variant === 'small' && {
              height: 16,
              width: 16,
            },
          ]}
        >
          <IconifyIcon
            icon={badge.icon}
            sx={[
              { fontSize: notification.type === 'reaction_smile' ? 22 : 16 },
              variant === 'small' && { fontSize: notification.type === 'reaction_smile' ? 16 : 10 },
            ]}
          />
        </Avatar>
      }
      sx={{
        [`& .${badgeClasses.badge}`]: {
          height: 16,
          width: 16,
          minWidth: 'auto',
          zIndex: 2,
        },
      }}
    >
      <AvatarGroup max={2} sx={{ mr: 1.5 }}>
        {notification.user.slice(0, 2).map((user, index) => (
          <Avatar
            alt={user.name}
            src={user.avatar}
            key={user.id}
            sx={[
              { height: 56, width: 56 },
              notification.user.length > 1 &&
                index === 0 && {
                  mr: '-18px !important',
                },
              index === 1 && {
                mt: 2.25,
              },
              notification.user.length > 1 && {
                height: 38,
                width: 38,
              },
              variant === 'small' && {
                height: 40,
                width: 40,
              },
              notification.user.length > 1 &&
                variant === 'small' && {
                  height: 28,
                  width: 28,
                },
            ]}
          />
        ))}
      </AvatarGroup>
    </Badge>
  );
};

export default NotificationListItemAvatar;
