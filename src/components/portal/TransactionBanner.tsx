/**
 * Transaction Banner
 *
 * Displays key transaction information:
 * - Property address
 * - Closing date with countdown
 * - Transaction status
 * - Side indicator (buyer/seller)
 */

import { Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { PortalTransaction, PortalSide, TransactionStatus } from 'modules/portal/types/portal.types';
import { differenceInDays, parseISO, format } from 'date-fns';

interface TransactionBannerProps {
  transaction: PortalTransaction;
  side: PortalSide;
}

const getStatusInfo = (status: TransactionStatus) => {
  switch (status) {
    case 'pending':
      return { label: 'Pending', color: 'default' as const };
    case 'in_progress':
      return { label: 'In Progress', color: 'primary' as const };
    case 'closing_scheduled':
      return { label: 'Closing Scheduled', color: 'info' as const };
    case 'closed':
      return { label: 'Closed', color: 'success' as const };
    case 'cancelled':
      return { label: 'Cancelled', color: 'error' as const };
    default:
      return { label: status, color: 'default' as const };
  }
};

const TransactionBanner = ({ transaction, side }: TransactionBannerProps) => {
  const theme = useTheme();

  const statusInfo = getStatusInfo(transaction.status);
  const closingDate = parseISO(transaction.dates.closingDate);
  const daysUntilClosing = differenceInDays(closingDate, new Date());
  const formattedClosingDate = format(closingDate, 'MMMM d, yyyy');

  const propertyAddress = `${transaction.property.address}, ${transaction.property.city}, ${transaction.property.state} ${transaction.property.zip}`;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        mb: 3,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
      >
        {/* Property Address */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <MapPin size={18} color={theme.palette.text.secondary} />
            <Typography variant="h6" fontWeight={600}>
              {propertyAddress}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip
              label={statusInfo.label}
              size="small"
              color={statusInfo.color}
            />
            <Chip
              label={side === 'buyer' ? 'Buyer Agent' : 'Seller Agent'}
              size="small"
              variant="outlined"
              color={side === 'buyer' ? 'primary' : 'secondary'}
            />
            {transaction.qualiaOrderId && (
              <Chip
                label={`Order: ${transaction.qualiaOrderId}`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        {/* Closing Date */}
        <Box
          sx={{
            textAlign: { xs: 'left', md: 'right' },
            minWidth: 200,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Calendar size={18} color={theme.palette.text.secondary} />
            <Typography variant="body2" color="text.secondary">
              Closing Date
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={600}>
            {formattedClosingDate}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Clock size={14} color={daysUntilClosing <= 7 ? theme.palette.warning.main : theme.palette.text.secondary} />
            <Typography
              variant="body2"
              color={daysUntilClosing <= 7 ? 'warning.main' : 'text.secondary'}
              fontWeight={daysUntilClosing <= 7 ? 600 : 400}
            >
              {daysUntilClosing > 0 ? `${daysUntilClosing} days remaining` : daysUntilClosing === 0 ? 'Closing today!' : 'Closing date passed'}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default TransactionBanner;
