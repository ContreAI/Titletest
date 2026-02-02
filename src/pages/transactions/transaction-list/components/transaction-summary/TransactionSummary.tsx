import { Box, Paper, Typography, Stack } from '@mui/material';
import { useEffect } from 'react';
import type { Deal } from 'types/deals';
import type { Transaction } from 'modules/transactions';
import { useTransactionReports } from 'modules/transaction-reports';

interface TransactionSummaryProps {
  deal: Deal | null;
  transaction?: Transaction | null;
}

const TransactionSummary = ({ deal, transaction }: TransactionSummaryProps) => {
  const { currentTransactionReport, fetchTransactionReport } = useTransactionReports();

  // Fetch transaction report when transaction changes
  useEffect(() => {
    if (transaction?.id) {
      fetchTransactionReport(transaction.id).catch((error) => {
        // Report might not exist yet
        console.log('Transaction report not available for summary:', error);
      });
    }
  }, [transaction?.id, fetchTransactionReport]);

  // Get summary content - use deal_details from transaction report
  const getSummaryContent = () => {
    if (!deal && !transaction) {
      return 'Hover over a transaction to view its summary.';
    }

    // Use deal_details from transaction report, or show blank if not available
    if (currentTransactionReport?.data?.deal_details) {
      return currentTransactionReport.data.deal_details;
    }

    // If no deal_details, show blank
    return '';
  };

  return (
    <Paper
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack spacing={2} direction="column">
        <Typography variant="h5" >
          Transaction Summary
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            {getSummaryContent()}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default TransactionSummary;

