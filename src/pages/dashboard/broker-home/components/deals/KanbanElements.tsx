import { createPortal } from 'react-dom';
import { Box } from '@mui/material';
import { DragOverlay } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDealsContext } from 'providers/DealsProvider';
import EmptyState from 'components/base/EmptyState';
import { EmptyDealsIllustration } from 'components/base/EmptyStateIllustrations';
import { SET_CREATE_DEAL_DIALOG } from 'reducers/DealsReducer';
// AddNewList import removed - currently commented out in JSX
import SortableListItem from './list-container/SortableListItem';
import DealCardOverlay from './overlays/DealCardOverlay';
import ListContainerOverlay from './overlays/ListContainerOverlay';

const KanbanElements = () => {
  const { listItems, draggedList, draggedDeal, dealsDispatch } = useDealsContext();

  const totalDeals = listItems.reduce((sum, list) => sum + list.deals.length, 0);
  const hasNoDeals = totalDeals === 0;

  if (hasNoDeals) {
    return (
      <Box sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon={<EmptyDealsIllustration />}
          title="No deals yet"
          description="Create your first deal to start tracking your pipeline and managing opportunities."
          action={{
            label: 'Create Deal',
            onClick: () => dealsDispatch({ type: SET_CREATE_DEAL_DIALOG, payload: { isOpen: true } }),
          }}
        />
      </Box>
    );
  }

  return (
    <>
      <SortableContext items={listItems} strategy={horizontalListSortingStrategy}>
        {listItems.map((item) => (
          <SortableListItem key={item.id} dealList={item} />
        ))}
        {/* <AddNewList /> */}
      </SortableContext>
      {createPortal(
        <DragOverlay>
          {draggedList && <ListContainerOverlay dealList={draggedList} />}
          {draggedDeal && <DealCardOverlay deal={draggedDeal} />}
        </DragOverlay>,
        document.body,
      )}
    </>
  );
};

export default KanbanElements;
