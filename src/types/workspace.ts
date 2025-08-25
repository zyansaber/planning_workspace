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
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  estimatedCompletionTime: string;
  progress: number; // 0-100
  timeSpent: number; // in minutes
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface WorkspaceStore {
  items: WorkspaceItem[];
  addItem: (item: Omit<WorkspaceItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, item: Partial<WorkspaceItem>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => WorkspaceItem | undefined;
}