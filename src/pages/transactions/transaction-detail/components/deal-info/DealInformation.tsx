import { Button, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import InfoRow from './InfoRow';
import { useTransactionReports } from 'modules/transaction-reports';

interface DealInformationProps {
  onModify?: () => void;
}

const DealInformation = ({ onModify }: DealInformationProps) => {
  const { currentTransactionReport } = useTransactionReports();
  const reportData = currentTransactionReport?.data || {};
  const status = currentTransactionReport?.status;

  // Debug logging
  console.log('[DealInformation] Current report:', currentTransactionReport);
  console.log('[DealInformation] Report data:', reportData);
  console.log('[DealInformation] Status:', status);

  // Helper function to format date strings
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    return dateStr;
  };

  // Helper function to format price
  const formatPrice = (priceStr: string | null | undefined): string => {
    if (!priceStr) return '';
    // If it's already formatted, return as is, otherwise try to format
    if (priceStr.includes('$')) return priceStr;
    const numPrice = parseFloat(priceStr);
    if (!isNaN(numPrice)) {
      return `$${numPrice.toLocaleString()}`;
    }
    return priceStr;
  };

  // Helper function to format text values
  const formatText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text;
  };

  // Get current stage from status or data
  const currentStage = status || reportData.current_stage || '';

  return (
    <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', py: 2, mb: 2}}>
      <Grid container spacing={0}>
        {/* Header */}
        <Grid size={12} sx={{ bgcolor: 'background.paper', px: 2, pb: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" >
              Deal Information
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<IconifyIcon icon="material-symbols:edit-outline" sx={{ fontSize: 16 }} />}
              onClick={onModify}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                bgcolor: 'background.elevation1',
                color: 'text.primary',
                px: 2,
                py: 0.75,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: 'action.hover',
                  boxShadow: 'none',
                },
              }}
            >
              Modify
            </Button>
          </Stack>
        </Grid>
        </Grid>
        <Grid container spacing={0} px={2}>
        {/* Deal Details Description */}
        <Grid size={12} sx={{ bgcolor: 'background.paper' }}>
          <Stack spacing={1} direction="column" px={1}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Deal Details:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {formatText(reportData.deal_details)}
            </Typography>
          </Stack>
        </Grid>

        {/* Section 1: Deal Timelines */}
        <Grid size={12} sx={{ bgcolor: 'background.neutral' }}  mt={1} borderRadius={1}>
          <Stack spacing={0.75} direction="column">
            {currentStage && <InfoRow label="Current Stage:" value={currentStage} variant="chip" chipColor="text.tertiary" fontColor="common.white" />}
            {reportData.effective_contract_date && <InfoRow label="Effective Contract Date:" value={formatDate(reportData.effective_contract_date)} variant="text" />}
            {reportData.earnest_money_due && <InfoRow label="Earnest Money Due:" value={formatDate(reportData.earnest_money_due)} variant="text" />}
            {reportData.inspection_deadline && <InfoRow label="Inspection Deadline:" value={formatDate(reportData.inspection_deadline)} variant="text" />}
            {reportData.financing_deadline && <InfoRow label="Financing Deadline:" value={formatDate(reportData.financing_deadline)} variant="text" />}
            {reportData.financial_deadline && <InfoRow label="Financial Deadline:" value={formatDate(reportData.financial_deadline)} variant="text" />}
            {reportData.closing_date && <InfoRow label="Closing Date:" value={formatDate(reportData.closing_date)} variant="text" />}
          </Stack>
        </Grid>

        {/* Section 2: Party Information */}
        {reportData.client_name && (
          <Grid size={12} sx={{ bgcolor: 'background.paper' }}  mt={1} borderRadius={1}>
            <Stack spacing={0.75} direction="column">
              <InfoRow label="Client Name:" value={formatText(reportData.client_name)} variant="text" />
            </Stack>
          </Grid>
        )}

        {(reportData.other_party || reportData.purchase_price) && (
          <Grid size={12} sx={{ bgcolor: 'background.neutral' }}  mt={1} borderRadius={1}>
            <Stack spacing={0.75} direction="column">
              {reportData.other_party && <InfoRow label="Other Party:" value={formatText(reportData.other_party)} variant="text" />}
              {reportData.purchase_price && <InfoRow label="Purchase Price:" value={formatPrice(reportData.purchase_price)} variant="chip" />}
            </Stack>
          </Grid>
        )}

        {/* Section 3: Title and Disclosure */}
        {reportData.title_company && (
          <Grid size={12} sx={{ bgcolor: 'background.paper' }}  mt={1} borderRadius={1}>
            <Stack spacing={0.75} direction="column">
              <InfoRow label="Title Company:" value={formatText(reportData.title_company)} variant="chip" />
            </Stack>
          </Grid>
        )}

        {reportData.title_commitment_date && (
          <Grid size={12} sx={{ bgcolor: 'background.neutral' }}  mt={1} borderRadius={1}>
            <Stack spacing={0.75} direction="column">
              <InfoRow label="Title Commitment:" value={formatDate(reportData.title_commitment_date)} variant="chip" />
            </Stack>
          </Grid>
        )}

        {reportData.seller_disclosure_date && (
          <Grid size={12} sx={{ bgcolor: 'background.paper' }}  mt={1} borderRadius={1}>
            <Stack spacing={0.75} direction="column">
              <InfoRow label="Seller Disclosure:" value={formatDate(reportData.seller_disclosure_date)} variant="text" />
            </Stack>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default DealInformation;
