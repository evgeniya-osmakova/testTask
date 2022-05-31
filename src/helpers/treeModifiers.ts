import { dragDirections, Entity, Tree } from '../models/models';

export const createTree = ({entityLongIds, parentEntityLongIds, labels}: Entity) => {
  const ids = entityLongIds.map((id) => ({id, checked: false}));
  const parents: number[] = [];
  let tree = parentEntityLongIds.reduce((acc, id, ind) => {
    if (id === -1) {
      const itemId = entityLongIds[ind]
      ids[ind].checked = true;
      parents.push(itemId);
      return [...acc, {label: labels[ind], id: itemId}]
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
              const newChild = { label: labels[ind], id };
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
}

export const removeItemFromTree = ({tree, selectedItemId}: {tree: Tree[], selectedItemId: number}) => {
  let deletedBlock: unknown = [];
  const newTree =  tree.reduce((acc, item) => {
    const removeChildren = (currentAcc: Tree[], currentItem: Tree): Tree[] => {
      if (currentItem.id === selectedItemId) {
        deletedBlock = currentItem;
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
  return {deletedBlock, newTree};
}

export const addItemToTree = ({tree, newBlock, selectedItemId, direction}: {tree: Tree[], newBlock: Tree, selectedItemId: number, direction: dragDirections}) => {
  return tree.reduce((acc, item) => {
    const addBlock = (currentAcc: Tree[], currentItem: Tree): Tree[] => {
      if (currentItem.id === selectedItemId) {
        if (direction === dragDirections.UP) {
          return [ ...currentAcc, newBlock, currentItem ];
        }
        return [ ...currentAcc, currentItem, newBlock ];
      }
      if (currentItem.children) {
        return [...currentAcc, { ...currentItem, children: currentItem.children.reduce((childrenAcc, child) => {
          return addBlock(childrenAcc, child);
        }, [] as Tree[])}];
      }
      return [...currentAcc, currentItem];
    }
    return addBlock(acc, item);
  }, [] as Tree[]);
}
