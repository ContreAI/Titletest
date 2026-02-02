import { useEffect, useMemo } from 'react';
import { Card, CardContent, Stack, Typography, Box, CircularProgress } from '@mui/material';
import { dashboardSpacing } from 'theme/spacing';
import { useTransactions } from 'modules/transactions';
import { useTransactionReports } from 'modules/transaction-reports';
import { useTransactionReportsStore } from 'modules/transaction-reports/store/transaction-reports.store';
import { Deal, DealStage } from 'types/deals';
import OngoingDealsHeader from './OngoingDealsHeader';
import OngoingDealCard from './OngoingDealCard';

/**
 * Helper function to compute stages from report status
 */
const computeStagesFromStatus = (status: string | null | undefined): DealStage[] => {
  // Default to "Active" if status is null
  const reportStatus = status || 'Active';

  const stageMap: Record<string, number> = {
    'Active': 0,
    'Post EM': 1,
    'Inspection Cleared': 2,
    'Ready for Close': 3,
  };

  const currentStageIndex = stageMap[reportStatus] ?? 0; // Default to 0 (Active) if status not recognized

  return [
    { name: 'Active', completed: currentStageIndex >= 0 },
    { name: 'Post EM', completed: currentStageIndex >= 1 },
    { name: 'Inspection Cleared', completed: currentStageIndex >= 2 },
    { name: 'Ready for Close', completed: currentStageIndex >= 3 },
  ];
};

const OngoingDeals = () => {
  const { transactions, isLoading, fetchTransactions } = useTransactions();
  const { transactionReports, fetchTransactionReport } = useTransactionReports();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch reports for all transactions
  const transactionIds = useMemo(() => transactions.map(t => t.id), [transactions]);

  useEffect(() => {
    transactionIds.forEach((transactionId) => {
      const reports = useTransactionReportsStore.getState().transactionReports;
      if (!reports.has(transactionId)) {
        fetchTransactionReport(transactionId).catch(() => {
          // Silently fail - report might not exist yet
        });
      }
    });
  }, [transactionIds, fetchTransactionReport]);

  // Convert real transactions to Deal format using report status
  const deals = useMemo((): Deal[] => {
    const convertedDeals = transactions
      .filter((t) => t.status !== 'cancelled' && t.status !== 'completed')
      .map((transaction) => {
        // Get transaction report status if available, otherwise use transaction status
        const report = transactionReports.get(transaction.id);
        const status = report?.status || null;

        // Compute stages from report status (prioritize report status)
        const stages = computeStagesFromStatus(status);

        // Get purchase price from report if available
        let price = 0;
        if (report?.data?.purchase_price) {
          const priceStr = report.data.purchase_price.replace(/[^0-9.]/g, '');
          const parsedPrice = parseFloat(priceStr);
          if (!isNaN(parsedPrice)) {
            price = parsedPrice;
          }
        }

        // Get closing date from report if available
        let closingDate = 'TBD';
        if (report?.data?.closing_date) {
          closingDate = report.data.closing_date;
        } else if (transaction.createdAt) {
          closingDate = new Date(transaction.createdAt).toLocaleDateString();
        }

        // Format full address
        let fullAddress = transaction.transactionName;
        const addr = transaction.propertyAddress;
        if (addr) {
          const addressParts: string[] = [];

          if (addr.streetAddress) addressParts.push(addr.streetAddress);
          if (addr.city) addressParts.push(addr.city);
          if (addr.state) addressParts.push(addr.state);
          if (addr.zipCode) addressParts.push(addr.zipCode);

          if (addressParts.length > 0) {
            fullAddress = addressParts.join(', ');
          }
        }

        return {
          id: transaction.id,
          title: fullAddress,
          price,
          closingDate,
          stages,
          // Pass through property address for PropertyMapAvatar
          propertyAddress: addr?.streetAddress
            ? {
                streetAddress: addr.streetAddress,
                city: addr.city,
                state: addr.state,
                zipCode: addr.zipCode,
              }
            : undefined,
          // Pass through geocoding data for PropertyMapAvatar
          geocoding: transaction.geocoding
            ? {
                status: transaction.geocoding.status,
                confidence: transaction.geocoding.confidence,
                coordinates: transaction.geocoding.coordinates,
              }
            : undefined,
        };
      });

    console.log('[OngoingDeals] Converted deals:', convertedDeals);
    return convertedDeals;
  }, [transactions, transactionReports]);

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 2 }}>
        <CardContent sx={{ p: dashboardSpacing.cardPaddingSm, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: dashboardSpacing.cardPaddingSm }}>
        <OngoingDealsHeader />
        <Stack spacing={dashboardSpacing.contentGapSm} direction="column" sx={{ mt: dashboardSpacing.contentGapSm }}>
          {deals.length > 0 ? (
            deals.map((deal) => (
              <OngoingDealCard key={deal.id} deal={deal} />
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No ongoing deals. Click "New Deal" to get started.
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OngoingDeals;
