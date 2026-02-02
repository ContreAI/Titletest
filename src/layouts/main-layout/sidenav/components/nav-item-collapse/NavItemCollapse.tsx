import { Collapse, List } from '@mui/material';
import { useNavContext } from '../../../NavProvider';
import type { SubMenuItem } from 'routes/sitemap';

interface NavItemCollapseProps {
  item: SubMenuItem;
  level: number;
  renderNavItem: (nestedItem: SubMenuItem, nestedLevel: number) => React.ReactNode;
}

const NavItemCollapse = ({ item, level, renderNavItem }: NavItemCollapseProps) => {
  const { openItems } = useNavContext();

  return (
    <Collapse in={openItems[level] === item.pathName} timeout="auto" unmountOnExit>
      <List
        dense
        disablePadding
        sx={{ pl: level === 0 ? 4 : 2, display: 'flex', flexDirection: 'column', gap: '2px' }}
      >
        {item.items!.map((nestedItem) => renderNavItem(nestedItem, level + 1))}
      </List>
    </Collapse>
  );
};

export default NavItemCollapse;

