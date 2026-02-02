import { Outlet } from 'react-router';
import { DashboardHeader } from './components';
import { Box } from '@mui/material';
import { dashboardSpacing } from 'theme/spacing';
import { useChatPageContext } from 'modules/chat/hooks/useChatPageContext';

const DashboardLayout = () => {
  // Dashboard context has no transactionId, so chat searches across all brokerage transactions
  // The absence of transactionId signals brokerage-wide scope (interface composition pattern)
  useChatPageContext({
    pageType: 'dashboard',
  });

  return (
    <Box sx={{ p: dashboardSpacing.layoutPadding }}>
      <DashboardHeader />
      <Outlet />
    </Box>
  );
};

export default DashboardLayout;

