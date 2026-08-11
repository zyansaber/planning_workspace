export interface WorkspaceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'external' | 'embed' | 'nested';
  icon?: string;
  color?: string;
  parentId?: string;
  childrenIds?: string[];
  order?: number;
  createdAt: Date;
}

export interface WorkspaceStore {
  items: WorkspaceItem[];
  addItem: (item: Omit<WorkspaceItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, item: Partial<WorkspaceItem>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => WorkspaceItem | undefined;
  moveItem: (id: string, direction: 'forward' | 'backward') => Promise<void>;
}
