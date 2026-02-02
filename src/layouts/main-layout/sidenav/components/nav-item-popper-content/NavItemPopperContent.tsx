import { List } from '@mui/material';
import DocSearch from '../../doc-search/DocSearch';
import type { SubMenuItem } from 'routes/sitemap';

interface NavItemPopperContentProps {
  item: SubMenuItem;
  level: number;
  openPopperMenu: boolean;
  renderNavItem: (nestedItem: SubMenuItem, nestedLevel: number) => React.ReactNode;
}

const NavItemPopperContent = ({
  item,
  level,
  openPopperMenu,
  renderNavItem,
}: NavItemPopperContentProps) => {
  return (
    <>
      {(item.pathName === 'doc-guide' || item.pathName === 'doc-components') &&
        openPopperMenu && (
          <DocSearch
            key={item.name as 'Guide' | 'Components'}
            filterGroup={item.name as 'Guide' | 'Components'}
          />
        )}
      <List
        dense
        disablePadding
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {item.items!.map((nestedItem) => renderNavItem(nestedItem, level + 1))}
      </List>
    </>
  );
};

export default NavItemPopperContent;
