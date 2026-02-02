import { Pagination, Stack, IconButton } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface BillingPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const BillingPagination = ({ page, totalPages, onPageChange }: BillingPaginationProps) => {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
      sx={{
        fontFamily: (theme) => theme.typography.fontFamily,
      }}
    >
      <IconButton
        size="small"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <IconifyIcon icon="material-symbols:chevron-left" />
      </IconButton>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        size="small"
        sx={{
          '& .MuiPaginationItem-root': {
            fontFamily: (theme) => theme.typography.fontFamily,
          },
        }}
      />
      <IconButton
        size="small"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <IconifyIcon icon="material-symbols:chevron-right" />
      </IconButton>
    </Stack>
  );
};

export default BillingPagination;

