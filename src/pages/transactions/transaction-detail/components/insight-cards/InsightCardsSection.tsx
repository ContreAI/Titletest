import { Grid } from '@mui/material';
import { AISummaryCard, RisksAlertsCard } from './components';

interface InsightCardsSectionProps {
  aiSummaryData: {
    fullAiSummary: string;
    formattedPrice: string;
    formattedClosingDate: string;
    earnestSummary: string;
  };
  riskAlerts: Array<{ level: 'high' | 'medium' | 'low'; count: number }>;
  groupedRisks: {
    high: Array<{ id: string; description: string }>;
    medium: Array<{ id: string; description: string }>;
    low: Array<{ id: string; description: string }>;
  };
  topRisk: { id: string; title: string } | undefined;
  onCopySummary: () => void;
}

const InsightCardsSection = ({
  aiSummaryData,
  riskAlerts,
  groupedRisks,
  topRisk,
  onCopySummary,
}: InsightCardsSectionProps) => {
  return (
    <Grid size={12} sx={{ px: 2 }}>
      <Grid container spacing={2}>
        {/* AI Summary Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AISummaryCard aiSummaryData={aiSummaryData} onCopySummary={onCopySummary} />
        </Grid>

        {/* Risks & Alerts Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <RisksAlertsCard riskAlerts={riskAlerts} groupedRisks={groupedRisks} topRisk={topRisk} />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default InsightCardsSection;
