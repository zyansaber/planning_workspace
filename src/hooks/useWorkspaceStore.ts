import { useState, useEffect } from 'react';
import { WorkspaceItem } from '@/types/workspace';
import { database } from '@/lib/firebase';
import { ref, push, set, remove, onValue, off, update } from 'firebase/database';

const sortWorkspaces = (a: WorkspaceItem, b: WorkspaceItem) => {
  const orderDifference = (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
  return orderDifference || a.createdAt.getTime() - b.createdAt.getTime();
};

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
        setItems(workspaceItems.sort(sortWorkspaces));
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
    const siblingItems = items.filter(existingItem => (existingItem.parentId || 'none') === (item.parentId || 'none'));
    const newItem = {
      ...item,
      order: siblingItems.length,
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

  const moveItem = async (id: string, direction: 'forward' | 'backward') => {
    const item = items.find(workspaceItem => workspaceItem.id === id);
    if (!item) return;

    const siblings = items
      .filter(workspaceItem => (workspaceItem.parentId || 'none') === (item.parentId || 'none'))
      .sort(sortWorkspaces);
    const currentIndex = siblings.findIndex(workspaceItem => workspaceItem.id === id);
    const targetIndex = direction === 'forward' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= siblings.length) return;

    const reordered = [...siblings];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
    const orderUpdates = Object.fromEntries(
      reordered.map((workspaceItem, index) => [`workspaces/${workspaceItem.id}/order`, index])
    );
    await update(ref(database), orderUpdates);
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    moveItem
  };
};
