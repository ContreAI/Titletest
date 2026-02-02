import { Box, Typography, Stack, useTheme } from '@mui/material';
import ExpandableCard from 'components/base/ExpandableCard';

interface Risk {
  id: string;
  description: string;
}

interface RisksAlertsCardProps {
  riskAlerts: Array<{ level: 'high' | 'medium' | 'low'; count: number }>;
  groupedRisks: {
    high: Risk[];
    medium: Risk[];
    low: Risk[];
  };
  topRisk: { id: string; title: string } | undefined;
}

const RisksAlertsCard = ({ riskAlerts, groupedRisks, topRisk }: RisksAlertsCardProps) => {
  const theme = useTheme();

  return (
    <ExpandableCard
      title="Risks & Alerts"
      subtitle="Issues detected across all documents"
      icon="mdi:alert-circle-outline"
      iconBgColor={theme.palette.warning.main}
      expandedContent={
        <Stack spacing={2}>
          {groupedRisks.high.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main', mb: 0.5 }}>
                High risk
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {groupedRisks.high.map((risk) => (
                  <Box component="li" key={risk.id} sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {risk.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {groupedRisks.medium.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.text', mb: 0.5 }}>
                Medium risk
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {groupedRisks.medium.map((risk) => (
                  <Box component="li" key={risk.id} sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {risk.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {groupedRisks.low.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                Low risk
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {groupedRisks.low.map((risk) => (
                  <Box component="li" key={risk.id} sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {risk.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {groupedRisks.high.length === 0 &&
            groupedRisks.medium.length === 0 &&
            groupedRisks.low.length === 0 &&
            riskAlerts.every((r) => r.count === 0) && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No risks detected in this transaction.
              </Typography>
            )}
          {groupedRisks.high.length === 0 &&
            groupedRisks.medium.length === 0 &&
            groupedRisks.low.length === 0 &&
            riskAlerts.some((r) => r.count > 0) && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Risk details are being analyzed. Check back soon for more information.
              </Typography>
            )}
        </Stack>
      }
    >
      <Stack spacing={0.75}>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {riskAlerts[0]?.count || 0}
          </Box>{' '}
          high <Box component="span" sx={{ color: 'text.disabled' }}>·</Box>{' '}
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {riskAlerts[1]?.count || 0}
          </Box>{' '}
          medium <Box component="span" sx={{ color: 'text.disabled' }}>·</Box>{' '}
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {riskAlerts[2]?.count || 0}
          </Box>{' '}
          low
        </Typography>
        {topRisk && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            • {topRisk.title}
          </Typography>
        )}
        {!topRisk && riskAlerts.every((r) => r.count === 0) && (
          <Typography variant="caption" sx={{ color: 'success.main' }}>
            No risks detected
          </Typography>
        )}
      </Stack>
    </ExpandableCard>
  );
};

export default RisksAlertsCard;

