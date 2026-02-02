import { NavLink } from 'react-router';
import { Box, ListItem, ListItemButton } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SubMenuItem } from 'routes/sitemap';
import { useNavContext } from '../NavProvider';
import NavItemPopper from './NavItemPopper';
import {
  NavItemIcon,
  NavItemText,
  NavItemExpandIcon,
  NavItemCollapse,
  NavItemPopperContent,
  getNavItemButtonStyles,
  isNavItemSelected,
} from './components';
import { useNavItem } from './hooks/useNavItem';

interface NavItemProps {
  item: SubMenuItem;
  level: number;
}

const NavItem = ({ item, level }: NavItemProps) => {
  const {
    anchorEl,
    openPopperMenu,
    pathname,
    hasNestedItems,
    isStackedSideNav,
    sidenavCollapsed,
    toggleCollapseItem,
    handleClose,
    handleMouseEnter,
  } = useNavItem(item, level);

  const {
    config: { sidenavType, navColor },
  } = useSettingsContext();
  const { openItems, isNestedItemOpen } = useNavContext();

  return (
    <>
      <ListItem key={item.pathName} disablePadding sx={[isStackedSideNav && { mb: 0.25 }]}>
        <ListItemButton
          component={item.items ? 'div' : (item.path ? NavLink : 'div')}
          to={item.path}
          onClick={item.path ? toggleCollapseItem : undefined}
          disabled={!item.path && !item.items}
          onMouseEnter={sidenavCollapsed ? handleMouseEnter : undefined}
          onMouseLeave={sidenavCollapsed ? handleClose : undefined}
          aria-expanded={openPopperMenu}
          selected={isNavItemSelected({
            item,
            level,
            pathname,
            sidenavCollapsed,
            sidenavType,
            openItems,
            isNestedItemOpen,
          })}
          sx={getNavItemButtonStyles({
            item,
            level,
            pathname,
            sidenavCollapsed,
            sidenavType,
            isStackedSideNav,
            navColor,
            openPopperMenu,
            isNestedItemOpen,
            openItems,
          })}
        >
          <NavItemIcon item={item} sidenavCollapsed={sidenavCollapsed} isStackedSideNav={isStackedSideNav} />

          <Box
            sx={[
              {
                flex: 1,
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              level === 0 &&
                !isStackedSideNav &&
                sidenavCollapsed && {
                  px: 1,
                },
            ]}
          >
            <NavItemText
              item={item}
              level={level}
              sidenavCollapsed={sidenavCollapsed}
              isStackedSideNav={isStackedSideNav}
            />

            {hasNestedItems && (
              <NavItemExpandIcon
                itemPathName={item.pathName}
                level={level}
                sidenavCollapsed={sidenavCollapsed}
                isStackedSideNav={isStackedSideNav}
              />
            )}
          </Box>
          {hasNestedItems && sidenavCollapsed && !isStackedSideNav && (
            <NavItemPopper
              handleClose={handleClose}
              anchorEl={anchorEl as HTMLElement}
              open={!!anchorEl && openPopperMenu}
              level={level + 1}
            >
              <NavItemPopperContent
                item={item}
                level={level}
                openPopperMenu={openPopperMenu}
                renderNavItem={(nestedItem, nestedLevel) => (
                  <NavItem key={nestedItem.pathName} item={nestedItem} level={nestedLevel} />
                )}
              />
            </NavItemPopper>
          )}
        </ListItemButton>
      </ListItem>

      {hasNestedItems && (!sidenavCollapsed || isStackedSideNav) && (
        <NavItemCollapse
          item={item}
          level={level}
          renderNavItem={(nestedItem, nestedLevel) => (
            <NavItem key={nestedItem.pathName} item={nestedItem} level={nestedLevel} />
          )}
        />
      )}
    </>
  );
};

export default NavItem;
