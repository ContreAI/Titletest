import { Box, List, ListItemButton, ListItemIcon, ListItemText, Badge, useTheme, Drawer, IconButton, Typography } from '@mui/material';
import { LayoutDashboard, FileSignature, Building2, DollarSign, PenTool, HelpCircle, LogOut, Menu, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { PortalTabId, PortalTab, PortalSide } from 'modules/portal/types/portal.types';
import { usePortalAuthStore } from 'modules/portal-auth/store/portal-auth.store';
import { portalPaths } from 'routes/paths';
import { useState } from 'react';
import { HEADER_HEIGHT } from './PortalHeader';

const SIDEBAR_WIDTH = 220;
const MOBILE_BREAKPOINT = 'md';

interface PortalSidebarProps {
  tabs?: PortalTab[];
}

// Default tabs configuration
const defaultTabs: PortalTab[] = [
  { id: 'dashboard', label: 'Dashboard', path: '' },
  { id: 'contract', label: 'Contract', path: 'contract' },
  { id: 'title', label: 'Title', path: 'title' },
  { id: 'financial', label: 'Financial', path: 'financial' },
  { id: 'closing', label: 'Closing', path: 'closing' },
];

// Icon mapping
const tabIcons: Record<PortalTabId, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  contract: <FileSignature size={20} />,
  title: <Building2 size={20} />,
  financial: <DollarSign size={20} />,
  closing: <PenTool size={20} />,
};

const PortalSidebar = ({ tabs = defaultTabs }: PortalSidebarProps) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionId, side } = useParams<{ transactionId: string; side: string }>();
  const { logout } = usePortalAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine active tab from URL
  const pathParts = location.pathname.split('/');
  const currentTab = pathParts[3] || 'dashboard'; // After /{transactionId}/{side}/{tab?}

  const handleTabClick = (tab: PortalTab) => {
    if (transactionId && side) {
      const path = tab.path
        ? portalPaths.tab(transactionId, side as PortalSide, tab.path)
        : portalPaths.home(transactionId, side as PortalSide);
      navigate(path);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    if (transactionId && side) {
      logout(transactionId, side as PortalSide);
      navigate(portalPaths.login(transactionId, side as PortalSide));
    }
  };

  const sidebarContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        pt: { xs: 0, [MOBILE_BREAKPOINT]: `${HEADER_HEIGHT}px` },
      }}
    >
      {/* Mobile Header */}
      <Box
        sx={{
          display: { xs: 'flex', [MOBILE_BREAKPOINT]: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Menu
        </Typography>
        <IconButton size="small" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </IconButton>
      </Box>

      {/* Tab Navigation */}
      <List sx={{ flex: 1, py: 2, px: 1 }}>
        {tabs.map((tab) => {
          const isActive = tab.path === '' ? currentTab === 'dashboard' || currentTab === side : currentTab === tab.path;

          return (
            <ListItemButton
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                px: 2,
                py: 1.25,
                bgcolor: isActive ? theme.palette.primary.main : 'transparent',
                color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
                '&:hover': {
                  bgcolor: isActive ? theme.palette.primary.dark : theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                }}
              >
                {tab.badge ? (
                  <Badge
                    badgeContent={tab.badge}
                    color={tab.alert ? 'error' : 'primary'}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.65rem',
                        height: 16,
                        minWidth: 16,
                      },
                    }}
                  >
                    {tabIcons[tab.id]}
                  </Badge>
                ) : tab.alert ? (
                  <Badge
                    variant="dot"
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        animation: 'pulse 2s infinite',
                      },
                    }}
                  >
                    {tabIcons[tab.id]}
                  </Badge>
                ) : (
                  tabIcons[tab.id]
                )}
              </ListItemIcon>
              <ListItemText
                primary={tab.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 1 }}>
        <ListItemButton
          sx={{
            borderRadius: 1.5,
            px: 2,
            py: 1,
            '&:hover': { bgcolor: theme.palette.action.hover },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
            <HelpCircle size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Help"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1.5,
            px: 2,
            py: 1,
            '&:hover': {
              bgcolor: theme.palette.error.light,
              '& .MuiListItemIcon-root': { color: theme.palette.error.main },
              '& .MuiListItemText-primary': { color: theme.palette.error.main },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <IconButton
        onClick={() => setMobileOpen(true)}
        sx={{
          display: { xs: 'flex', [MOBILE_BREAKPOINT]: 'none' },
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: theme.zIndex.fab,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          boxShadow: theme.shadows[4],
          '&:hover': { bgcolor: theme.palette.primary.dark },
        }}
      >
        <Menu size={24} />
      </IconButton>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', [MOBILE_BREAKPOINT]: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', [MOBILE_BREAKPOINT]: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: SIDEBAR_WIDTH,
            height: '100vh',
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          {sidebarContent}
        </Box>
      </Box>
    </>
  );
};

export default PortalSidebar;
export { SIDEBAR_WIDTH };
