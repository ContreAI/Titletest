import Stack from '@mui/material/Stack';
import { Deal } from 'data/crm/deals';
import { dashboardSpacing } from 'theme/spacing';
// AddNewDeal import removed - currently commented out in JSX
import SortableDealItem from '../deal-card/SortableDealItem';

interface DealsItemsProps {
  listId: string;
  deals: Deal[];
}

const DealItems = ({ listId: _listId, deals }: DealsItemsProps) => {
  return (
    <Stack direction="column" sx={{ gap: dashboardSpacing.contentGapSm, p: dashboardSpacing.contentGapSm, pb: dashboardSpacing.cardPaddingSm }}>
      {deals.map((item, index) => (
        <SortableDealItem key={item.id} deal={item} index={index} />
      ))}
      {/* <AddNewDeal listId={listId} /> */}
    </Stack>
  );
};

export default DealItems;
