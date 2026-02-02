import { SxProps, Theme } from '@mui/material';
import { cssVarRgba } from 'lib/utils';
import { listItemTextClasses, listItemIconClasses } from '@mui/material';
import type { SubMenuItem } from 'routes/sitemap';

interface GetNavItemButtonStylesParams {
  item: SubMenuItem;
  level: number;
  pathname: string;
  sidenavCollapsed: boolean;
  sidenavType: string;
  isStackedSideNav: boolean;
  navColor: string;
  openPopperMenu: boolean;
  isNestedItemOpen: (items?: SubMenuItem[]) => boolean;
  openItems: string[];
}

export const getNavItemButtonStyles = ({
  item,
  level,
  pathname: _pathname,
  sidenavCollapsed,
  sidenavType: _sidenavType,
  isStackedSideNav,
  navColor,
  openPopperMenu,
  isNestedItemOpen: _isNestedItemOpen,
  openItems: _openItems,
}: GetNavItemButtonStylesParams): SxProps<Theme> => {
  return [
    (theme) => ({
      p: theme.spacing('3.5px', 2),
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'flex-start',
      textAlign: 'left',
      '&.Mui-selected': {
        [`& .${listItemTextClasses.primary}`]: {
          color: 'primary.main',
        },
      },
    }),
    !item.active && {
      [`& .${listItemTextClasses.primary}`]: {
        color: ({ palette }) =>
          navColor === 'vibrant'
            ? `${palette.vibrant.text.disabled} !important`
            : 'text.disabled',
      },
      [`& .${listItemIconClasses.root}`]: {
        color: ({ palette }) =>
          navColor === 'vibrant'
            ? `${palette.vibrant.text.disabled} !important`
            : 'text.disabled',
      },
    },
    sidenavCollapsed &&
      !isStackedSideNav && {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        textAlign: 'center',
        p: 1,
      },
    (!sidenavCollapsed || level !== 0) && {
      minWidth: !isStackedSideNav ? 180 : 'auto',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      textAlign: 'left',
    },
    openPopperMenu && {
      backgroundColor: ({ vars }) =>
        level === 0 && navColor === 'vibrant'
          ? cssVarRgba(vars.palette.primary.mainChannel, 0.36)
          : 'action.hover',
    },
  ];
};

export const isNavItemSelected = ({
  item,
  level,
  pathname,
  sidenavCollapsed,
  sidenavType,
  openItems,
  isNestedItemOpen,
}: {
  item: SubMenuItem;
  level: number;
  pathname: string;
  sidenavCollapsed: boolean;
  sidenavType: string;
  openItems: string[];
  isNestedItemOpen: (items?: SubMenuItem[]) => boolean;
}): boolean => {
  return (
    pathname === item.path ||
    (item.selectionPrefix && pathname!.includes(item.selectionPrefix)) ||
    (sidenavCollapsed && sidenavType === 'default' && isNestedItemOpen(item.items)) ||
    (openItems[level] !== item.pathName && isNestedItemOpen(item.items))
  );
};

