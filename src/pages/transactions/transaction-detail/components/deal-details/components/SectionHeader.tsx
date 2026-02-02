import { Box } from '@mui/material';

interface SectionHeaderProps {
  children: React.ReactNode;
}

// Helper component for section headers
const SectionHeader = ({ children }: SectionHeaderProps) => (
  <Box
    component="h4"
    sx={{
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'text.secondary',
      m: 0,
      mb: 1,
    }}
  >
    {children}
  </Box>
);

export default SectionHeader;

