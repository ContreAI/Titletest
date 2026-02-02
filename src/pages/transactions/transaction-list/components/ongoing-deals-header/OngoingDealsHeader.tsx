import { useState } from 'react';
import { Button, Stack, Typography, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router';
import IconifyIcon from 'components/base/IconifyIcon';
import type { DealStageName } from 'types/deals';

interface OngoingDealsHeaderProps {
  onSort?: (sortBy: string) => void;
  onFilter?: (filter: DealStageName | 'all') => void;
}

const OngoingDealsHeader = ({ onSort, onFilter }: OngoingDealsHeaderProps) => {
  const navigate = useNavigate();
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);

  const handleNewDeal = () => {
    navigate('/transactions/new');
  };

  const handleSort = (sortBy: string) => {
    onSort?.(sortBy);
    setSortAnchorEl(null);
  };

  const handleFilter = (filter: DealStageName | 'all') => {
    onFilter?.(filter);
    setFilterAnchorEl(null);
  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h3" >
        Ongoing Deals
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Sort by */}
        <Button
          size="small"
          variant="outlined"
          startIcon={<IconifyIcon icon="material-symbols:swap-vert" />}
          endIcon={<IconifyIcon icon="material-symbols:arrow-drop-down" />}
          onClick={(e) => setSortAnchorEl(e.currentTarget)}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            minWidth: 100,
          }}
        >
          Sort by
        </Button>
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={() => setSortAnchorEl(null)}
        >
          <MenuItem onClick={() => handleSort('date')}>Date</MenuItem>
          <MenuItem onClick={() => handleSort('price')}>Price</MenuItem>
          <MenuItem onClick={() => handleSort('stage')}>Stage</MenuItem>
          <MenuItem onClick={() => handleSort('name')}>Name</MenuItem>
        </Menu>

        {/* Filter */}
        <Button
          size="small"
          variant="outlined"
          startIcon={<IconifyIcon icon="material-symbols:filter-list" />}
          endIcon={<IconifyIcon icon="material-symbols:arrow-drop-down" />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            minWidth: 100,
          }}
        >
          Filter
        </Button>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
        >
          <MenuItem onClick={() => handleFilter('all')}>All</MenuItem>
          <MenuItem onClick={() => handleFilter('Active')}>Active</MenuItem>
          <MenuItem onClick={() => handleFilter('Post EM')}>Post EM</MenuItem>
          <MenuItem onClick={() => handleFilter('Inspection Cleared')}>
            Inspection Cleared
          </MenuItem>
          <MenuItem onClick={() => handleFilter('Ready for Close')}>
            Ready for Close
          </MenuItem>
        </Menu>

        {/* New Deal Button */}
        <Button
          size="small"
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add" />}
          onClick={handleNewDeal}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          New Deal
        </Button>

        {/* More Options */}
        <Button
          size="small"
          onClick={(e) => setMoreAnchorEl(e.currentTarget)}
          sx={{
            minWidth: 'auto',
            p: 1,
            borderRadius: 1,
            bgcolor: 'background.elevation1',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'divider',
            },
          }}
        >
          <IconifyIcon icon="material-symbols:more-horiz" sx={{ fontSize: 16, fontWeight: 400, color: 'text.secondary' }} />
        </Button>
        <Menu
          anchorEl={moreAnchorEl}
          open={Boolean(moreAnchorEl)}
          onClose={() => setMoreAnchorEl(null)}
        >
          <MenuItem onClick={() => setMoreAnchorEl(null)}>Export</MenuItem>
          <MenuItem onClick={() => setMoreAnchorEl(null)}>Print</MenuItem>
          <MenuItem onClick={() => setMoreAnchorEl(null)}>Settings</MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
};

export default OngoingDealsHeader;

