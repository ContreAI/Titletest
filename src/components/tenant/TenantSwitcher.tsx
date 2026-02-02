/**
 * TenantSwitcher Component
 *
 * Dropdown component for switching between tenant organizations.
 * Shows current tenant and allows switching when user has multiple memberships.
 */

import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTenantSelector } from 'modules/tenant';

interface TenantSwitcherProps {
  /** Variant of the switcher */
  variant?: 'default' | 'compact';
  /** Called when tenant is switched */
  onSwitch?: () => void;
}

/**
 * Role badge colors based on role level
 */
const getRoleColor = (role: string) => {
  switch (role) {
    case 'broker':
      return 'warning.main';
    case 'admin':
      return 'primary.main';
    case 'agent':
      return 'success.main';
    case 'transactionCoordinator':
      return 'info.main';
    default:
      return 'text.secondary';
  }
};

/**
 * Role icons based on role level
 */
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'broker':
      return 'material-symbols:admin-panel-settings';
    case 'admin':
      return 'material-symbols:shield-person';
    case 'agent':
      return 'material-symbols:person';
    case 'transactionCoordinator':
      return 'material-symbols:assignment';
    default:
      return 'material-symbols:person';
  }
};

export function TenantSwitcher({ variant = 'default', onSwitch }: TenantSwitcherProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { memberships, activeTenant, isRefreshing, switchTenant, canSwitch } = useTenantSelector();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (canSwitch) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchTenant = async (tenantId: string) => {
    if (tenantId === activeTenant?.tenantId) {
      handleClose();
      return;
    }

    try {
      await switchTenant(tenantId);
      onSwitch?.();
    } catch (error) {
      console.error('[TenantSwitcher] Failed to switch tenant:', error);
    } finally {
      handleClose();
    }
  };

  // Loading state
  if (!activeTenant && memberships.length === 0) {
    return variant === 'compact' ? (
      <Skeleton variant="rounded" width={100} height={24} />
    ) : (
      <Skeleton variant="rounded" width={200} height={40} />
    );
  }

  // No tenant (new user without any memberships)
  if (!activeTenant) {
    return null;
  }

  // Compact variant - just shows the name
  if (variant === 'compact') {
    return (
      <Button
        color="neutral"
        variant="text"
        size="small"
        onClick={handleClick}
        disabled={!canSwitch}
        endIcon={
          canSwitch ? (
            <IconifyIcon
              icon="material-symbols:keyboard-arrow-down"
              sx={{ fontSize: '1rem !important' }}
            />
          ) : null
        }
        sx={{
          textTransform: 'none',
          px: 1,
        }}
      >
        <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
          {activeTenant.name}
        </Typography>
      </Button>
    );
  }

  // Default variant - full display
  return (
    <>
      <Button
        color="neutral"
        variant="outlined"
        onClick={handleClick}
        disabled={!canSwitch || isRefreshing}
        endIcon={
          isRefreshing ? (
            <CircularProgress size={16} />
          ) : canSwitch ? (
            <IconifyIcon icon="material-symbols:unfold-more" />
          ) : null
        }
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          px: 2,
          py: 1,
          minWidth: 200,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <IconifyIcon
            icon="material-symbols:apartment"
            sx={{ fontSize: '1.25rem', color: 'primary.main' }}
          />
          <Box sx={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {activeTenant.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: getRoleColor(activeTenant.role),
                textTransform: 'capitalize',
              }}
            >
              {activeTenant.role}
            </Typography>
          </Box>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 280,
            mt: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Switch Organization
          </Typography>
        </Box>
        <Divider />

        {memberships.map((membership) => {
          const isActive = membership.tenantId === activeTenant.tenantId;

          return (
            <MenuItem
              key={membership.tenantId}
              onClick={() => handleSwitchTenant(membership.tenantId)}
              selected={isActive}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemIcon>
                <IconifyIcon
                  icon={getRoleIcon(membership.role)}
                  sx={{
                    color: getRoleColor(membership.role),
                    fontSize: '1.25rem',
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={membership.name}
                secondary={
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      color: getRoleColor(membership.role),
                      textTransform: 'capitalize',
                    }}
                  >
                    {membership.role}
                  </Typography>
                }
              />
              {isActive && (
                <IconifyIcon
                  icon="material-symbols:check"
                  sx={{ color: 'success.main', ml: 1 }}
                />
              )}
            </MenuItem>
          );
        })}

        {memberships.length > 3 && (
          <>
            <Divider />
            <MenuItem
              onClick={() => {
                handleClose();
                // Could navigate to a full organization management page
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon>
                <IconifyIcon icon="material-symbols:settings" />
              </ListItemIcon>
              <ListItemText primary="Manage Organizations" />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}

export default TenantSwitcher;
