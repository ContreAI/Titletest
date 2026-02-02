import { Button } from '@mui/material';
import SectionHeader from 'components/base/SectionHeader';
import IconifyIcon from 'components/base/IconifyIcon';

interface BillingHistoryHeaderProps {
  onDownloadAll: () => void;
}

const BillingHistoryHeader = ({ onDownloadAll }: BillingHistoryHeaderProps) => {
  return (
    <SectionHeader
      title="Billing History"
      description="Download your past invoices and payment records."
      action={
        <Button
          variant="outlined"
          startIcon={<IconifyIcon icon="custom:account-download" />}
          onClick={onDownloadAll}
          sx={{ textTransform: 'none' }}
        >
          Download All
        </Button>
      }
    />
  );
};

export default BillingHistoryHeader;

