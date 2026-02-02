import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Box, Paper, List, ListItemButton, ListItemText, ListItemIcon, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import PageHeader from 'components/base/PageHeader';
import IconifyIcon from 'components/base/IconifyIcon';
import ProfilePage from './profile';
import SubscriptionPage from './subscription';
import BillingHistoryPage from './billing-history';
import TeamPage from './team';
import NotificationsPage from './notifications';
import AccessibilityPage from './accessibility';
import PreferencesPage from './preferences';

type AccountTab = 'profile' | 'subscription' | 'billing-history' | 'team' | 'notifications' | 'accessibility' | 'preferences';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();

  // Get current tab from URL params or default to profile
  const getCurrentTab = useCallback((): AccountTab => {
    if (tab === 'subscription') return 'subscription';
    if (tab === 'billing-history') return 'billing-history';
    if (tab === 'team') return 'team';
    if (tab === 'notifications') return 'notifications';
    if (tab === 'accessibility') return 'accessibility';
    if (tab === 'preferences') return 'preferences';
    return 'profile';
  }, [tab]);

  const [activeTab, setActiveTab] = useState<AccountTab>(getCurrentTab());

  // Update active tab when URL changes
  useEffect(() => {
    const currentTab = getCurrentTab();
    setActiveTab(currentTab);

    // If no tab in URL, redirect to profile
    if (!tab) {
      navigate('/account-settings/profile', { replace: true });
    }
  }, [tab, navigate, getCurrentTab]);

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    const tabPath = tab === 'billing-history' ? 'billing-history' : tab;
    navigate(`/account-settings/${tabPath}`);
  };

  const tabs = [
    { id: 'profile' as AccountTab, label: 'Profile', icon: 'custom:account-profile' },
    { id: 'subscription' as AccountTab, label: 'Subscription', icon: 'custom:account-subscription' },
    { id: 'billing-history' as AccountTab, label: 'Billing History', icon: 'custom:account-billing-history' },
    { id: 'team' as AccountTab, label: 'Team', icon: 'material-symbols:group-outline-rounded' },
    { id: 'notifications' as AccountTab, label: 'Notifications', icon: 'custom:account-notifications' },
    { id: 'accessibility' as AccountTab, label: 'Accessibility', icon: 'material-symbols:accessible-forward-rounded' },
    { id: 'preferences' as AccountTab, label: 'Preferences', icon: 'material-symbols:settings-outline-rounded' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage />;
      case 'subscription':
        return <SubscriptionPage />;
      case 'billing-history':
        return <BillingHistoryPage />;
      case 'team':
        return <TeamPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'accessibility':
        return <AccessibilityPage />;
      case 'preferences':
        return <PreferencesPage />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={0}>
        {/* Header Section */}
        <Grid size={12}>
          <PageHeader
            title="Account Settings"
            subtitle="Manage your profile, subscription, and billing information."
            sx={{ pr: 0 }}
          />
        </Grid>

        {/* Main Content */}
        <Grid size={12} sx={{ px: 3.75, pt: 3.75, pb: 3.75 }}>
          <Box sx={{ display: 'flex', gap: 3.75, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>
            {/* Left Sidebar - Sub Navigation */}
            <Box sx={{ width: { xs: '100%', md: '313px' }, flexShrink: 0, display: 'flex' }}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  borderColor: 'divider',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <List 
                  sx={{ 
                    py: 2.25, // 18px
                    px: 1, // 30px
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.125,
                  }}
                >
                  {tabs.map((tab, index) => (
                    <Box key={tab.id}>
                      <ListItemButton
                        selected={activeTab === tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        sx={{
                          py: 0.5,
                          px: 2,
                          borderRadius: 0,
                          gap: 1.5,
                          '&.Mui-selected': {
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
                            borderLeft: '3px solid',
                            borderColor: 'primary.main',
                            fontWeight: 600,
                            '&:hover': {
                              bgcolor: 'primary.lighter',
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'primary.main',
                            },
                          },
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 'auto',
                            color: activeTab === tab.id ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          <IconifyIcon icon={tab.icon} sx={{ fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={tab.label}
                          slotProps={{
                            primary: {
                              variant: 'body1',
                              fontWeight: activeTab === tab.id ? 600 : 400,
                            },
                          }}
                        />
                      </ListItemButton>
                      {index < tabs.length - 1 && <Divider sx={{ m: 0 }} />}
                    </Box>
                  ))}
                </List>
              </Paper>
            </Box>

            {/* Right Content Area */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
              <Paper
                elevation={0}
                data-testid="settings-content"
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  borderColor: 'divider',
                  p: 3.75,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3.75,
                  width: '100%',
                }}
              >
                {renderTabContent()}
              </Paper>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountSettings;

