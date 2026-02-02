import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Paper,
  Stack,
  Typography,
  Box,
  Skeleton,
  alpha,
  useTheme,
  ButtonBase,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { dashboardSpacing } from 'theme/spacing';
import { useDashboardData } from '../../hooks';
import paths from 'routes/paths';
import {
  calculateRiskCounts,
  getDealsWithRisks,
  filterDealsByRiskLevel,
  type RiskLevel,
  type RiskDeal,
} from './risk-utils';

const RISK_CONFIG: Record<RiskLevel, { label: string; icon: string; }> = {
  high: {
    label: 'High Risk',
    icon: 'material-symbols:warning-rounded',
  },
  medium: {
    label: 'Medium Risk',
    icon: 'material-symbols:error-outline-rounded',
  },
  low: {
    label: 'Low Risk',
    icon: 'material-symbols:info-outline-rounded',
  },
};

interface RiskBadgeProps {
  level: RiskLevel;
  count: number;
  expanded: boolean;
  onClick: () => void;
}

const RiskBadge = ({ level, count, expanded, onClick }: RiskBadgeProps) => {
  const theme = useTheme();

  const getColor = () => {
    switch (level) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
    }
  };

  const getBgColor = () => {
    switch (level) {
      case 'high':
        return alpha(theme.palette.error.main, 0.1);
      case 'medium':
        return alpha(theme.palette.warning.main, 0.1);
      case 'low':
        return alpha(theme.palette.info.main, 0.1);
    }
  };

  const color = getColor();
  const bgColor = getBgColor();
  const config = RISK_CONFIG[level];

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: 1,
        borderRadius: 2,
        p: 1.5,
        bgcolor: expanded ? bgColor : 'action.hover',
        border: expanded ? `1px solid ${alpha(color, 0.3)}` : '1px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: bgColor,
        },
      }}
    >
      <Stack alignItems="center" spacing={0.5}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconifyIcon icon={config.icon} sx={{ fontSize: 20, color }} />
        </Box>
        <Typography variant="h4" sx={{ color, fontWeight: 700 }}>
          {count}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          {config.label}
        </Typography>
      </Stack>
    </ButtonBase>
  );
};

const AtRiskDeals = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeDealsWithReports, isLoading } = useDashboardData();
  const [expandedLevel, setExpandedLevel] = useState<RiskLevel | null>(null);

  // Calculate risk statistics
  const riskCounts = useMemo(() => calculateRiskCounts(activeDealsWithReports), [activeDealsWithReports]);
  const dealsWithRisks = useMemo(() => getDealsWithRisks(activeDealsWithReports), [activeDealsWithReports]);

  // Filter deals based on expanded risk level using utility function
  const filteredDeals = useMemo(() => {
    if (!expandedLevel) return [];
    return filterDealsByRiskLevel(dealsWithRisks, expandedLevel);
  }, [dealsWithRisks, expandedLevel]);

  const handleBadgeClick = (level: RiskLevel) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  const handleDealClick = (transactionId: string) => {
    navigate(paths.dealDetails(transactionId));
  };

  const getRiskCountForLevel = (deal: RiskDeal, level: RiskLevel): number => {
    switch (level) {
      case 'high':
        return deal.highRiskCount;
      case 'medium':
        return deal.mediumRiskCount;
      case 'low':
        return deal.lowRiskCount;
    }
  };

  const getExpandedLevelColor = () => {
    if (!expandedLevel) return theme.palette.text.primary;
    switch (expandedLevel) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
    }
  };

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: dashboardSpacing.cardPaddingSm,
          borderRadius: 2,
          bgcolor: 'background.paper',
          height: '100%',
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="text" width="50%" height={28} />
          <Skeleton variant="text" width="30%" height={20} />
          <Stack direction="row" spacing={1}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={100} sx={{ flex: 1 }} />
            ))}
          </Stack>
        </Stack>
      </Paper>
    );
  }

  const hasRisks = riskCounts.total > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: dashboardSpacing.cardPaddingSm,
        borderRadius: 2,
        bgcolor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconifyIcon
              icon="material-symbols:shield-with-heart-rounded"
              sx={{ fontSize: 18, color: 'error.main' }}
            />
          </Box>
          <Typography variant="h3">Risk Overview</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {hasRisks
            ? `${dealsWithRisks.length} deal${dealsWithRisks.length !== 1 ? 's' : ''} with identified risks`
            : 'No risks identified'}
        </Typography>
      </Stack>

      {/* Risk Badges */}
      <Stack direction="row" spacing={1} sx={{ mb: expandedLevel ? 2 : 0 }}>
        <RiskBadge
          level="high"
          count={riskCounts.high}
          expanded={expandedLevel === 'high'}
          onClick={() => handleBadgeClick('high')}
        />
        <RiskBadge
          level="medium"
          count={riskCounts.medium}
          expanded={expandedLevel === 'medium'}
          onClick={() => handleBadgeClick('medium')}
        />
        <RiskBadge
          level="low"
          count={riskCounts.low}
          expanded={expandedLevel === 'low'}
          onClick={() => handleBadgeClick('low')}
        />
      </Stack>

      {/* Expandable Deal List */}
      <Collapse in={expandedLevel !== null && filteredDeals.length > 0}>
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            pt: 1.5,
            mt: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: getExpandedLevelColor(),
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {expandedLevel && RISK_CONFIG[expandedLevel].label} Deals
          </Typography>
          <List disablePadding sx={{ mt: 0.5 }}>
            {filteredDeals.slice(0, 4).map((deal) => (
              <ListItem key={deal.transactionId} disablePadding>
                <ListItemButton
                  onClick={() => handleDealClick(deal.transactionId)}
                  sx={{
                    borderRadius: 1,
                    py: 0.75,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {deal.dealName}
                      </Typography>
                    }
                    sx={{ mr: 1, minWidth: 0 }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: getExpandedLevelColor(),
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {expandedLevel && getRiskCountForLevel(deal, expandedLevel)} issue
                    {expandedLevel && getRiskCountForLevel(deal, expandedLevel) !== 1 ? 's' : ''}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {filteredDeals.length > 4 && (
            <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
              +{filteredDeals.length - 4} more deals
            </Typography>
          )}
        </Box>
      </Collapse>

      {/* Empty State */}
      {!hasRisks && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 2,
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <IconifyIcon
              icon="material-symbols:verified-rounded"
              sx={{ fontSize: 40, color: 'success.main' }}
            />
            <Typography variant="body2" color="text.secondary">
              All deals look healthy
            </Typography>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default AtRiskDeals;
