import { useMemo } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useSettingsContext } from 'providers/SettingsProvider';
import ReactEchart from 'components/base/ReactEchart';
import { useDealStages } from 'modules/dealStages';

echarts.use([TooltipComponent, GridComponent, PieChart, CanvasRenderer, LegendComponent]);

interface LeadSourceData {
  name: string;
  value: number;
}

interface LeadSourcesDonutChartProps {
  data: LeadSourceData[];
  total: number;
}

const LeadSourcesDonutChart = ({ data, total }: LeadSourcesDonutChartProps) => {
  const theme = useTheme();
  const { getThemeColor } = useSettingsContext();
  const { getStageColor } = useDealStages();

  const chartOptions = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: getThemeColor(theme.vars.palette.background.paper),
        borderColor: getThemeColor(theme.vars.palette.divider),
        textStyle: {
          color: getThemeColor(theme.vars.palette.text.primary),
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['60%', '85%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          data: data.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: getStageColor(item.name),
            },
          })),
        },
      ],
    }),
    [data, theme.vars.palette, getThemeColor, getStageColor],
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: 170, height: 170 }}>
        <ReactEchart echarts={echarts} option={chartOptions} style={{ height: 170, width: 170 }} />
        <Stack
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {total}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default LeadSourcesDonutChart;
