export interface LoadedData {
  files: {
    'view.json': {
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
  children?: Tree[];
};

export type Item = {
  label: string,
  id: number,
  parentId: number | null,
}

export enum dragDirections {
  DOWN = 'down',
  UP = 'up',
}
