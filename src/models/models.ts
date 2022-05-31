export interface Item {
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
