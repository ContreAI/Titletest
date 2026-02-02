import { Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router';
import PortalHeader, { HEADER_HEIGHT } from './PortalHeader';
import PortalSidebar, { SIDEBAR_WIDTH } from './PortalSidebar';
import { PortalTransaction, TitleCompany, PortalTab } from 'modules/portal/types/portal.types';

interface PortalLayoutProps {
  transaction?: PortalTransaction;
  titleCompany?: TitleCompany;
  tabs?: PortalTab[];
}

/**
 * PortalLayout - Standalone layout for title portals
 *
 * Features:
 * - Compact header with logo, property address, and actions
 * - Left sidebar with vertical tab navigation
 * - Main content area for tab content
 * - NO standard AppBar, sidenav, or topnav from MainLayout
 */
const PortalLayout = ({ transaction, titleCompany, tabs }: PortalLayoutProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Header */}
      <PortalHeader
        transaction={transaction}
        titleCompanyLogo={titleCompany?.logo}
        titleCompanyName={titleCompany?.name}
      />

      {/* Sidebar */}
      <PortalSidebar tabs={tabs} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          pt: `${HEADER_HEIGHT}px`,
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default PortalLayout;
export { HEADER_HEIGHT, SIDEBAR_WIDTH };
