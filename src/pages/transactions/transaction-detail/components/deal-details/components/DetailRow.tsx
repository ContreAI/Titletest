import { Box } from '@mui/material';

interface DetailRowProps {
  label: string;
  value?: string | null;
}

// Helper component for a single label/value row
const DetailRow = ({ label, value }: DetailRowProps) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 2,
      py: 0.25,
    }}
  >
    <Box
      component="dt"
      sx={{
        fontSize: '12px',
        color: 'text.secondary',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
    </Box>
    <Box
      component="dd"
      sx={{
        fontSize: '12px',
        color: 'text.primary',
        textAlign: 'right',
        m: 0,
      }}
    >
      {value || '—'}
    </Box>
  </Box>
);

export default DetailRow;

