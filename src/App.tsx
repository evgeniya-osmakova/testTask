import './App.css';
import { useEffect, useState, Fragment, useCallback } from 'react';
import { getItems } from './api/items';
import { Entity, Tree } from './models/models';
import useRequest from './hooks/useRequest';

function App() {
  const { data, loading, error, refetch } = useRequest(getItems);
  const [items, setItems] = useState<Tree[]>([]);
  const [selectedItem, setSelectedItem] = useState<null | {label: string, id: number, parentId: number | null, index: number}>(null);

  const prepareData = useCallback(({ labels, entityLongIds, parentEntityLongIds }: Entity) => {
    const ids = entityLongIds.map((id) => ({id, checked: false}));
    const parents: number[] = [];
    let tree = parentEntityLongIds.reduce((acc, id, ind) => {
      if (id === -1) {
        const itemId = entityLongIds[ind]
        ids[ind].checked = true;
        parents.push(itemId);
        return [...acc, {label: labels[ind], id: itemId, index: ind}]
      }
      return acc;
    }, [] as Tree[]);

    const checkData = () => {
      ids.forEach(({id, checked}, ind) => {
        const parent = parentEntityLongIds[ind];
        if (!checked && parents.includes(parent)) {
          ids[ind].checked = true;
          parents.push(id);

          const changeTree = (treeArr: Tree[]): Tree[] => {
            return treeArr.map((item) => {
              const {children} = item;
              if (item.id === parent) {
                const newChild = {label: labels[ind], id, index: ind};
                const childrenData = (children) ? [...children, newChild] : [newChild]
                return {...item, children: childrenData}
              }
              if (children) {
                return {...item, children: changeTree(children)};
              }
              return item;
            });
          };

          tree = changeTree(tree);
        }
      });

      const unchecked = ids.filter(({checked}) => !checked);

      if (unchecked.length > 0) {
        checkData();
      }
    };

    checkData();

    return tree;
  }, []);

  useEffect(() => {
    if (data && items.length === 0) {
      const entityLabelPages = JSON.parse(data.files['view.json'].content).entityLabelPages[0];
      const preparedData = prepareData(entityLabelPages);
      if (!preparedData) {
        return;
      }
      setItems(preparedData);
    }
  }, [data, prepareData, items]);

  if (error && !loading) {
    return <div>Ошибка при загрузке данных</div>
  }

  const selectItem = ({label, id, parent, index}: {label :string, id :number, parent :number, index :number}) => {
    setSelectedItem({label, id, parentId: parent, index});
  };

  const removeItem = () => {
    if (!selectedItem) {
      return;
    }
    const newItems = items.reduce((acc, item) => {
      const removeChildren = (currentAcc: Tree[], currentItem: Tree): Tree[] => {
        if (currentItem.id === selectedItem.id) {
          return currentAcc;
        }
        if (currentItem.children) {
          return [...currentAcc, { ...currentItem, children: currentItem.children.reduce((childrenAcc, child) => {
            return removeChildren(childrenAcc, child);
          }, [] as Tree[])}];
        }
        return [...currentAcc, currentItem];
      }
      return removeChildren(acc, item);
    }, [] as Tree[]);

    setItems(newItems);
    setSelectedItem(null);
  }

  const showTree = () => {
    console.log(items);
  }

  const renderItem = ({label, id, index, children}: Tree, parent = -1): JSX.Element => {
    return <Fragment key={id}>
      <div className={`item ${(selectedItem && id === selectedItem.id) ? 'item--selected' : ''}`} onClick={() => selectItem({label, id, parent, index})}>{label}</div>
      {children && children.map((item) =>
        <div key={item.id} className="item-child">
          {renderItem(item, id)}
        </div>
      )}
    </Fragment>
  }

  return <main>
    <div className="flex-container">
      <div className="block">
        {items.length === 0 && loading && <p>...loading</p>}
        {items.map((item) =>
          renderItem(item)
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
      <button className="btn" disabled={loading} onClick={refetch}>Refresh</button>
      <button className="btn" disabled={loading || !selectedItem} onClick={removeItem}>Remove</button>
      <button className="btn" disabled={loading} onClick={showTree}>Apply</button>
    </div>
  </main>;
}

export default App;
