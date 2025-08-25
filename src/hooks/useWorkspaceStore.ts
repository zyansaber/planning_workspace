import { useState, useEffect } from 'react';
import { WorkspaceItem } from '@/types/workspace';
import { database } from '@/lib/firebase';
import { ref, push, set, remove, onValue, off } from 'firebase/database';

export const useWorkspaceStore = () => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data from Firebase
  useEffect(() => {
    const workspacesRef = ref(database, 'workspaces');
    
    const unsubscribe = onValue(workspacesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const workspaceItems: WorkspaceItem[] = Object.entries(data).map(([key, value]: [string, unknown]) => ({
          id: key,
          ...(value as Omit<WorkspaceItem, 'id'>),
          createdAt: new Date((value as { createdAt: string }).createdAt)
        }));
        setItems(workspaceItems.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
      } else {
        setItems([]);
      }
      setLoading(false);
    });

    return () => {
      off(workspacesRef, 'value', unsubscribe);
    };
  }, []);

  const saveToFirebase = async (itemData: Omit<WorkspaceItem, 'id'>, id?: string) => {
    const workspacesRef = ref(database, 'workspaces');
    
    if (id) {
      // Update existing item
      const itemRef = ref(database, `workspaces/${id}`);
      await set(itemRef, itemData);
    } else {
      // Add new item
      await push(workspacesRef, itemData);
    }
  };

  const addItem = async (item: Omit<WorkspaceItem, 'id' | 'createdAt'>) => {
    const newItem = {
      ...item,
      createdAt: new Date().toISOString()
    };
    await saveToFirebase(newItem);
  };

  const updateItem = async (id: string, updates: Partial<WorkspaceItem>) => {
    const existingItem = items.find(item => item.id === id);
    if (existingItem) {
      const updatedItem = {
        ...existingItem,
        ...updates,
        createdAt: existingItem.createdAt.toISOString()
      };
      await saveToFirebase(updatedItem, id);
    }
  };

  const deleteItem = async (id: string) => {
    const itemRef = ref(database, `workspaces/${id}`);
    await remove(itemRef);
  };

  const getItem = (id: string) => {
    return items.find(item => item.id === id);
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getItem
  };
};