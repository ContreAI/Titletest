/**
 * Portal Page
 *
 * Main shell for the title portal. Wraps content in PortalLayout
 * and provides transaction context to child components.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Box, CircularProgress, Alert, Container, Typography, Button } from '@mui/material';
import PortalLayout from 'layouts/portal-layout';
import {
  PortalTransaction,
  PortalTransactionSide,
  TitleCompany,
  PortalTab,
  PortalSide,
} from 'modules/portal/types/portal.types';

// Mock data for development - replace with API calls
const mockTransaction: PortalTransaction = {
  id: 'tx_505332',
  titleCompanyId: 'tc_001',
  qualiaOrderId: 'Q-2024-505332',
  property: {
    address: '123 Main St',
    city: 'Boise',
    state: 'ID',
    zip: '83702',
  },
  financials: {
    purchasePrice: 425000,
    earnestMoney: 10000,
    loanAmount: 340000,
    downPayment: 85000,
    loanType: 'Conventional',
  },
  dates: {
    contractDate: '2024-12-01',
    closingDate: '2025-01-15',
  },
  status: 'in_progress',
  createdAt: '2024-12-01T00:00:00Z',
  updatedAt: '2024-12-15T00:00:00Z',
};

const mockTitleCompany: TitleCompany = {
  id: 'tc_001',
  name: 'Contre Title',
  logo: '',
  address: '456 Title Ave, Boise, ID 83702',
  phone: '(208) 555-1234',
  email: 'closings@contretitle.com',
};

const mockTabs: PortalTab[] = [
  { id: 'dashboard', label: 'Dashboard', path: '', badge: 3 },
  { id: 'contract', label: 'Contract', path: 'contract' },
  { id: 'title', label: 'Title', path: 'title', badge: 1 },
  { id: 'financial', label: 'Financial', path: 'financial' },
  { id: 'closing', label: 'Closing', path: 'closing', alert: true },
];

interface PortalContextValue {
  transaction: PortalTransaction | null;
  side: PortalTransactionSide | null;
  titleCompany: TitleCompany | null;
  isLoading: boolean;
  error: string | null;
}

const PortalPage = () => {
  const { transactionId, side } = useParams<{ transactionId: string; side: string }>();
  const validSide = side === 'buyer' || side === 'seller' ? (side as PortalSide) : null;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<PortalTransaction | null>(null);
  const [titleCompany, setTitleCompany] = useState<TitleCompany | null>(null);

  useEffect(() => {
    const loadPortalData = async () => {
      if (!transactionId || !validSide) {
        setError('Invalid portal URL');
        setIsLoading(false);
        return;
      }

      try {
        // TODO: Replace with actual API call
        // const data = await portalService.getPortalData(transactionId, validSide);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Use mock data for now
        setTransaction(mockTransaction);
        setTitleCompany(mockTitleCompany);
        setIsLoading(false);
      } catch (err) {
        console.error('[Portal] Failed to load data:', err);
        setError('Failed to load portal data. Please try again.');
        setIsLoading(false);
      }
    };

    loadPortalData();
  }, [transactionId, validSide]);

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !transaction) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          >
            <Typography variant="subtitle2" gutterBottom>
              Unable to Load Portal
            </Typography>
            {error || 'Transaction data not found.'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <PortalLayout
      transaction={transaction}
      titleCompany={titleCompany || undefined}
      tabs={mockTabs}
    />
  );
};

export default PortalPage;
