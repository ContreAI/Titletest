import IconifyIcon from 'components/base/IconifyIcon';
import { useSettingsContext } from 'providers/SettingsProvider';
import { useNavContext } from '../../../NavProvider';

interface NavItemExpandIconProps {
  itemPathName: string;
  level: number;
  sidenavCollapsed: boolean;
  isStackedSideNav: boolean;
}

const NavItemExpandIcon = ({
  itemPathName,
  level,
  sidenavCollapsed,
  isStackedSideNav,
}: NavItemExpandIconProps) => {
  const { openItems } = useNavContext();
  const {
    config: { sidenavType: _sidenavType },
  } = useSettingsContext();

  return (
    <IconifyIcon
      icon="material-symbols:expand-more-rounded"
      className="expand-icon"
      sx={[
        {
          fontSize: 12,
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shorter,
            }),
        },
        openItems[level] === itemPathName && {
          transform: 'rotate(180deg)',
        },
        sidenavCollapsed &&
          !isStackedSideNav && {
            transform: (theme) =>
              theme.direction === 'rtl' ? 'rotate(-270deg)' : 'rotate(270deg)',
            position: 'absolute',
            right: 8,
          },
      ]}
    />
  );
};

export default NavItemExpandIcon;

