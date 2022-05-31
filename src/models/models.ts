export interface LoadedData {
  files: {
    "view.json": {
      content: string;
    }
  }
}
export type Entity = {
  labels: string[],
  entityLongIds: number[],
  parentEntityLongIds: number[]
}

export type Tree = {
  label: string;
  id: number;
  index: number;
  children?: Tree[];
};

export type Item = {
  label: string,
  id: number,
  parentId: number | null,
  index: number
}

export type DragItem = { dragIndex: number, dragParentId: number };
export type HoverItem = { hoverIndex: number, hoverParentId: number };
