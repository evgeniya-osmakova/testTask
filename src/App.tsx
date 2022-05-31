import './App.css';
import { useEffect, useState, useCallback } from 'react';
import { getItems } from './api/items';
import { dragDirections, Entity, Item, Tree } from './models/models';
import useRequest from './hooks/useRequest';
import ItemCard from './components/Item';
import { addItemToTree, createTree, removeItemFromTree } from './helpers/treeModifiers';

type TreeProps = {
  loading: boolean,
  items: Tree[],
  selectedItem: null | Item,
  selectItem: ({label, id, parentId}: Item) => void,
  moveItem: ({dragId, hoverId, direction}: {dragId: number, hoverId: number, direction: dragDirections}) => void,
  btnsActions: {
    refresh: () => void,
    showTree: () => void,
    removeItem: () => void,
  }
}

const TreeDom: React.FC<TreeProps> = ({loading, items, btnsActions, selectedItem, moveItem,  selectItem }) => {
  const { refresh, removeItem, showTree } = btnsActions;

  return <main>
    <div className="flex-container">
      <div className="block">
        {items.length === 0 && loading && <p>...loading</p>}
        {items.map((item, ind) =>
          <ItemCard key={item.id} tree={item} parentId={-1} selectedItem={selectedItem} selectItem={selectItem} moveItem={moveItem} position={ind}/>
        )}
      </div>
      <div className="block">
        {selectedItem && <>
          <div>label: {selectedItem.label}</div>
          <div>id: {selectedItem.id}</div>
          <div>parentId: {selectedItem.parentId}</div>
        </>
        }
      </div>
    </div>
    <div className="flex-container btns-section">
      <button className="btn" disabled={loading} onClick={refresh}>Refresh</button>
      <button className="btn" disabled={loading || !selectedItem} onClick={removeItem}>Remove</button>
      <button className="btn" disabled={loading} onClick={showTree}>Apply</button>
    </div>
  </main>;
}

function App() {
  const { data, loading, error, refetch } = useRequest(getItems);
  const [items, setItems] = useState<Tree[]>([]);
  const [selectedItem, setSelectedItem] = useState<null | Item>(null);

  const prepareData = useCallback(({ labels, entityLongIds, parentEntityLongIds }: Entity) => {
    return createTree({entityLongIds, parentEntityLongIds, labels});
  }, []);

  useEffect(() => {
    if (data) {
      const entityLabelPages = JSON.parse(data.files['view.json'].content).entityLabelPages[0];
      const preparedData = prepareData(entityLabelPages);
      if (!preparedData) {
        return;
      }
      setItems(preparedData);
    }
  }, [data, prepareData]);

  const moveItem = useCallback(({dragId, hoverId, direction}: {dragId: number, hoverId: number, direction: dragDirections}) => {
    const { newTree, deletedBlock } = removeItemFromTree({tree: items, selectedItemId: dragId});
    const updatedTree = addItemToTree({tree: newTree, newBlock: deletedBlock as Tree, selectedItemId: hoverId, direction});
    setItems(updatedTree);
  }, [items]);

  if (error && !loading) {
    return <div>Ошибка при загрузке данных</div>;
  }

  const selectItem = ({ label, id, parentId }: Item) => {
    setSelectedItem({ label, id, parentId });
  };

  const removeItem = () => {
    if (!selectedItem) {
      return;
    }
    const { newTree } = removeItemFromTree({tree: items, selectedItemId: selectedItem.id});
    setItems(newTree);
    setSelectedItem(null);
  }

  const showTree = () => {
    console.log(items);
  }

  const refresh = () => {
    refetch();
    setSelectedItem(null);
  }

  return <TreeDom loading={loading} items={items} btnsActions={{refresh, removeItem, showTree}}
               selectedItem={selectedItem} moveItem={moveItem} selectItem={selectItem}/>
}
export default App;
