import { Grid } from '@mui/material';
import PageHeader from 'components/base/PageHeader';
import { TransactionHeaderActions } from '../header';
import type { Transaction } from 'modules/transactions';

interface TransactionHeaderSectionProps {
  transaction: Transaction;
  transactionId: string;
  fullAddress: string;
  onUploadClick: () => void;
  onGenerateReport: () => void;
  onShare: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  isGeneratingReport?: boolean;
}

const TransactionHeaderSection = ({
  transaction,
  fullAddress,
  onUploadClick,
  onGenerateReport,
  onShare,
  onDelete,
  isDeleting = false,
  isGeneratingReport = false,
}: TransactionHeaderSectionProps) => {
  return (
    <Grid size={12}>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', url: '/' },
          { label: 'Transactions', url: '/transactions' },
          { label: transaction.transactionName, active: true },
        ]}
        title={fullAddress}
        actions={
          <TransactionHeaderActions
            onUploadClick={onUploadClick}
            onGenerateReport={onGenerateReport}
            onShare={onShare}
            onDelete={onDelete}
            isDeleting={isDeleting}
            isGeneratingReport={isGeneratingReport}
          />
        }
        sx={{
          borderRadius: 2,
          border: 'none',
        }}
      />
    </Grid>
  );
};

export default TransactionHeaderSection;

