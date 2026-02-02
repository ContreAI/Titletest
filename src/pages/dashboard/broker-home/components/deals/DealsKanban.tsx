import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useDealsContext } from 'providers/DealsProvider';
import KanbanElements from './KanbanElements';

const DealsKanban = () => {
  const { handleDragStart, handleDragOver, handleDragEnd } = useDealsContext();
  const { up } = useBreakpoints();
  const upMd = up('md');

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 8,
    },
  });

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      delay: 150,
      distance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(
    upMd ? pointerSensor : touchSensor,
    keyboardSensor
  );

  const dndContextProps = {
    collisionDetection: closestCorners,
    onDragStart: (event: DragStartEvent) => handleDragStart(event),
    onDragOver: (event: DragOverEvent) => handleDragOver(event),
    onDragEnd: (event: DragEndEvent) => handleDragEnd(event),
  };

  return (
    <DndContext sensors={sensors} {...dndContextProps}>
      <KanbanElements />
    </DndContext>
  );
};

export default DealsKanban;
