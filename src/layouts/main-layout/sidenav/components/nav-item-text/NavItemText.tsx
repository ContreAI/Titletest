import { useTranslation } from 'react-i18next';
import { Badge, Chip, listItemTextClasses, badgeClasses } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import type { SubMenuItem } from 'routes/sitemap';

interface NavItemTextProps {
  item: SubMenuItem;
  level: number;
  sidenavCollapsed: boolean;
  isStackedSideNav: boolean;
}

const NavItemText = ({ item, level, sidenavCollapsed, isStackedSideNav }: NavItemTextProps) => {
  const { t } = useTranslation();
  const showText = !sidenavCollapsed || level > 0 || isStackedSideNav;

  return (
    <ListItemText
      sx={{
        [`& .${listItemTextClasses.primary}`]: {
          typography: 'body2',
          fontWeight: 'medium',
          lineHeight: 1.3,
          color: level === 0 ? 'text.primary' : 'text.secondary',
          ...(showText
            ? { whiteSpace: 'nowrap' }
            : { whiteSpace: 'normal', lineClamp: 1, wordBreak: 'break-all' }),
        },
      }}
    >
      {showText && item.hasNew ? (
        <Badge
          variant="dot"
          color="warning"
          sx={{ [`& .${badgeClasses.badge}`]: { top: 6, right: -8 } }}
        >
          {t(item.key || item.name)}
        </Badge>
      ) : (
        t(item.key || item.name)
      )}

      {item.new && showText && (
        <Chip
          size="xsmall"
          label="new"
          color="warning"
          sx={{ textTransform: 'capitalize', ml: 1 }}
        />
      )}
    </ListItemText>
  );
};

export default NavItemText;

