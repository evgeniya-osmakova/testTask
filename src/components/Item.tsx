import { dragDirections, Item, Tree } from '../models/models';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core'

enum dragTypes {
  ITEM = 'item',
}

interface DragItemData {
  position: number
  id: number
  parentId: number
}

type ItemCardProps = {
  tree: Tree,
  parentId: number,
  selectedItem: Item  | null,
  selectItem: (x: Item) => void,
  moveItem: ({dragId, hoverId, direction}: {dragId: number, hoverId: number, direction: dragDirections}) => void,
  position: number,
}

const ItemCard: React.FC<ItemCardProps> = ({tree, parentId , selectedItem, selectItem, moveItem, position}) => {
  const {label, id, children} = tree;
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId, isOver, direction }, drop] = useDrop<DragItemData, void, { handlerId: Identifier | null, isOver: boolean, direction: XYCoord | null }>({
    accept: [dragTypes.ITEM],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver({ shallow: true }),
        direction: monitor.getDifferenceFromInitialOffset(),

      }
    },
    drop(item: DragItemData, monitor) {
      if (!ref.current || monitor.didDrop()) {
        return;
      }
      const dragId = item.id;
      const hoverId = id
      // Don't replace items with themselves
      if (dragId === hoverId) {
        return;
      }

      const clientOffset = monitor.getDifferenceFromInitialOffset();
      const direction = (clientOffset && clientOffset.y < 0) ? dragDirections.UP : dragDirections.DOWN;
      moveItem({dragId, hoverId, direction});
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: dragTypes.ITEM,
    item: () => {
      return { id, position, parentId }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref));

  return <div key={id} ref={ref}
              className={(isDragging) ? 'item--dragged' : ''}
              data-handler-id={handlerId}>
    <div className={`item
      ${(selectedItem && id === selectedItem.id) ? 'item--selected' : ''}
      ${(isOver) ? 'item--hovered' : ''}
      ${(isOver && !!(direction && direction.y > 0)) ? 'item--moved-up' : ''}
      ${(isOver && !!(direction && direction.y < 0)) ? 'item--moved-down' : ''}
      `}
      onClick={() => selectItem({label, id, parentId})}>
      {label}
    </div>
    {children && children.map((item, ind) =>
      <div key={item.id} className="item-child">
        <ItemCard tree={item} parentId={id} selectedItem={selectedItem} selectItem={selectItem} moveItem={moveItem} position={ind}/>
      </div>
    )}
  </div>
}

export default ItemCard;
