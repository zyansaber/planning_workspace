import { useState, useEffect } from 'react';
import { ref, push, set, remove, onValue, off, orderByChild, query } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Task } from '@/types/workspace';

export const useTaskStore = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tasksRef = ref(database, 'tasks');
    
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksData: Task[] = Object.entries(data).map(([key, value]: [string, unknown]) => ({
          id: key,
          ...(value as Omit<Task, 'id'>),
        }));
        // Sort by createdAt desc
        tasksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTasks(tasksData);
      } else {
        setTasks([]);
      }
      setLoading(false);
    });

    return () => {
      off(tasksRef, 'value', unsubscribe);
    };
  }, []);

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const tasksRef = ref(database, 'tasks');
      await push(tasksRef, {
        ...taskData,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const existingTask = tasks.find(task => task.id === id);
      if (existingTask) {
        const taskRef = ref(database, `tasks/${id}`);
        const updatedTask = { ...existingTask, ...updates };
        await set(taskRef, updatedTask);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const taskRef = ref(database, `tasks/${id}`);
      await remove(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const updateProgress = async (id: string, progress: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      let status = task.status;
      if (progress === 100) {
        status = 'completed';
      } else if (progress > 0) {
        status = 'in-progress';
      } else {
        status = 'todo';
      }

      await updateTask(id, { progress, status });
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const addTimeSpent = async (id: string, minutes: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      await updateTask(id, { 
        timeSpent: task.timeSpent + minutes 
      });
    } catch (error) {
      console.error('Error adding time:', error);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    updateProgress,
    addTimeSpent,
  };
};