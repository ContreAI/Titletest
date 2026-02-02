/**
 * Transaction Select Dialog
 *
 * Dialog for selecting a transaction to move a document to.
 * Used when resolving address mismatch alerts.
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTransactions } from 'modules/transactions';
import type { Transaction } from 'modules/transactions';

interface TransactionSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (transactionId: string) => void;
  currentTransactionId?: string;
  documentName: string;
  isLoading?: boolean;
}

const TransactionSelectDialog = ({
  open,
  onClose,
  onSelect,
  currentTransactionId,
  documentName,
  isLoading = false,
}: TransactionSelectDialogProps) => {
  const theme = useTheme();
  const { transactions, fetchTransactions, isLoading: isLoadingTransactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch transactions when dialog opens
  useEffect(() => {
    if (open) {
      fetchTransactions();
      setSelectedId(null);
      setSearchQuery('');
    }
  }, [open, fetchTransactions]);

  // Filter transactions (exclude current transaction)
  const filteredTransactions = transactions
    .filter((t) => t.id !== currentTransactionId)
    .filter((t) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const address = `${t.propertyAddress?.streetAddress} ${t.propertyAddress?.city} ${t.propertyAddress?.state}`.toLowerCase();
      return (
        t.transactionName?.toLowerCase().includes(query) ||
        address.includes(query)
      );
    });

  const handleSelect = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  const formatAddress = (transaction: Transaction) => {
    const addr = transaction.propertyAddress;
    if (!addr?.streetAddress) return 'No address';
    return `${addr.streetAddress}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
      case 'closed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconifyIcon icon="mdi:folder-move" sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Move Document to Transaction</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Select a transaction to move "{documentName}" to
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="mdi:magnify" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Transaction List */}
        {isLoadingTransactions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filteredTransactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <IconifyIcon
              icon="mdi:folder-search"
              sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No transactions match your search' : 'No other transactions available'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredTransactions.map((transaction) => (
              <ListItemButton
                key={transaction.id}
                selected={selectedId === transaction.id}
                onClick={() => setSelectedId(transaction.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  border: '1px solid',
                  borderColor: selectedId === transaction.id ? 'primary.main' : 'divider',
                  bgcolor: selectedId === transaction.id
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <IconifyIcon
                    icon={selectedId === transaction.id ? 'mdi:check-circle' : 'mdi:folder-outline'}
                    sx={{
                      color: selectedId === transaction.id ? 'primary.main' : 'text.secondary',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {transaction.transactionName || 'Unnamed Transaction'}
                      </Typography>
                      <Chip
                        label={transaction.status}
                        size="small"
                        color={getStatusColor(transaction.status)}
                        sx={{ height: 20, fontSize: '0.6875rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {formatAddress(transaction)}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSelect}
          disabled={!selectedId || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <IconifyIcon icon="mdi:folder-move" />}
        >
          {isLoading ? 'Moving...' : 'Move Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionSelectDialog;
