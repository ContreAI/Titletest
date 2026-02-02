import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from 'data/crm/deals';
import DealCard from 'components/common/DealCard';
import { useStaggeredAnimationStyle } from 'hooks/useStaggeredAnimation';

interface SortableDealItemProps {
  deal: Deal;
  index?: number;
}

const SortableDealItem = ({ deal, index = 0 }: SortableDealItemProps) => {
  const dealId = deal.id ?? `deal-${Date.now()}-${Math.random()}`;
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: dealId,
    data: {
      type: 'deal',
      deal: deal,
    },
  });

  const animationStyle = useStaggeredAnimationStyle(index, { isDragging });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    ...animationStyle,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard deal={deal} />
    </div>
  );
};

export default SortableDealItem;
