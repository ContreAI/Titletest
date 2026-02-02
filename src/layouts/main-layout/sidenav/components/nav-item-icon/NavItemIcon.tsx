import { Badge, ListItemIcon, badgeClasses } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import type { SubMenuItem } from 'routes/sitemap';

interface NavItemIconProps {
  item: SubMenuItem;
  sidenavCollapsed: boolean;
  isStackedSideNav: boolean;
}

const NavItemIcon = ({ item, sidenavCollapsed, isStackedSideNav }: NavItemIconProps) => {
  if (!item.icon || isStackedSideNav) {
    return null;
  }

  return (
    <Badge
      variant="dot"
      color="warning"
      invisible={sidenavCollapsed && (item.hasNew || item.new) ? false : true}
      sx={{
        [`& .${badgeClasses.badge}`]: {
          top: 4,
          right: -8,
          transition: 'none',
        },
      }}
    >
      <ListItemIcon
        sx={(theme) => ({
          minWidth: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& .iconify': {
            fontSize: sidenavCollapsed 
              ? theme.typography.h4.fontSize 
              : theme.typography.h5.fontSize,
              lineHeight: 1,
          },
        })}
      >
        <IconifyIcon icon={item.icon} sx={item.iconSx} />
      </ListItemIcon>
    </Badge>
  );
};

export default NavItemIcon;

