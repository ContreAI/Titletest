import { Box, Stack, Button } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface DocumentReportDrawerFooterProps {
  onClose: () => void;
  onCopyReport: () => void;
}

const DocumentReportDrawerFooter = ({ onClose, onCopyReport }: DocumentReportDrawerFooterProps) => {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 1.5, sm: 2 },
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        justifyContent={{ xs: 'flex-end', sm: 'flex-end' }}
        flexWrap="wrap"
        sx={{ gap: 1 }}
      >
        <Button
          variant="outlined"
          size="medium"
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            px: { xs: 2, sm: 2.5 },
            py: { xs: 0.75, sm: 1 },
            minWidth: { xs: 80, sm: 100 },
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover',
              color: 'text.primary',
            },
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={onCopyReport}
          startIcon={<IconifyIcon icon="mdi:content-copy" width={16} height={16} />}
          sx={{
            textTransform: 'none',
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            px: { xs: 2, sm: 2.5 },
            py: { xs: 0.75, sm: 1 },
            minWidth: { xs: 140, sm: 160 },
            bgcolor: 'success.dark',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: 'success.darker',
              boxShadow: 'none',
            },
          }}
        >
          Copy to clipboard
        </Button>
      </Stack>
    </Box>
  );
};

export default DocumentReportDrawerFooter;

