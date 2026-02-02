import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { COLLAPSE_NAVBAR } from 'reducers/SettingsReducer';
import { useNavContext } from '../../NavProvider';
import type { SubMenuItem } from 'routes/sitemap';

export const useNavItem = (item: SubMenuItem, level: number) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [openPopperMenu, setOpenPopperMenu] = useState(false);
  const { pathname } = useLocation();
  const { setOpenItems, openItems, isNestedItemOpen } = useNavContext();
  const { currentBreakpoint, up } = useBreakpoints();
  const upMd = up('md');
  const upLg = up('lg');
  const {
    config: { sidenavCollapsed, sidenavType, openNavbarDrawer },
    configDispatch,
    handleDrawerToggle,
  } = useSettingsContext();

  const hasNestedItems = useMemo(
    () => Object.prototype.hasOwnProperty.call(item, 'items'),
    [item]
  );
  const isStackedSideNav = useMemo(
    () => upMd && sidenavType === 'stacked',
    [sidenavType, upMd]
  );

  const toggleCollapseItem = () => {
    if (!hasNestedItems) {
      if (openNavbarDrawer) {
        handleDrawerToggle();
      } else if (!upLg && !sidenavCollapsed) {
        configDispatch({ type: COLLAPSE_NAVBAR });
      }
      return;
    }

    if (!sidenavCollapsed || isStackedSideNav) {
      if (hasNestedItems) {
        if (openItems[level] === item.pathName) {
          setOpenItems(openItems.slice(0, level));
        } else {
          const updatedOpenItems = [...openItems];
          updatedOpenItems[level] = item.pathName;
          setOpenItems(updatedOpenItems);
        }
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenPopperMenu(false);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenPopperMenu(true);
  };

  useEffect(() => {
    if (isNestedItemOpen(item.items)) {
      setOpenItems((prev) => {
        const updatedOpenItems = [...prev];
        updatedOpenItems[level] = item.pathName;
        return updatedOpenItems;
      });
    }
  }, [currentBreakpoint, isNestedItemOpen, item.items, item.pathName, level, setOpenItems]);

  return {
    anchorEl,
    openPopperMenu,
    pathname,
    hasNestedItems,
    isStackedSideNav,
    sidenavCollapsed,
    toggleCollapseItem,
    handleClose,
    handleMouseEnter,
  };
};

