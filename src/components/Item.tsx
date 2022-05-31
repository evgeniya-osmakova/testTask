import { DragItem, HoverItem, Item, Tree } from '../models/models';
import React, { Fragment, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core'

interface DragItemData {
  position: number
  id: string
  type: string
  parentId: number
}

enum dragTypes {
  ITEM = 'item',
}

type ItemCardProps = {
  tree: Tree,
  parentId: number,
  selectedItem: Item  | null,
  selectItem: (x: Item) => void,
  moveItem: (dragItem: DragItem, hoverItem: HoverItem) => void,
  position: number,
}

const ItemCard: React.FC<ItemCardProps> = ({tree, parentId , selectedItem, selectItem, moveItem, position}) => {
  const {label, id, index, children} = tree;
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop<DragItemData, void, { handlerId: Identifier | null }>({
    accept: [dragTypes.ITEM],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItemData, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.position;
      const dragParentId = item.parentId;
      const hoverParentId = parentId;
      const hoverIndex = position
      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragParentId === hoverParentId) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      const dragItem = { dragIndex, dragParentId};
      const hoverItem = { hoverIndex, hoverParentId };
      moveItem(dragItem, hoverItem);
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: dragTypes.ITEM,
    item: () => {
      return { id, position, parentId }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  return <Fragment key={id}>
    <div className={`item ${(selectedItem && id === selectedItem.id) ? 'item--selected' : ''}`}
         ref={ref}
         style={{ opacity }}
         data-handler-id={handlerId}
         onClick={() => selectItem({label, id, parentId, index})}>
      {label}
    </div>
    {children && children.map((item, ind) =>
      <div key={item.id} className="item-child">
        <ItemCard tree={item} parentId={id} selectedItem={selectedItem} selectItem={selectItem} moveItem={moveItem} position={ind}/>
      </div>
    )}
  </Fragment>
}

export default ItemCard;
