import { Box } from '@mui/material';
import type { Transaction } from 'modules/transactions';
import type { TransactionReport } from 'modules/transaction-reports';
import DetailRow from './DetailRow';
import SectionHeader from './SectionHeader';
import { formatDate } from '../utils/date.utils';

interface DealDetailsContentProps {
  transaction: Transaction | null;
  report: TransactionReport | null;
}

const DealDetailsContent = ({ transaction, report }: DealDetailsContentProps) => {
  const reportData = report?.data || {};

  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        px: 2,
        py: 2.5,
      }}
    >
      {/* Responsive grid: 1 col mobile, 3 cols on md+ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: { xs: 3, md: 4 },
        }}
      >
        {/* Column 1 – Parties & Property */}
        <Box>
          <SectionHeader>Parties</SectionHeader>
          <Box component="dl" sx={{ m: 0, mb: 2 }}>
            <DetailRow label="Client" value={reportData.client_name} />
            <DetailRow label="Other party" value={reportData.other_party} />
            <DetailRow
              label="Representing"
              value={
                transaction?.representing
                  ? transaction.representing.charAt(0).toUpperCase() +
                    transaction.representing.slice(1)
                  : null
              }
            />
          </Box>

          <SectionHeader>Property</SectionHeader>
          <Box component="dl" sx={{ m: 0 }}>
            <DetailRow label="Address" value={transaction?.propertyAddress?.streetAddress} />
            <DetailRow label="City" value={transaction?.propertyAddress?.city} />
            <DetailRow label="State" value={transaction?.propertyAddress?.state} />
            <DetailRow label="Zip code" value={transaction?.propertyAddress?.zipCode} />
            <DetailRow label="Property type" value={transaction?.propertyType} />
          </Box>
        </Box>

        {/* Column 2 – Key Dates & Financial */}
        <Box>
          <SectionHeader>Key Dates</SectionHeader>
          <Box component="dl" sx={{ m: 0, mb: 2 }}>
            <DetailRow label="Contract date" value={formatDate(reportData.effective_contract_date)} />
            <DetailRow label="Earnest money due" value={formatDate(reportData.earnest_money_due)} />
            <DetailRow label="Inspection deadline" value={formatDate(reportData.inspection_deadline)} />
            <DetailRow label="Financing deadline" value={formatDate(reportData.financing_deadline || reportData.financial_deadline)} />
            <DetailRow label="Closing date" value={formatDate(reportData.closing_date)} />
          </Box>

          <SectionHeader>Financial</SectionHeader>
          <Box component="dl" sx={{ m: 0 }}>
            <DetailRow label="Purchase price" value={reportData.purchase_price} />
            <DetailRow label="Current stage" value={reportData.current_stage} />
          </Box>
        </Box>

        {/* Column 3 – Title & Escrow, System */}
        <Box>
          {/* Title & Escrow */}
          <SectionHeader>Title & Escrow</SectionHeader>
          <Box component="dl" sx={{ m: 0, mb: 2 }}>
            <DetailRow label="Title company" value={reportData.title_company} />
            <DetailRow label="Title commitment" value={formatDate(reportData.title_commitment_date)} />
            <DetailRow label="Seller disclosure" value={formatDate(reportData.seller_disclosure_date)} />
          </Box>

          {/* System */}
          <SectionHeader>System</SectionHeader>
          <Box component="dl" sx={{ m: 0 }}>
            <DetailRow label="Transaction name" value={transaction?.transactionName} />
            <DetailRow label="Transaction ID" value={transaction?.id} />
            <DetailRow label="Created" value={formatDate(transaction?.createdAt)} />
            <DetailRow label="Last updated" value={formatDate(transaction?.updatedAt)} />
            <DetailRow
              label="Status"
              value={
                transaction?.status
                  ? transaction.status
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())
                  : null
              }
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DealDetailsContent;

