import { Box, Paper, Typography } from '@mui/material';
import { useEffect } from 'react';
import type { Deal } from 'types/deals';
import type { Transaction } from 'modules/transactions/typings/transactions.types';
import { useTransactionReports } from 'modules/transaction-reports';

interface DealSummaryPanelProps {
  deal: Deal | null;
  transaction?: Transaction | null;
}

/**
 * DealSummaryPanel - Right-side panel showing transaction summary on hover
 *
 * Matches the original design with "TRANSACTION SUMMARY" header
 * and the deal_details summary text as main content
 */
const DealSummaryPanel = ({ deal, transaction }: DealSummaryPanelProps) => {
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

  // Get deal details from transaction report
  const dealDetails = currentTransactionReport?.data?.deal_details || '';

  if (!deal && !transaction) {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 2.5,
          height: '100%',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            py: 4,
          }}
        >
          Hover over a transaction to view its summary.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'text.primary',
          }}
        >
          Transaction Summary
        </Typography>
      </Box>

      {/* Summary Content */}
      <Box sx={{ px: 2.5, py: 2 }}>
        {dealDetails ? (
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.7,
            }}
          >
            {dealDetails}
          </Typography>
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: 'text.disabled',
              fontStyle: 'italic',
            }}
          >
            No summary available for this transaction yet.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default DealSummaryPanel;

