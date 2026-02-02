import { useState, useCallback, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import {
  BillingHistoryHeader,
  InvoicesTable,
  BillingPagination,
  type Invoice,
} from './components';
import { useBilling } from 'modules/billing/hooks/useBilling';

const BillingHistoryPage = () => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const {
    formattedInvoices,
    pagination,
    isLoading,
    error,
    fetchInvoices,
  } = useBilling();

  // Fetch invoices when page changes
  useEffect(() => {
    fetchInvoices({ page, limit: rowsPerPage }).catch(() => {
      // Error already handled in store
    });
  }, [page, rowsPerPage, fetchInvoices]);

  const handleDownload = useCallback((invoice: Invoice) => {
    // Find the original invoice to get the download URL
    const originalInvoice = formattedInvoices.find((i) => i.id === invoice.id);
    if (originalInvoice?.downloadUrl) {
      window.open(originalInvoice.downloadUrl, '_blank');
    } else {
      console.log('Downloading invoice:', invoice.invoiceNumber);
      // TODO: Implement fallback download functionality
    }
  }, [formattedInvoices]);

  const handleDownloadAll = useCallback(() => {
    console.log('Downloading all invoices');
    // TODO: Implement download all functionality
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  if (isLoading && formattedInvoices.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && formattedInvoices.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load billing history. Please try again later.
        </Alert>
      </Box>
    );
  }

  // Map formatted invoices to the component's Invoice type
  const invoices: Invoice[] = formattedInvoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    date: inv.date,
    plan: inv.plan,
    amount: inv.amount,
    status: inv.status,
  }));

  const totalPages = pagination?.totalPages || Math.ceil(invoices.length / rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.75 }}>
      <BillingHistoryHeader onDownloadAll={handleDownloadAll} />
      <InvoicesTable invoices={invoices} onDownload={handleDownload} />
      <BillingPagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Box>
  );
};

export default BillingHistoryPage;
