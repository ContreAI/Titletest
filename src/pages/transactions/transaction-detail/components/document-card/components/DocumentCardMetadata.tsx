import { Chip, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface DocumentCardMetadataProps {
  type: string;
  status: string;
  isAnalyzed: boolean;
}

const DocumentCardMetadata = ({ type, status, isAnalyzed }: DocumentCardMetadataProps) => {
  return (
    <Stack 
      direction={{ xs: 'column', sm: 'row' }} 
      spacing={{ xs: 1, sm: 2 }} 
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      sx={{ flex: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}
    >
      <Stack 
        direction="row" 
        spacing={1} 
        alignItems="center"
        sx={{ 
          flexWrap: 'wrap',
          gap: 0.5,
          minWidth: 0,
        }}
      >
        <IconifyIcon
          icon="material-symbols:description-outline"
          sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }}
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.primary', 
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          Type:
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 400, 
            color: 'text.tertiary',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {type}
        </Typography>
      </Stack>

      <Stack 
        direction="row" 
        spacing={1} 
        alignItems="center"
        sx={{ 
          flexWrap: 'wrap',
          gap: 0.5,
          minWidth: 0,
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.primary', 
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          Status:
        </Typography>
        <Chip
          label={status}
          icon={
            isAnalyzed ? (
              <IconifyIcon icon="material-symbols:check-circle" sx={{ fontSize: 14 }} />
            ) : undefined
          }
          size="small"
          sx={{
            bgcolor: isAnalyzed ? 'success.lighter' : 'action.disabledBackground',
            color: 'text.secondary',
            fontWeight: 600,
            height: 28,
            px: 1.5,
            border: 'none',
            flexShrink: 0,
            '& .MuiChip-label': {
              px: 1,
              fontWeight: 600,
            },
          }}
        />
      </Stack>
    </Stack>
  );
};

export default DocumentCardMetadata;

