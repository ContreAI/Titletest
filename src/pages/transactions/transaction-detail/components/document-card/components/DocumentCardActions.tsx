import { Button, Stack } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface DocumentCardActionsProps {
  hasSummary: boolean;
  summaryOpen: boolean;
  onViewSummary: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  disableDelete?: boolean; // Disable delete when any document is processing
}

const DocumentCardActions = ({
  hasSummary,
  summaryOpen,
  onViewSummary,
  onDownload,
  onDelete,
  isDeleting = false,
  disableDelete = false,
}: DocumentCardActionsProps) => {
  return (
    <Stack 
      direction="row" 
      spacing={1}
      sx={{
        flexWrap: 'wrap',
        gap: 1,
        width: { xs: '100%', md: 'auto' },
        justifyContent: { xs: 'flex-start', md: 'flex-end' },
      }}
    >
      {/* Summary Button - Desktop */}
      {hasSummary && (
        <Button
          variant="contained"
          size="small"
          color="info"
          onClick={onViewSummary}
          startIcon={<IconifyIcon icon="material-symbols:summarize-outline" sx={{ fontSize: 18 }} />}
          sx={{
            borderRadius: 1,
            flexShrink: 0,
            display: { xs: 'none', sm: 'inline-flex' },
          }}
        >
          {summaryOpen ? 'Hide' : 'View'} Summary
        </Button>
      )}
      
      {/* Summary Button - Mobile (icon only) */}
      {hasSummary && (
        <Button
          variant="contained"
          size="small"
          color="info"
          onClick={onViewSummary}
          sx={{
            minWidth: 'auto',
            p: 1,
            borderRadius: 1,
            flexShrink: 0,
            display: { xs: 'inline-flex', sm: 'none' },
          }}
        >
          <IconifyIcon icon="material-symbols:summarize-outline" sx={{ fontSize: 20 }} />
        </Button>
      )}
      
      <Button
        variant="contained"
        size="small"
        color="secondary"
        onClick={onDownload}
        sx={{
          minWidth: 'auto',
          p: 1,
          borderRadius: 1,
          flexShrink: 0,
        }}
      >
        <IconifyIcon icon="material-symbols:download" sx={{ fontSize: 20 }} />
      </Button>
      <Button
        variant="contained"
        color="error"
        size="small"
        onClick={onDelete}
        disabled={isDeleting || disableDelete}
        sx={{
          minWidth: 'auto',
          p: 1,
          borderRadius: 1,
          flexShrink: 0,
        }}
      >
        <IconifyIcon
          icon="material-symbols:delete-outline"
          sx={{ fontSize: 20 }}
        />
      </Button>
    </Stack>
  );
};

export default DocumentCardActions;

