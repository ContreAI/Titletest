import { useState } from 'react';
import { Box, Button, Stack, Typography, Menu, MenuItem, ToggleButton, ToggleButtonGroup } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTenant } from 'modules/tenant';
import type { DealStageName } from 'types/deals';
import type { TransactionScope } from 'modules/transactions/typings/transactions.types';

interface DealsListHeaderProps {
  totalDeals: number;
  onSort?: (sortBy: string) => void;
  onFilter?: (filter: DealStageName | 'all') => void;
  transactionScope?: TransactionScope;
  onScopeChange?: (scope: TransactionScope) => void;
}

/**
 * DealsListHeader - Section header with title, count, and controls
 *
 * Features:
 * - Uppercase section title "ONGOING DEALS"
 * - Deal count display
 * - Scope toggle (My Transactions / All Brokerage) for admin users
 * - Sort dropdown (Date, Price, Stage, Name)
 * - Filter dropdown (All, Active, Post EM, etc.)
 */
const DealsListHeader = ({ totalDeals, onSort, onFilter, transactionScope = 'mine', onScopeChange }: DealsListHeaderProps) => {
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const { hasRole } = useTenant();

  // Only show brokerage option if user has admin/broker/owner role
  const canViewBrokerageTransactions = hasRole(['owner', 'admin', 'broker']);

  const handleSort = (sortBy: string) => {
    onSort?.(sortBy);
    setSortAnchorEl(null);
  };

  const handleFilter = (filter: DealStageName | 'all') => {
    onFilter?.(filter);
    setFilterAnchorEl(null);
  };

  const handleScopeChange = (_event: React.MouseEvent<HTMLElement>, newScope: TransactionScope | null) => {
    if (newScope !== null) {
      onScopeChange?.(newScope);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Left: Title and Count */}
      <Stack direction="row" spacing={2} alignItems="baseline">
        <Typography
          component="h2"
          variant="overline"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          Ongoing Deals
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
          }}
        >
          {totalDeals} total
        </Typography>
      </Stack>

      {/* Right: Scope Toggle, Sort and Filter Controls */}
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Scope Toggle - only show if user has brokerage admin permission */}
        {canViewBrokerageTransactions && (
          <ToggleButtonGroup
            value={transactionScope}
            exclusive
            onChange={handleScopeChange}
            size="small"
            sx={{
              mr: 1,
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontSize: '12px',
                py: 0.5,
                px: 1.5,
                borderColor: 'divider',
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              },
            }}
          >
            <ToggleButton value="mine">My Transactions</ToggleButton>
            <ToggleButton value="brokerage">All Brokerage</ToggleButton>
          </ToggleButtonGroup>
        )}
        {/* Sort by */}
        <Button
          size="small"
          variant="outlined"
          startIcon={<IconifyIcon icon="material-symbols:swap-vert" sx={{ fontSize: 16 }} />}
          endIcon={<IconifyIcon icon="material-symbols:arrow-drop-down" sx={{ fontSize: 16 }} />}
          onClick={(e) => setSortAnchorEl(e.currentTarget)}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: '12px',
            py: 0.5,
            px: 1.5,
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover',
            },
          }}
        >
          Sort
        </Button>
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={() => setSortAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleSort('date')} sx={{ fontSize: '13px' }}>
            Date
          </MenuItem>
          <MenuItem onClick={() => handleSort('price')} sx={{ fontSize: '13px' }}>
            Price
          </MenuItem>
          <MenuItem onClick={() => handleSort('stage')} sx={{ fontSize: '13px' }}>
            Stage
          </MenuItem>
          <MenuItem onClick={() => handleSort('name')} sx={{ fontSize: '13px' }}>
            Name
          </MenuItem>
        </Menu>

        {/* Filter */}
        <Button
          size="small"
          variant="outlined"
          startIcon={<IconifyIcon icon="material-symbols:filter-list" sx={{ fontSize: 16 }} />}
          endIcon={<IconifyIcon icon="material-symbols:arrow-drop-down" sx={{ fontSize: 16 }} />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: '12px',
            py: 0.5,
            px: 1.5,
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover',
            },
          }}
        >
          Filter
        </Button>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleFilter('all')} sx={{ fontSize: '13px' }}>
            All
          </MenuItem>
          <MenuItem onClick={() => handleFilter('Active')} sx={{ fontSize: '13px' }}>
            Active
          </MenuItem>
          <MenuItem onClick={() => handleFilter('Post EM')} sx={{ fontSize: '13px' }}>
            Post EM
          </MenuItem>
          <MenuItem onClick={() => handleFilter('Inspection Cleared')} sx={{ fontSize: '13px' }}>
            Inspection Cleared
          </MenuItem>
          <MenuItem onClick={() => handleFilter('Ready for Close')} sx={{ fontSize: '13px' }}>
            Ready for Close
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};

export default DealsListHeader;

