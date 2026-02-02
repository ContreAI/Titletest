import { Box, Typography, IconButton } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface DocumentReportDrawerHeaderProps {
  onClose: () => void;
}

const DocumentReportDrawerHeader = ({ onClose }: DocumentReportDrawerHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 1.5, sm: 2 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            fontWeight: 600,
            color: 'text.primary',
            lineHeight: 1.2,
          }}
        >
          Document Report
        </Typography>
        
      </Box>
      <IconButton
        onClick={onClose}
        size="small"
        aria-label="Close drawer"
        sx={{
          width: { xs: 32, sm: 36 },
          height: { xs: 32, sm: 36 },
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'text.primary',
          },
        }}
      >
        <IconifyIcon icon="mdi:close" width={20} height={20} />
      </IconButton>
    </Box>
  );
};

export default DocumentReportDrawerHeader;

