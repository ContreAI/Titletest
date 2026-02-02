import {
  Box,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';

const BillingHistoryPreview = () => {
  const navigate = useNavigate();
  const invoices = [
    { invoiceNumber: 'INV-2025-00123', date: 'Sep 28, 2025', amount: 99.0, status: 'paid' },
    { invoiceNumber: 'INV-2025-00115', date: 'Aug 28, 2025', amount: 99.0, status: 'paid' },
    { invoiceNumber: 'INV-2025-00108', date: 'Jul 28, 2025', amount: 99.0, status: 'paid' },
    { invoiceNumber: 'INV-2025-00097', date: 'Jun 28, 2025', amount: 99.0, status: 'paid' },
  ];

  const handleDownload = (invoiceNumber: string) => {
    console.log('Downloading invoice:', invoiceNumber);
    // TODO: Implement download functionality
  };

  const handleViewAll = () => {
    navigate(paths.accountSettingsBillingHistory);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography
            variant="body1"
            sx={{
              fontFamily: (theme) => theme.typography.fontFamily,
              fontWeight: 600,
              fontSize: '1.125rem',
              mb: 0.5,
            }}
          >
            Billing History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Download your past invoices.
          </Typography>
        </Box>
        <Button
          variant="text"
          size="small"
          onClick={handleViewAll}
          sx={{ textTransform: 'none' }}
        >
          View All
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell
                sx={{
                  fontFamily: (theme) => theme.typography.fontFamily,
                  fontWeight: 600,
                  fontSize: (theme) => theme.typography.subtitle2.fontSize,
                  px: 2,
                  py: 1.5,
                }}
              >
                Invoice
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: (theme) => theme.typography.fontFamily,
                  fontWeight: 600,
                  fontSize: (theme) => theme.typography.subtitle2.fontSize,
                  px: 2,
                  py: 1.5,
                }}
              >
                Date
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: (theme) => theme.typography.fontFamily,
                  fontWeight: 600,
                  fontSize: (theme) => theme.typography.subtitle2.fontSize,
                  px: 2,
                  py: 1.5,
                }}
              >
                Amount
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: (theme) => theme.typography.fontFamily,
                  fontWeight: 600,
                  fontSize: (theme) => theme.typography.subtitle2.fontSize,
                  px: 2,
                  py: 1.5,
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: (theme) => theme.typography.fontFamily,
                  fontWeight: 600,
                  fontSize: (theme) => theme.typography.subtitle2.fontSize,
                  px: 2,
                  py: 1.5,
                }}
                align="right"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice, index) => (
              <TableRow key={index} hover>
                <TableCell
                  sx={{
                    fontFamily: (theme) => theme.typography.fontFamily,
                    fontWeight: 400,
                    fontSize: (theme) => theme.typography.body2.fontSize,
                    px: 2,
                    py: 1.5,
                    color: (theme) => theme.palette.text.primary,
                  }}
                >
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: (theme) => theme.typography.fontFamily,
                    fontWeight: 400,
                    fontSize: (theme) => theme.typography.body2.fontSize,
                    px: 2,
                    py: 1.5,
                    color: (theme) => theme.palette.text.primary,
                  }}
                >
                  {invoice.date}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: (theme) => theme.typography.fontFamily,
                    fontWeight: 400,
                    fontSize: (theme) => theme.typography.body2.fontSize,
                    px: 2,
                    py: 1.5,
                    color: (theme) => theme.palette.text.primary,
                  }}
                >
                  ${invoice.amount.toFixed(2)}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: (theme) => theme.typography.fontFamily,
                    fontWeight: 400,
                    fontSize: (theme) => theme.typography.body2.fontSize,
                    px: 2,
                    py: 1.5,
                    color: (theme) => theme.palette.text.primary,
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'success.lighter',
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: (theme) => theme.typography.fontFamily,
                        color: 'success.main',
                        fontWeight: 500,
                      }}
                    >
                      Paid
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<IconifyIcon icon="custom:account-download" />}
                    onClick={() => handleDownload(invoice.invoiceNumber)}
                    sx={{ textTransform: 'none' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: (theme) => theme.typography.fontFamily,
                        fontWeight: 400,
                      }}
                    >
                      Download
                    </Typography>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BillingHistoryPreview;

