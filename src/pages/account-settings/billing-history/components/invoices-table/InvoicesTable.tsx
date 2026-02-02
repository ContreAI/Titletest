import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  plan: string;
  amount: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' | 'pending' | 'failed';
}

interface InvoicesTableProps {
  invoices: Invoice[];
  onDownload: (invoice: Invoice) => void;
}

const InvoicesTable = ({ invoices, onDownload }: InvoicesTableProps) => {
  return (
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
              Plan
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
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} hover>
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
                {invoice.plan}
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
                  px: 2,
                  py: 1.5,
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
                  onClick={() => onDownload(invoice)}
                  sx={{
                    textTransform: 'none',
                    fontFamily: (theme) => theme.typography.fontFamily,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: (theme) => theme.typography.fontFamily,
                      fontWeight: 400,
                    }}
                  >
                    PDF
                  </Typography>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvoicesTable;

