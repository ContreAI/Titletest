import { Box, Tab, Tabs } from '@mui/material';

interface ActivityTabsProps {
  activeTab: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const ActivityTabs = ({ activeTab, onChange }: ActivityTabsProps) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
      <Tabs value={activeTab} onChange={onChange}>
        <Tab label="Activities" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Notes" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>
    </Box>
  );
};

export default ActivityTabs;

