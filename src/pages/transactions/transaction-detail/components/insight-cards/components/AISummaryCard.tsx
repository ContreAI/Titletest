import { Box, Typography, Stack, Button, useTheme } from '@mui/material';
import ExpandableCard from 'components/base/ExpandableCard';

interface AISummaryCardProps {
  aiSummaryData: {
    fullAiSummary: string;
    formattedPrice: string;
    formattedClosingDate: string;
    earnestSummary: string;
  };
  onCopySummary: () => void;
}

const AISummaryCard = ({ aiSummaryData, onCopySummary }: AISummaryCardProps) => {
  const theme = useTheme();

  // Check if we have a real AI summary (not the placeholder message)
  const hasAiSummary = aiSummaryData.fullAiSummary &&
    !aiSummaryData.fullAiSummary.includes('No AI summary available');

  return (
    <ExpandableCard
      title="AI Summary"
      subtitle="Plain-language overview of this transaction"
      icon="mdi:sparkles"
      iconBgColor={theme.palette.success.main}
      expandedContent={
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            {aiSummaryData.fullAiSummary}
          </Typography>
          {hasAiSummary && (
            <Button
              variant="outlined"
              size="small"
              onClick={onCopySummary}
              sx={{
                mt: 2,
                textTransform: 'none',
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'text.secondary',
                  bgcolor: 'action.hover',
                },
              }}
            >
              Copy full summary
            </Button>
          )}
        </Box>
      }
    >
      <Stack spacing={0.75}>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Price:
          </Box>{' '}
          {aiSummaryData.formattedPrice}
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Closing:
          </Box>{' '}
          {aiSummaryData.formattedClosingDate}
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Earnest money:
          </Box>{' '}
          {aiSummaryData.earnestSummary}
        </Typography>
      </Stack>
    </ExpandableCard>
  );
};

export default AISummaryCard;

