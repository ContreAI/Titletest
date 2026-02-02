import { PropsWithChildren, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  MenuItemProps,
  Stack,
  Switch,
  SxProps,
  Typography,
  listClasses,
  listItemIconClasses,
  paperClasses,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import { useThemeMode } from 'hooks/useThemeMode';
import { useAuth } from 'modules/auth';
import { useTenant } from 'modules/tenant';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { demoUser } from 'data/demoUser';
import paths, { authPaths } from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusAvatar from 'components/base/StatusAvatar';
import TenantSwitcher from 'components/tenant/TenantSwitcher';

interface ProfileMenuProps {
  type?: 'default' | 'slim';
}

interface ProfileMenuItemProps extends MenuItemProps {
  icon: string;
  href?: string;
  sx?: SxProps;
}

const ProfileMenu = ({ type = 'default' }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { up } = useBreakpoints();
  const upSm = up('sm');
  const {
    config: { textDirection },
  } = useSettingsContext();

  const { isDark, setThemeMode } = useThemeMode();

  const { user: sessionUser, logout } = useAuth();
  const { tenantName, isLoaded: tenantLoaded } = useTenant();

  // Demo user data used for development purposes
  const user = useMemo(() => sessionUser || demoUser, [sessionUser]);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignout = () => {
    handleClose();
    logout(); // Redirects to auth server for logout
  };

  const menuButton = (
    <Button
      color="neutral"
      variant="text"
      shape="circle"
      onClick={handleClick}
      sx={[
        {
          height: 44,
          width: 44,
        },
        type === 'slim' && {
          height: 30,
          width: 30,
          minWidth: 30,
        },
      ]}
    >
      <StatusAvatar
        alt={user.name}
        status="online"
        src={user.avatar ?? undefined}
        sx={[
          {
            width: 40,
            height: 40,
            border: 2,
            borderColor: 'background.paper',
          },
          type === 'slim' && { width: 24, height: 24, border: 1, borderColor: 'background.paper' },
        ]}
      />
    </Button>
  );
  return (
    <>
      {type === 'slim' && upSm ? (
        <Button color="neutral" variant="text" size="small" onClick={handleClick}>
          {user.name}
        </Button>
      ) : (
        menuButton
      )}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
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
          [`& .${paperClasses.root}`]: { minWidth: 320 },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <StatusAvatar
            status="online"
            alt={`${sessionUser?.firstName || user.name} ${sessionUser?.lastName || ''}`}
            src={user.avatar ?? undefined}
            sx={{ width: 48, height: 48 }}
          />
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {sessionUser ? `${sessionUser.firstName} ${sessionUser.lastName}` : user.name}
            </Typography>
            {sessionUser?.email && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 0.5,
                }}
              >
                {sessionUser.email}
              </Typography>
            )}
            {sessionUser?.role && (
              <Typography
                variant="caption"
                sx={{
                  color: 'primary.main',
                  bgcolor: 'primary.lighter',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  textTransform: 'capitalize',
                }}
              >
                {sessionUser.role}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Tenant Switcher - only show when user has tenant memberships */}
        {tenantLoaded && tenantName && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1 }}
              >
                Organization
              </Typography>
              <TenantSwitcher variant="default" onSwitch={handleClose} />
            </Box>
          </>
        )}

        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            icon="material-symbols:accessible-forward-rounded"
            onClick={() => {
              navigate(paths.accountSettingsAccessibility);
              handleClose();
            }}
          >
            Accessibility
          </ProfileMenuItem>

          <ProfileMenuItem
            icon="material-symbols:settings-outline-rounded"
            onClick={() => {
              navigate(paths.accountSettingsPreferences);
              handleClose();
            }}
          >
            Preferences
          </ProfileMenuItem>

          <ProfileMenuItem
            onClick={() => setThemeMode()}
            icon="material-symbols:dark-mode-outline-rounded"
          >
            Dark mode
            <Switch checked={isDark} onChange={() => setThemeMode()} sx={{ ml: 'auto' }} />
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            icon="material-symbols:manage-accounts-outline-rounded"
            onClick={() => {
              navigate(paths.accountSettingsProfile);
              handleClose();
            }}
          >
            Account Settings
          </ProfileMenuItem>
          <ProfileMenuItem
            icon="material-symbols:question-mark-rounded"
            onClick={handleClose}
            href="#!"
          >
            Help Center
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          {sessionUser ? (
            <ProfileMenuItem onClick={handleSignout} icon="material-symbols:logout-rounded">
              Sign Out
            </ProfileMenuItem>
          ) : (
            <ProfileMenuItem href={authPaths.login} icon="material-symbols:login-rounded">
              Sign In
            </ProfileMenuItem>
          )}
        </Box>
      </Menu>
    </>
  );
};

const ProfileMenuItem = ({
  icon,
  onClick,
  children,
  href,
  sx,
}: PropsWithChildren<ProfileMenuItemProps>) => {
  const linkProps = href ? { component: Link, href, underline: 'none' } : {};
  return (
    <MenuItem onClick={onClick} {...linkProps} sx={{ gap: 1, ...sx }}>
      <ListItemIcon
        sx={{
          [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' },
        }}
      >
        <IconifyIcon icon={icon} sx={{ color: 'text.secondary' }} />
      </ListItemIcon>
      {children}
    </MenuItem>
  );
};

export default ProfileMenu;
