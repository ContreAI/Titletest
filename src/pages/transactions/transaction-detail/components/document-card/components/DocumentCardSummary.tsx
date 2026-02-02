import { Collapse, Paper, Typography } from '@mui/material';
import { SkeletonText } from 'components/loading';
import Grid from '@mui/material/Grid';

interface DocumentCardSummaryProps {
  summaryContent: string | null | undefined;
  summaryOpen: boolean;
  isFetchingSummary: boolean;
}

const DocumentCardSummary = ({
  summaryContent,
  summaryOpen,
  isFetchingSummary,
}: DocumentCardSummaryProps) => {
  if (!summaryContent) {
    return null;
  }

  return (
    <Grid size={12}>
      <Collapse in={summaryOpen} timeout="auto">
        <Paper
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {isFetchingSummary ? (
            <SkeletonText lines={5} lineHeight={22} spacing={1} />
          ) : (
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.primary',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {summaryContent}
            </Typography>
          )}
        </Paper>
      </Collapse>
    </Grid>
  );
};

export default DocumentCardSummary;

